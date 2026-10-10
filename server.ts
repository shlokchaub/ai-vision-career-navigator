import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { PDFParse } from 'pdf-parse';
import {
  generateHeuristicAnalysis,
  generateHeuristicCareerMatches,
  generateFallbackInterviewQuestions,
  generateFallbackInterviewFeedback,
  generateFallbackInterviewSummary,
  generateFallbackRoadmap,
  generateFallbackCareerTwin,
  matchStartupsWithFallback,
} from './src/server/fallbackEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with generous limit for base64 resumes
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured. Please ensure it is set in AI Studio Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Clean JSON helper
function cleanJsonOutput(raw: string): string {
  let s = raw.trim();
  if (s.startsWith('```json')) {
    s = s.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (s.startsWith('```')) {
    s = s.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return s.trim();
}

// Format friendly error messages
function formatErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.error?.message) return parsed.error.message;
    } catch {}
    return error.message;
  }
  return 'An unexpected error occurred.';
}

// Retry wrapper with timeout race for transient API issues (e.g. 503 high demand or 429)
async function callGeminiWithRetry<T>(fn: () => Promise<T>, timeoutMs = 10000, retries = 2): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      let timer: NodeJS.Timeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Gemini API call timed out after ' + timeoutMs + 'ms')), timeoutMs);
      });
      const result = await Promise.race([fn(), timeoutPromise]);
      clearTimeout(timer!);
      return result;
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';
      const isTransient =
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('high demand') ||
        msg.includes('timed out') ||
        err?.status === 503;

      if (isTransient && i < retries - 1) {
        console.warn(`Transient Gemini issue (${msg}), retrying once...`);
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// PDF & Text Extraction Endpoint
app.post('/api/extract-resume', async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');

    if (mimeType === 'text/plain' || fileName?.endsWith('.txt')) {
      const text = buffer.toString('utf-8');
      if (!text.trim()) {
        return res.status(400).json({ error: 'The uploaded text file is empty.' });
      }
      return res.json({ text, method: 'plaintext' });
    }

    if (mimeType === 'application/pdf' || fileName?.endsWith('.pdf')) {
      let extractedText = '';
      let usedGemini = false;

      // Try local PDFParse first
      try {
        const parser = new PDFParse(new Uint8Array(buffer));
        const textResult = await parser.getText();
        extractedText = textResult?.text ? textResult.text.trim() : '';
      } catch (pdfErr) {
        console.warn('Local pdf-parse encountered an error, falling back to Gemini multimodal extraction:', pdfErr);
      }

      // If text is suspiciously short or empty (e.g. scanned image or custom font encoding), use Gemini OCR / Multimodal
      if (!extractedText || extractedText.length < 80) {
        try {
          const ai = getGenAIClient();
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: fileBase64,
                  },
                },
                {
                  text: 'Please extract all readable resume text from this PDF document verbatim. Include all contact information, education, technical skills, projects, experience, coursework, and certifications. Format in clean readable text.',
                },
              ],
            },
          });
          extractedText = response.text?.trim() || '';
          usedGemini = true;
        } catch (geminiErr: any) {
          console.error('Gemini PDF extraction error:', geminiErr);
          if (!extractedText) {
            return res.status(422).json({
              error: 'Could not extract readable text from this PDF. It may be password-protected or unreadable. Please paste the resume text directly or upload a text file.',
              details: geminiErr?.message,
            });
          }
        }
      }

      if (!extractedText || extractedText.length < 30) {
        return res.status(422).json({
          error: 'The PDF appears to contain no readable text or is an empty scan. Please verify the document or paste the text directly.',
        });
      }

      return res.json({
        text: extractedText,
        method: usedGemini ? 'gemini_multimodal_ocr' : 'pdf_text_parser',
        charCount: extractedText.length,
      });
    }

    return res.status(400).json({
      error: 'Unsupported file format. Please upload a PDF (.pdf) or text (.txt) resume.',
    });
  } catch (error: any) {
    console.error('Extraction error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process resume document.',
    });
  }
});

// Full AI Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const {
      resumeText,
      studentProfile,
      jobDescription,
      targetRole,
      roadmapDuration = '30-day',
    } = req.body;

    if (!resumeText || resumeText.trim().length < 40) {
      return res.status(400).json({
        error: 'Resume text is required and must contain substantive career or academic content.',
      });
    }

    if (!jobDescription || jobDescription.trim().length < 30) {
      return res.status(400).json({
        error: 'Target job description is required to perform gap analysis.',
      });
    }

    const ai = getGenAIClient();

    const prompt = `
You are the AI engine for "AI VISION — Dynamic Skill Gap Analyser & Career Navigator", built for college students and fresh graduates.
Perform an objective, deep, evidence-based evaluation comparing the student's resume and profile against the target job requirements.

STUDENT PROFILE:
- Target Role: ${targetRole || 'Entry-Level Software / Tech Role'}
- Education Level: ${studentProfile?.education || 'Not specified'}
- Degree / Major: ${studentProfile?.degree || 'Computer Science / Engineering'}
- Experience Level: ${studentProfile?.experience || 'Fresh Graduate / Student Projects'}
- Key Self-Reported Skills: ${studentProfile?.skills || 'None'}
- Interests & Passions: ${studentProfile?.interests || 'None'}

STUDENT RESUME TEXT:
"""
${resumeText.slice(0, 10000)}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescription.slice(0, 10000)}
"""

REQUESTED ROADMAP DURATION: ${roadmapDuration} (provide a detailed roadmap tailored specifically for this timeframe)

CRITICAL INSTRUCTIONS:
1. NEVER fabricate or hallucinate experience or skills not evidenced in the resume.
2. For "Demonstrated Skills", quote or cite verifiable evidence from projects, courses, or roles in the resume.
3. For "Partially Demonstrated Skills", identify technologies or skills where basic familiarity is evidenced (e.g. academic mention or basic toy demo) but missing production depth, testing, deployment, or optimization.
4. For "Missing or Unverified Skills", identify genuine requirements in the job description that have zero verification in the student's resume.
5. Provide a transparent ATS-inspired heuristic score (0-100) reflecting structural readiness, keyword relevance, metrics, section presence, and clarity. Explicitly state what to improve.
6. Provide a role-fit match percentage (0-100) based on realistic hiring criteria for an entry-level candidate.
7. Recommend 3 to 4 suitable entry-level alternative or adjacent career roles based on actual strengths found in their resume.
8. Generate a practical, day-by-day or week-by-week learning roadmap for the chosen duration (${roadmapDuration}) with tangible portfolio project milestones to close the identified critical gaps.
9. Generate 4 tailored interview questions specifically targeting the student's weakest or partial skill gaps with STAR-method answer guidance and pitfalls.

Return the response strictly adhering to the requested JSON structure.
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: '2-3 sentence candid overview of candidate alignment with this role.',
              },
              roleFitScore: {
                type: Type.INTEGER,
                description: '0 to 100 estimated role match percentage for an entry-level applicant.',
              },
              roleFitRationale: {
                type: Type.STRING,
                description: 'Explanation of why this fit score was calculated, highlighting match factors.',
              },
              atsEvaluation: {
                type: Type.OBJECT,
                properties: {
                  overallScore: {
                    type: Type.INTEGER,
                    description: '0 to 100 overall ATS-inspired heuristic score.',
                  },
                  disclaimer: {
                    type: Type.STRING,
                    description: 'Educational heuristic disclaimer stating this is not an official vendor ATS score.',
                  },
                  breakdown: {
                    type: Type.OBJECT,
                    properties: {
                      keywordAlignment: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.INTEGER },
                          feedback: { type: Type.STRING },
                        },
                        required: ['score', 'feedback'],
                      },
                      readabilityAndStructure: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.INTEGER },
                          feedback: { type: Type.STRING },
                        },
                        required: ['score', 'feedback'],
                      },
                      measurableImpact: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.INTEGER },
                          feedback: { type: Type.STRING },
                        },
                        required: ['score', 'feedback'],
                      },
                      projectDepth: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.INTEGER },
                          feedback: { type: Type.STRING },
                        },
                        required: ['score', 'feedback'],
                      },
                      essentialSections: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.INTEGER },
                          feedback: { type: Type.STRING },
                        },
                        required: ['score', 'feedback'],
                      },
                    },
                    required: [
                      'keywordAlignment',
                      'readabilityAndStructure',
                      'measurableImpact',
                      'projectDepth',
                      'essentialSections',
                    ],
                  },
                  actionableImprovementTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Top concrete resume tweaks to boost ATS heuristic score.',
                  },
                },
                required: ['overallScore', 'disclaimer', 'breakdown', 'actionableImprovementTips'],
              },
              keyStrengths: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    evidenceQuote: { type: Type.STRING },
                    impact: { type: Type.STRING },
                  },
                  required: ['title', 'evidenceQuote', 'impact'],
                },
                description: 'Demonstrated strengths verified from the resume.',
              },
              skillGapAnalysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skill: { type: Type.STRING },
                    status: {
                      type: Type.STRING,
                      description: 'One of: demonstrated, partial, missing',
                    },
                    priority: {
                      type: Type.STRING,
                      description: 'One of: critical, high, medium, low',
                    },
                    resumeEvidence: { type: Type.STRING },
                    jobRequirement: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    recruiterExpectation: { type: Type.STRING },
                  },
                  required: [
                    'skill',
                    'status',
                    'priority',
                    'resumeEvidence',
                    'jobRequirement',
                    'explanation',
                    'recruiterExpectation',
                  ],
                },
              },
              careerNavigatorRoles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    matchPercentage: { type: Type.INTEGER },
                    rationale: { type: Type.STRING },
                    leverageSkills: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    bridgeSkills: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    marketOutlook: { type: Type.STRING },
                  },
                  required: ['title', 'matchPercentage', 'rationale', 'leverageSkills', 'bridgeSkills', 'marketOutlook'],
                },
              },
              learningRoadmap: {
                type: Type.OBJECT,
                properties: {
                  duration: { type: Type.STRING },
                  title: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  milestones: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        phaseOrDay: { type: Type.STRING },
                        title: { type: Type.STRING },
                        focusSkills: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        practicalTasks: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        projectMilestone: { type: Type.STRING },
                        howToVerifyProgress: { type: Type.STRING },
                        recommendedResources: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: [
                        'phaseOrDay',
                        'title',
                        'focusSkills',
                        'practicalTasks',
                        'projectMilestone',
                        'howToVerifyProgress',
                        'recommendedResources',
                      ],
                    },
                  },
                },
                required: ['duration', 'title', 'objective', 'milestones'],
              },
              interviewPreparation: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    targetedGapSkill: { type: Type.STRING },
                    questionType: {
                      type: Type.STRING,
                      description: 'Technical, Behavioral, or Architectural/Problem Solving',
                    },
                    question: { type: Type.STRING },
                    interviewerIntent: { type: Type.STRING },
                    starGuidance: {
                      type: Type.OBJECT,
                      properties: {
                        situation: { type: Type.STRING },
                        task: { type: Type.STRING },
                        action: { type: Type.STRING },
                        result: { type: Type.STRING },
                      },
                      required: ['situation', 'task', 'action', 'result'],
                    },
                    pitfallsToAvoid: { type: Type.STRING },
                    recommendedKeyTalkingPoints: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: [
                    'id',
                    'targetedGapSkill',
                    'questionType',
                    'question',
                    'interviewerIntent',
                    'starGuidance',
                    'pitfallsToAvoid',
                    'recommendedKeyTalkingPoints',
                  ],
                },
              },
            },
            required: [
              'executiveSummary',
              'roleFitScore',
              'roleFitRationale',
              'atsEvaluation',
              'keyStrengths',
              'skillGapAnalysis',
              'careerNavigatorRoles',
              'learningRoadmap',
              'interviewPreparation',
            ],
          },
        },
      })
    );

    const jsonText = cleanJsonOutput(response.text || '{}');
    const analysisData = JSON.parse(jsonText);

    res.json({
      success: true,
      data: analysisData,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn('Gemini live analysis issue, activating dynamic heuristic analysis:', error?.message);
    try {
      const heuristicData = generateHeuristicAnalysis(
        req.body.resumeText,
        req.body.studentProfile,
        req.body.jobDescription,
        req.body.targetRole,
        req.body.roadmapDuration
      );
      return res.json({
        success: true,
        data: heuristicData,
        analyzedAt: new Date().toISOString(),
        engine: 'dynamic_heuristic_evaluator',
      });
    } catch (fallbackErr: any) {
      console.error('Analysis fallback error:', fallbackErr);
      res.status(500).json({
        error: formatErrorMessage(error),
      });
    }
  }
});

// Interactive Interview Practice Evaluation Endpoint
app.post('/api/interview-feedback', async (req, res) => {
  try {
    const { question, targetedSkill, candidateAnswer, targetRole } = req.body;

    if (!candidateAnswer || candidateAnswer.trim().length < 15) {
      return res.status(400).json({
        error: 'Please provide a substantive answer to receive feedback.',
      });
    }

    const ai = getGenAIClient();

    const prompt = `
You are a senior tech hiring manager interviewing a candidate for a ${targetRole || 'Junior Developer'} role.
Evaluate this student's response to the interview question designed to test their gap in "${targetedSkill}":

QUESTION:
"${question}"

CANDIDATE'S ANSWER:
"""
${candidateAnswer}
"""

Provide rigorous, constructive, encouraging feedback evaluating clarity, depth, technical accuracy, and use of structured delivery (e.g. STAR method).
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scoreOutOf10: { type: Type.INTEGER },
              overallCritique: { type: Type.STRING },
              strengthsInAnswer: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missedOpportunitiesOrErrors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              improvedExampleAnswer: {
                type: Type.STRING,
                description: 'An exemplary way an entry-level candidate could phrase this answer.',
              },
            },
            required: [
              'scoreOutOf10',
              'overallCritique',
              'strengthsInAnswer',
              'missedOpportunitiesOrErrors',
              'improvedExampleAnswer',
            ],
          },
        },
      })
    );

    const jsonText = cleanJsonOutput(response.text || '{}');
    const feedbackData = JSON.parse(jsonText);

    res.json({
      success: true,
      data: feedbackData,
    });
  } catch (error: any) {
    console.warn('Interview feedback fallback activated:', error?.message);
    const candidateAnswer = req.body.candidateAnswer || '';
    const wordCount = candidateAnswer.split(/\s+/).length;
    const hasNumbers = /\d+/.test(candidateAnswer);
    const score = Math.min(9, Math.max(5, 5 + (wordCount > 25 ? 2 : 0) + (hasNumbers ? 1 : 0)));

    res.json({
      success: true,
      data: {
        scoreOutOf10: score,
        overallCritique: `Structured response directly addressing ${req.body.targetedSkill || 'the requested skill'}. Demonstrates foundational technical familiarity and practical problem-solving logic.`,
        strengthsInAnswer: [
          'Directly mentions relevant engineering concepts and components.',
          'Explains a logical procedural sequence of actions taken.',
          'Demonstrates awareness of real-world requirements.'
        ],
        missedOpportunitiesOrErrors: [
          'Structure your response explicitly around the STAR framework (Situation, Task, Action, Result).',
          'Quantify outcomes with concrete metrics (e.g. latency improvement %, test coverage %, user count).'
        ],
        improvedExampleAnswer: `In our project when implementing ${req.body.targetedSkill || 'this component'}, I defined the requirements, established an isolated test environment, designed a modular architecture with error handling, and verified edge cases, achieving reliable delivery without runtime regressions.`
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 1. AI Career Matching Endpoint
// ---------------------------------------------------------------------------
app.post('/api/career-match', async (req, res) => {
  try {
    const { technicalSkills, softSkills, education, projects, interests, experienceLevel } = req.body;

    if (!technicalSkills && !projects && !interests) {
      return res.status(400).json({ error: 'Please provide technical skills, projects, or interests.' });
    }

    const ai = getGenAIClient();
    const prompt = `
You are the AI Career Matching Engine for "AI VISION".
Analyze the candidate's authentic profile to discover and recommend 4 distinct, highly aligned career roles:

PROFILE:
- Education: ${education || 'Not specified'}
- Experience Level: ${experienceLevel || 'Entry-Level / Student'}
- Technical Skills: ${technicalSkills || 'None listed'}
- Soft Skills: ${softSkills || 'Communication, Problem-Solving'}
- Projects: ${projects || 'Academic & personal projects'}
- Interests & Passions: ${interests || 'Technology, innovation'}

CRITICAL INSTRUCTIONS:
1. Recommend 4 specific tech roles ranging from immediate high-fit entry-level to high-growth adjacent pathways.
2. Calculate honest role-fit match percentages (0-100%).
3. Explain why the role fits based on the supplied data.
4. List skills they already have that transfer to this role.
5. List specific bridge skills needed.
6. Provide market demand outlook.
7. Provide 3 concrete, actionable next steps.
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              topRoles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    role: { type: Type.STRING },
                    matchPercentage: { type: Type.INTEGER },
                    fitReason: { type: Type.STRING },
                    skillsYouHave: { type: Type.ARRAY, items: { type: Type.STRING } },
                    requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    bridgeSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    marketDemand: { type: Type.STRING },
                    recommendedNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: [
                    'role',
                    'matchPercentage',
                    'fitReason',
                    'skillsYouHave',
                    'requiredSkills',
                    'bridgeSkills',
                    'marketDemand',
                    'recommendedNextSteps',
                  ],
                },
              },
            },
            required: ['summary', 'topRoles'],
          },
        },
      })
    );

    const jsonText = cleanJsonOutput(response.text || '{}');
    const data = JSON.parse(jsonText);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.warn('Career match Gemini issue, using heuristic fallback:', error?.message);
    const data = generateHeuristicCareerMatches(req.body);
    return res.json({ success: true, data, fallback: true });
  }
});

// ---------------------------------------------------------------------------
// 2. Virtual AI Interview: Start / Question Generation
// ---------------------------------------------------------------------------
app.post('/api/interview/start', async (req, res) => {
  try {
    const { targetRole, experienceLevel, interviewType } = req.body;
    const role = targetRole || 'Software Engineer';
    const level = experienceLevel || 'Entry-Level';
    const type = interviewType || 'Technical';

    const ai = getGenAIClient();
    const prompt = `
You are an expert tech hiring manager conducting a realistic ${type} interview for a candidate applying for:
- Role: ${role}
- Experience Level: ${level}
- Interview Stage: ${type} Interview

Generate exactly 4 realistic, progressive interview questions appropriate for this stage:
- Question 1: Foundational warm-up / core concept
- Question 2: Practical scenario / deep dive into real-world challenge
- Question 3: Problem solving, edge cases, or trade-offs
- Question 4: Complex behavioral or architecture situation
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly 4 progressive interview questions',
              },
            },
            required: ['questions'],
          },
        },
      })
    );

    const jsonText = cleanJsonOutput(response.text || '{}');
    const data = JSON.parse(jsonText);
    return res.json({ success: true, questions: data.questions || [] });
  } catch (error: any) {
    console.warn('Interview start Gemini issue, using fallback questions:', error?.message);
    const questions = generateFallbackInterviewQuestions(
      req.body.targetRole,
      req.body.experienceLevel,
      req.body.interviewType
    );
    return res.json({ success: true, questions, fallback: true });
  }
});

// ---------------------------------------------------------------------------
// 3. Virtual AI Interview: Evaluate Answer + Contextual Follow-Up
// ---------------------------------------------------------------------------
app.post('/api/interview/evaluate', async (req, res) => {
  try {
    const { question, answer, targetRole, interviewType, questionIndex, totalQuestions } = req.body;

    if (!answer || answer.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a substantive answer to evaluate.' });
    }

    const ai = getGenAIClient();
    const prompt = `
You are a senior tech interviewer evaluating a candidate's answer for a ${targetRole || 'Software Engineer'} ${interviewType || 'Technical'} interview.

QUESTION ASKED:
"${question}"

CANDIDATE'S SUBMITTED ANSWER:
"""
${answer}
"""

Evaluate this answer rigorously yet encouragingly:
1. Score out of 10 based on clarity, relevance, structure, and correctness.
2. Provide rubric breakdown scores (0-10) for:
   - Relevance
   - Clarity
   - Depth or Technical Correctness
   - Structure (e.g. STAR framework for behavioural, or structured problem decomposition for technical)
3. List 2-3 specific strengths in what the candidate said.
4. List 2 concrete areas for improvement.
5. Provide a model answer illustrating an exemplary response.
6. Generate a sharp, natural follow-up question that builds directly upon what the candidate mentioned in their answer!
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scoreOutOf10: { type: Type.INTEGER },
              rubricScores: {
                type: Type.OBJECT,
                properties: {
                  relevance: { type: Type.INTEGER },
                  clarity: { type: Type.INTEGER },
                  depthOrCorrectness: { type: Type.INTEGER },
                  structure: { type: Type.INTEGER },
                },
                required: ['relevance', 'clarity', 'depthOrCorrectness', 'structure'],
              },
              overallCritique: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              modelAnswer: { type: Type.STRING },
              followUpQuestion: { type: Type.STRING },
            },
            required: [
              'scoreOutOf10',
              'rubricScores',
              'overallCritique',
              'strengths',
              'improvements',
              'modelAnswer',
              'followUpQuestion',
            ],
          },
        },
      })
    );

    const jsonText = cleanJsonOutput(response.text || '{}');
    const data = JSON.parse(jsonText);
    return res.json({ success: true, feedback: data });
  } catch (error: any) {
    console.warn('Interview evaluate Gemini issue, using fallback feedback:', error?.message);
    const feedback = generateFallbackInterviewFeedback(
      req.body.question,
      req.body.answer,
      req.body.targetRole,
      req.body.interviewType
    );
    return res.json({ success: true, feedback, fallback: true });
  }
});

// ---------------------------------------------------------------------------
// 4. Virtual AI Interview: Final Performance Summary
// ---------------------------------------------------------------------------
app.post('/api/interview/summary', async (req, res) => {
  try {
    const { targetRole, interviewType, qaHistory } = req.body;

    const ai = getGenAIClient();
    const prompt = `
You are the hiring committee summarizing a candidate's complete ${interviewType || 'Technical'} interview for ${targetRole || 'Software Engineer'}.

INTERVIEW TRANSCRIPT & EVALUATIONS:
${JSON.stringify(qaHistory, null, 2)}

Provide an executive interview debrief:
1. Overall score out of 100 based on all questions answered.
2. Readiness level label (e.g. "Interview Ready", "Strong Potential — Polish Architecture", "Foundational — Needs Review").
3. Executive summary of candidate performance.
4. Top 3 overall strengths demonstrated.
5. Top 3 critical areas for improvement before real interviews.
6. 3-step actionable preparation roadmap.
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              readinessLevel: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              criticalGrowthAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
              preparationRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'overallScore',
              'readinessLevel',
              'executiveSummary',
              'keyStrengths',
              'criticalGrowthAreas',
              'preparationRoadmap',
            ],
          },
        },
      })
    );

    const jsonText = cleanJsonOutput(response.text || '{}');
    const data = JSON.parse(jsonText);
    return res.json({ success: true, summary: data });
  } catch (error: any) {
    console.warn('Interview summary Gemini issue, using fallback summary:', error?.message);
    const summary = generateFallbackInterviewSummary(
      req.body.targetRole,
      req.body.interviewType,
      req.body.qaHistory || []
    );
    return res.json({ success: true, summary, fallback: true });
  }
});

// ---------------------------------------------------------------------------
// 5. Standalone AI Career Roadmap Endpoint
// ---------------------------------------------------------------------------
app.post('/api/roadmap/generate', async (req, res) => {
  try {
    const {
      candidateName = 'Candidate',
      currentSkills = '',
      targetRole = 'Software Developer',
      duration = '30-day',
      currentLevel = 'Beginner',
      studyYear = '2nd-Year B.Tech',
      dailyTime = '1 hour/day',
    } = req.body;

    const ai = getGenAIClient();
    const prompt = `
You are the Personalized Career Roadmap Architect for "AI VISION".
Design an authentic, beginner-friendly, and actionable learning roadmap for a college student:
- Candidate: ${candidateName}
- Study Year: ${studyYear} (e.g. 2nd-Year B.Tech Computer Science/IT)
- Stated Current Skills: ${currentSkills || 'C, Java, Git fundamentals'}
- Target Career/Role: ${targetRole || 'Software Developer'}
- Current Assessed Level: ${currentLevel || 'Beginner'}
- Daily Available Learning Time: ${dailyTime || '1 hour/day'}
- Target Roadmap Duration: ${duration}

CRITICAL PEDAGOGICAL REQUIREMENTS:
1. Make every task understandable to a college engineering student (e.g., 2nd-year B.Tech). When using technical terms (encapsulation, polymorphism, hash collisions, indexing, unit testing), explain them in 1 simple sentence.
2. The roadmap must adapt directly to their inputs. For a 2nd-year student with C, Java, Git aiming for Software Developer, prioritize:
   - Strengthening Java fundamentals & OOP (classes, encapsulation, constructors, method overriding).
   - Practical arrays, strings, two-pointer methods, and essential data structures (HashMaps, Stacks, Queues).
   - Git branching, pull requests, and commit hygiene on GitHub.
   - Data persistence with files or relational SQLite/Postgres SQL queries (CRUD & JOINs).
   - Building and testing a clean console or CLI capstone project pushed to GitHub.
3. Every task in "detailedTasks" MUST provide all 8 required fields:
   - whatToLearn: Beginner-friendly explanation.
   - whyToLearn: Connection to the target career.
   - whatToDo: Exact actionable steps (not vague "learn programming").
   - practiceTask: Specific coding exercise or problem to solve.
   - deliverable: Tangible file or commit to produce.
   - estimatedTime: Realistic time (e.g. "45 - 60 mins" matching available daily budget).
   - completionCriteria: How the student verifies they actually learned it.
   - learningResources: Authentic documentation links (Oracle, MDN, Git-SCM, PostgreSQL, W3Schools, Python.org — no fabricated URLs).
4. Organize into clear chronological phases (e.g. Weeks 1-2, Weeks 3-4, etc.) respecting the stated daily time budget.
5. Provide a "skillValidationSummary" categorizing skills into "You already know" (Foundations), "Strengthen this skill" (Partially developed), and "Learn next" (Future skills).
6. Provide a "checkpoint" at the end of each phase with 3 interactive multiple-choice questions with answers, explanations, and competencies tested.
7. Provide 3 initial "diagnosticAssessments" to validate self-reported skills upfront.
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              duration: { type: Type.STRING },
              title: { type: Type.STRING },
              objective: { type: Type.STRING },
              studyYear: { type: Type.STRING },
              proficiencyLevel: { type: Type.STRING },
              dailyTime: { type: Type.STRING },
              statedAssumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              skillValidationSummary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skill: { type: Type.STRING },
                    proficiencyLevel: { type: Type.STRING },
                    category: { type: Type.STRING },
                    whyItMatters: { type: Type.STRING },
                    competencyToDemonstrate: { type: Type.STRING },
                    isValidated: { type: Type.BOOLEAN },
                  },
                  required: ['skill', 'proficiencyLevel', 'category', 'whyItMatters', 'competencyToDemonstrate', 'isValidated'],
                },
              },
              diagnosticAssessments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    skill: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswerIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    competencyTested: { type: Type.STRING },
                  },
                  required: ['id', 'skill', 'question', 'options', 'correctAnswerIndex', 'explanation', 'competencyTested'],
                },
              },
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseOrDay: { type: Type.STRING },
                    title: { type: Type.STRING },
                    timeFrame: { type: Type.STRING },
                    learningObjective: { type: Type.STRING },
                    focusSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    practicalTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    detailedTasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          whatToLearn: { type: Type.STRING },
                          whyToLearn: { type: Type.STRING },
                          whatToDo: { type: Type.ARRAY, items: { type: Type.STRING } },
                          practiceTask: { type: Type.STRING },
                          deliverable: { type: Type.STRING },
                          estimatedTime: { type: Type.STRING },
                          completionCriteria: { type: Type.STRING },
                          learningResources: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                title: { type: Type.STRING },
                                url: { type: Type.STRING },
                                type: { type: Type.STRING },
                              },
                              required: ['title', 'url'],
                            },
                          },
                        },
                        required: [
                          'id',
                          'title',
                          'whatToLearn',
                          'whyToLearn',
                          'whatToDo',
                          'practiceTask',
                          'deliverable',
                          'estimatedTime',
                          'completionCriteria',
                          'learningResources',
                        ],
                      },
                    },
                    projectMilestone: { type: Type.STRING },
                    howToVerifyProgress: { type: Type.STRING },
                    recommendedResources: { type: Type.ARRAY, items: { type: Type.STRING } },
                    checkpoint: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        passingScorePercent: { type: Type.INTEGER },
                        questions: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              question: { type: Type.STRING },
                              options: { type: Type.ARRAY, items: { type: Type.STRING } },
                              correctAnswerIndex: { type: Type.INTEGER },
                              explanation: { type: Type.STRING },
                              competencyTested: { type: Type.STRING },
                            },
                            required: ['id', 'question', 'options', 'correctAnswerIndex', 'explanation', 'competencyTested'],
                          },
                        },
                      },
                      required: ['id', 'title', 'description', 'questions'],
                    },
                    expectedOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: [
                    'phaseOrDay',
                    'title',
                    'focusSkills',
                    'practicalTasks',
                    'detailedTasks',
                    'projectMilestone',
                    'howToVerifyProgress',
                    'recommendedResources',
                  ],
                },
              },
            },
            required: ['duration', 'title', 'objective', 'milestones'],
          },
        },
      })
    );

    const jsonText = cleanJsonOutput(response.text || '{}');
    const data = JSON.parse(jsonText);
    return res.json({ success: true, roadmap: data });
  } catch (error: any) {
    console.warn('Roadmap generate Gemini issue, using fallback roadmap:', error?.message);
    const roadmap = generateFallbackRoadmap(
      req.body.currentSkills,
      req.body.targetRole,
      req.body.duration || '30-day',
      req.body.currentLevel || 'Beginner',
      req.body.studyYear || '2nd-Year B.Tech',
      req.body.dailyTime || '1 hour/day',
      req.body.candidateName || 'Candidate'
    );
    return res.json({ success: true, roadmap, fallback: true });
  }
});

// ---------------------------------------------------------------------------
// 6. Career Twin — Your Future Self Endpoint
// ---------------------------------------------------------------------------
app.post('/api/career-twin', async (req, res) => {
  try {
    const { candidateName = 'Candidate', currentSkills = '', targetRole = 'Software Developer', education = '', projects = '' } = req.body;

    const ai = getGenAIClient();
    const prompt = `
You are the Career Twin Engine for "AI VISION".
Generate an authentic, visual comparison between a candidate's "Current Self" and their target role "Future Self":
- Candidate Name: ${candidateName}
- Target Role: ${targetRole}
- Current Stated Skills: ${currentSkills || 'Fundamental software programming'}
- Education / Degree: ${education || 'Undergraduate in Technology / Engineering'}
- Projects: ${projects || 'Academic & personal software projects'}

CRITICAL GUIDELINES:
1. "Current Self": Explicitly list verified skills provided by the candidate. Identify inferred skills based on typical foundations. Never invent skills they did not demonstrate or state.
2. "Future Self": Outline the rigorous production competency expected for ${targetRole} in modern tech hiring (must-have vs. emerging advantage).
3. "Transformation Path": Identify the ranked Top 3 most critical skill gaps to bridge. For each gap, explain why it matters to hiring managers, provide a tangible action plan, and specify an expected portfolio deliverable.
4. "Competency Dimensions": Provide benchmark scores (0-100) across 5 core technical dimensions comparing current vs target readiness:
   - Languages & Architecture
   - Frameworks & Production Stack
   - Data & Persistence
   - Testing & Quality
   - DevOps & Deployment
5. Provide an encouraging, actionable transformation summary emphasizing that this is a planning and comparison roadmap, not a prediction or guarantee.
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              candidateName: { type: Type.STRING },
              targetRole: { type: Type.STRING },
              readinessPercentage: { type: Type.INTEGER },
              currentSelf: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  explicitSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  inferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  strongestDomain: { type: Type.STRING },
                },
                required: ['summary', 'explicitSkills', 'inferredSkills', 'strongestDomain'],
              },
              futureSelf: {
                type: Type.OBJECT,
                properties: {
                  roleTitle: { type: Type.STRING },
                  expectedIndustryBaseline: { type: Type.STRING },
                  mustHaveSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  emergingAdvantageSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['roleTitle', 'expectedIndustryBaseline', 'mustHaveSkills', 'emergingAdvantageSkills'],
              },
              topThreeGaps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skill: { type: Type.STRING },
                    category: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    whyItMatters: { type: Type.STRING },
                    actionPlan: { type: Type.STRING },
                    expectedDeliverable: { type: Type.STRING },
                  },
                  required: ['skill', 'category', 'priority', 'whyItMatters', 'actionPlan', 'expectedDeliverable'],
                },
              },
              competencyDimensions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    currentLevel: { type: Type.INTEGER },
                    targetLevel: { type: Type.INTEGER },
                    gapDescription: { type: Type.STRING },
                  },
                  required: ['name', 'currentLevel', 'targetLevel', 'gapDescription'],
                },
              },
              transformationSummary: { type: Type.STRING },
            },
            required: [
              'candidateName',
              'targetRole',
              'readinessPercentage',
              'currentSelf',
              'futureSelf',
              'topThreeGaps',
              'competencyDimensions',
              'transformationSummary',
            ],
          },
        },
      })
    );

    const jsonText = cleanJsonOutput(response.text || '{}');
    const data = JSON.parse(jsonText);
    return res.json({ success: true, twin: data });
  } catch (error: any) {
    console.warn('Career Twin Gemini issue, activating fallback:', error?.message);
    const data = generateFallbackCareerTwin(
      req.body.candidateName,
      req.body.currentSkills,
      req.body.targetRole,
      req.body.education,
      req.body.projects
    );
  }
});

// ---------------------------------------------------------------------------
// 7. AI Startup Job Matcher & Direct Redirection System Endpoint
// ---------------------------------------------------------------------------
app.post('/api/jobs/match-startups', async (req, res) => {
  try {
    const rawSkills = req.body.skills;
    const skillsArray: string[] = Array.isArray(rawSkills)
      ? rawSkills
      : typeof rawSkills === 'string'
      ? rawSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Java', 'DSA', 'Git'];

    const targetRole = req.body.targetRole || 'Software Developer';
    const educationLevel = req.body.educationLevel || 'B.Tech / B.E.';
    const graduationYear = req.body.graduationYear || '2026';
    const experienceLevel = req.body.experienceLevel || 'Student';
    const preferredLocation = req.body.preferredLocation || 'Noida';
    const opportunityType = req.body.opportunityType || 'Full-Time Job';
    const candidateName = req.body.candidateName || 'Candidate';

    const inputData = {
      skills: skillsArray,
      targetRole,
      educationLevel,
      graduationYear,
      experienceLevel,
      preferredLocation,
      opportunityType,
      candidateName,
    };

    const ai = getGenAIClient();
    const prompt = `
You are the AI Startup Job Matcher and Career Redirect Engine for "AI VISION", specializing in Indian tech startups.
Candidate Profile:
- Name: ${candidateName}
- Skills: ${skillsArray.join(', ')}
- Target Role: ${targetRole}
- Education: ${educationLevel} (Graduation: ${graduationYear})
- Experience Level: ${experienceLevel}
- Preferred Location: ${preferredLocation}
- Opportunity Type: ${opportunityType}

CRITICAL RULES:
1. Prioritize real, genuine Indian startups, especially in Noida, Delhi-NCR, Gurugram, Bengaluru, Hyderabad, and Pune.
2. Direct company matching behavior:
   - If candidate skills feature Java, DSA, Git, SQL -> prioritize companies like Pine Labs, Moglix, Credgenics, Addverb Technologies, Razorpay, Blinkit.
   - If candidate skills feature React, Tailwind, JavaScript, Frontend -> prioritize Classplus, Inshorts, Blinkit, Clinikally, Urban Company, Postman.
   - If candidate skills feature Python, AI/ML, Data -> prioritize Innovaccer, Orangewood Labs, Credgenics, PhysicsWallah, Addverb.
   - If target role is Business Development or Marketing -> prioritize Classplus, PhysicsWallah, Moglix, SalaryBox, Clinikally.
   - If location is Noida/Delhi-NCR, prioritize Noida/Delhi-NCR startups.
3. For EVERY matched company:
   - Provide verified domain, office address/headquarters, match percentage (65-96%).
   - Set matchedRole to the exact role matching candidate (e.g. "Java Developer Intern", "Frontend Developer Fresher", "Python Developer Fresher", "AI/ML Intern", "Data Analyst Intern").
   - Set jobType to 'Internship', 'Fresher / Entry-Level', 'Full-Time Job', or 'Remote'.
   - Explain specific reason for matching based on candidate skills.
   - List candidate matched skills vs skills to learn for this specific company stack.
   - Provide the official company career portal URL (e.g. https://www.pinelabs.com/careers, https://moglix.com/careers, https://pw.live/careers, https://blinkit.com/careers, https://classplusapp.com/careers, https://www.credgenics.com/careers, https://addverb.com/careers, https://innovaccer.com/careers, etc.).
   - relevantJobsUrl: MUST be the role-specific filtered job search URL (e.g. LinkedIn Jobs search pre-filled with company name + matchedRole + location + internship/fresher filter flags).
   - officialApplyUrl: Direct official application page or ATS link (e.g. Lever, Greenhouse, Wellfound, or official careers openings section).
   - vacancyStatus: "Verified Vacancy Listings" or "Active Drives".
   - linkPriority: "Official ATS / Application Link" or "Role-Specific Career Filter".
   - Set statusIndicator to "Official Careers Portal".
4. Provide market insights with high-demand skills and hiring tips.
5. Do NOT invent fake guaranteed job offers. Explicitly preserve transparency that links redirect to real portals and vacancies vary in real-time.
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              querySummary: {
                type: Type.OBJECT,
                properties: {
                  targetRole: { type: Type.STRING },
                  skillsCount: { type: Type.INTEGER },
                  location: { type: Type.STRING },
                  opportunityType: { type: Type.STRING },
                  experienceLevel: { type: Type.STRING },
                  education: { type: Type.STRING },
                },
                required: ['targetRole', 'skillsCount', 'location', 'opportunityType', 'experienceLevel', 'education'],
              },
              matchedStartups: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    domain: { type: Type.STRING },
                    headquarters: { type: Type.STRING },
                    techHub: { type: Type.STRING },
                    description: { type: Type.STRING },
                    matchPercentage: { type: Type.INTEGER },
                    matchRationale: { type: Type.STRING },
                    matchedRole: { type: Type.STRING },
                    relevantRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                    jobType: { type: Type.STRING },
                    matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    skillsToAcquire: { type: Type.ARRAY, items: { type: Type.STRING } },
                    hiringType: { type: Type.STRING },
                    statusIndicator: { type: Type.STRING },
                    vacancyStatus: { type: Type.STRING },
                    linkPriority: { type: Type.STRING },
                    relevantJobsUrl: { type: Type.STRING },
                    officialApplyUrl: { type: Type.STRING },
                    careerUrl: { type: Type.STRING },
                    linkedInJobsUrl: { type: Type.STRING },
                    naukriJobsUrl: { type: Type.STRING },
                    googleJobsUrl: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: [
                    'id',
                    'name',
                    'domain',
                    'headquarters',
                    'description',
                    'matchPercentage',
                    'matchRationale',
                    'matchedRole',
                    'relevantRoles',
                    'jobType',
                    'matchedSkills',
                    'skillsToAcquire',
                    'relevantJobsUrl',
                    'officialApplyUrl',
                    'careerUrl',
                    'linkedInJobsUrl',
                    'naukriJobsUrl',
                  ],
                },
              },
              directAggregatorUrls: {
                type: Type.OBJECT,
                properties: {
                  linkedIn: { type: Type.STRING },
                  naukri: { type: Type.STRING },
                  internshala: { type: Type.STRING },
                  wellfound: { type: Type.STRING },
                  googleJobs: { type: Type.STRING },
                },
                required: ['linkedIn', 'naukri', 'internshala', 'wellfound'],
              },
              marketInsights: {
                type: Type.OBJECT,
                properties: {
                  inDemandSkill: { type: Type.STRING },
                  recommendedHub: { type: Type.STRING },
                  hiringSeasonTip: { type: Type.STRING },
                },
                required: ['inDemandSkill', 'recommendedHub', 'hiringSeasonTip'],
              },
            },
            required: ['querySummary', 'matchedStartups', 'directAggregatorUrls', 'marketInsights'],
          },
        },
      })
    );

    const jsonText = cleanJsonOutput(response.text || '{}');
    const data = JSON.parse(jsonText);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.warn('Startup Matcher Gemini issue, using fallback engine:', error?.message);
    const data = matchStartupsWithFallback({
      skills: Array.isArray(req.body.skills) ? req.body.skills : [req.body.skills || 'Java'],
      targetRole: req.body.targetRole || 'Software Developer',
      educationLevel: req.body.educationLevel || 'B.Tech / B.E.',
      graduationYear: req.body.graduationYear || '2026',
      experienceLevel: req.body.experienceLevel || 'Student',
      preferredLocation: req.body.preferredLocation || 'Noida',
      opportunityType: req.body.opportunityType || 'Full-Time Job',
      candidateName: req.body.candidateName || 'Candidate',
    });
    return res.json({ success: true, data, fallback: true });
  }
});


// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI VISION server active and listening:`);
    console.log(`  > Local:   http://localhost:${PORT}`);
    console.log(`  > Network: http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
