import React, { useState } from 'react';
import { X, Download, Copy, Printer, Check, FileText } from 'lucide-react';
import { AnalysisResult, StudentProfile } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalysisResult;
  profile: StudentProfile;
  targetRole: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  data,
  profile,
  targetRole,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownReport = () => {
    return `# AI VISION — SKILL GAP ANALYSIS & CAREER NAVIGATOR REPORT
Generated on: ${new Date().toLocaleDateString()}
Candidate: ${profile.name || 'Candidate'}
Target Role: ${targetRole}
Education: ${profile.education} (${profile.degree})

--------------------------------------------------------------------------------
EXECUTIVE EVALUATION
--------------------------------------------------------------------------------
${data.executiveSummary}

ROLE FIT MATCH: ${data.roleFitScore}%
${data.roleFitRationale}

ATS-INSPIRED HEURISTIC SCORE: ${data.atsEvaluation.overallScore}/100
${data.atsEvaluation.disclaimer}

DIMENSION FINDINGS:
• Keyword Alignment: ${data.atsEvaluation.breakdown.keywordAlignment.score}/100 - ${data.atsEvaluation.breakdown.keywordAlignment.feedback}
• Readability & Structure: ${data.atsEvaluation.breakdown.readabilityAndStructure.score}/100 - ${data.atsEvaluation.breakdown.readabilityAndStructure.feedback}
• Measurable Impact: ${data.atsEvaluation.breakdown.measurableImpact.score}/100 - ${data.atsEvaluation.breakdown.measurableImpact.feedback}
• Project Depth: ${data.atsEvaluation.breakdown.projectDepth.score}/100 - ${data.atsEvaluation.breakdown.projectDepth.feedback}
• Essential Sections: ${data.atsEvaluation.breakdown.essentialSections.score}/100 - ${data.atsEvaluation.breakdown.essentialSections.feedback}

RESUME ACTIONABLE IMPROVEMENTS:
${data.atsEvaluation.actionableImprovementTips.map((tip) => `- ${tip}`).join('\n')}

--------------------------------------------------------------------------------
VERIFIED KEY STRENGTHS
--------------------------------------------------------------------------------
${data.keyStrengths
  .map(
    (s) =>
      `• ${s.title}\n  Evidence Quote: "${s.evidenceQuote}"\n  Hiring Impact: ${s.impact}`
  )
  .join('\n\n')}

--------------------------------------------------------------------------------
DYNAMIC SKILL GAP MATRIX
--------------------------------------------------------------------------------
${data.skillGapAnalysis
  .map(
    (g) =>
      `• [${g.status.toUpperCase()} | Priority: ${g.priority.toUpperCase()}] ${g.skill}
  Job Requirement: ${g.jobRequirement}
  Resume Evidence: ${g.resumeEvidence || 'None detected'}
  Recruiter Expectation: ${g.recruiterExpectation}
  Analysis: ${g.explanation}`
  )
  .join('\n\n')}

--------------------------------------------------------------------------------
RECOMMENDED ENTRY-LEVEL CAREER ROLES
--------------------------------------------------------------------------------
${data.careerNavigatorRoles
  .map(
    (r) =>
      `• ${r.title} (Fit: ${r.matchPercentage}%)\n  Rationale: ${r.rationale}\n  Leverage Skills: ${r.leverageSkills.join(', ')}\n  Bridge Skills: ${r.bridgeSkills.join(', ')}\n  Outlook: ${r.marketOutlook}`
  )
  .join('\n\n')}

--------------------------------------------------------------------------------
LEARNING ROADMAP (${data.learningRoadmap.duration})
Objective: ${data.learningRoadmap.objective}
--------------------------------------------------------------------------------
${data.learningRoadmap.milestones
  .map(
    (m) =>
      `### ${m.phaseOrDay}: ${m.title}
Focus Skills: ${m.focusSkills.join(', ')}
Practical Tasks:
${m.practicalTasks.map((t) => `  - [ ] ${t}`).join('\n')}
Portfolio Milestone: ${m.projectMilestone}
Progress Verification: ${m.howToVerifyProgress}`
  )
  .join('\n\n')}

--------------------------------------------------------------------------------
GAP-TARGETED INTERVIEW PREPARATION
--------------------------------------------------------------------------------
${data.interviewPreparation
  .map(
    (q, idx) =>
      `Q${idx + 1} (${q.questionType}) - Targeting Gap: ${q.targetedGapSkill}
Question: "${q.question}"
Interviewer Intent: ${q.interviewerIntent}
STAR Guidance:
  Situation: ${q.starGuidance.situation}
  Task: ${q.starGuidance.task}
  Action: ${q.starGuidance.action}
  Result: ${q.starGuidance.result}
Pitfalls: ${q.pitfallsToAvoid}`
  )
  .join('\n\n')}
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = generateMarkdownReport();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-VISION-Report-${(profile.name || 'Student').replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Executive Analysis Report
              </h3>
              <div className="text-xs text-slate-400">
                Candidate: {profile.name || 'Candidate'} · Role: {targetRole}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950/70 whitespace-pre-wrap leading-relaxed select-text">
          {generateMarkdownReport()}
        </div>
      </div>
    </div>
  );
};
