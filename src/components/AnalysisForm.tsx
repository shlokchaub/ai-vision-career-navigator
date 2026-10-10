import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Layers,
  Wand2,
  Calendar,
  Code2,
} from 'lucide-react';
import { StudentProfile, DemoCandidate } from '../types';
import { DEMO_CANDIDATES, SAMPLE_JOB_OPTIONS } from '../data/samples';

interface AnalysisFormProps {
  onSubmit: (payload: {
    resumeText: string;
    studentProfile: StudentProfile;
    jobDescription: string;
    targetRole: string;
    roadmapDuration: string;
  }) => void;
  isLoading: boolean;
  selectedDemo: DemoCandidate | null;
  onClearDemo: () => void;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  onSubmit,
  isLoading,
  selectedDemo,
  onClearDemo,
}) => {
  const [resumeText, setResumeText] = useState(selectedDemo?.resumeText || '');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [studentProfile, setStudentProfile] = useState<StudentProfile>(
    selectedDemo?.profile || {
      name: '',
      education: 'Bachelor of Science (Senior / Final-Year)',
      degree: 'Computer Science',
      experience: 'Student Projects & Hackathons',
      skills: 'JavaScript, React, Node.js, Python, Git, SQL',
      interests: 'Web development, cloud systems, generative AI',
      targetRole: 'Junior Full-Stack Software Engineer',
    }
  );

  const [jobDescription, setJobDescription] = useState(
    selectedDemo?.jobDescription || ''
  );
  const [roadmapDuration, setRoadmapDuration] = useState<'7-day' | '30-day'>('30-day');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when selectedDemo changes
  React.useEffect(() => {
    if (selectedDemo) {
      setResumeText(selectedDemo.resumeText);
      setStudentProfile(selectedDemo.profile);
      setJobDescription(selectedDemo.jobDescription);
      setFileName(`Demo: ${selectedDemo.name} Resume`);
      setExtractSuccess(`Loaded verified profile for ${selectedDemo.name}`);
      setErrorMsg(null);
    }
  }, [selectedDemo]);

  // Handle file drop / upload
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setExtractSuccess(null);
    setFileName(file.name);

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');

    if (!isPdf && !isTxt) {
      setErrorMsg('Please upload a valid .pdf or .txt file format.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File size exceeds 20MB limit.');
      return;
    }

    setIsExtracting(true);

    try {
      if (isTxt) {
        const text = await file.text();
        if (!text.trim()) {
          throw new Error('The uploaded text file is empty.');
        }
        setResumeText(text);
        setExtractSuccess(`Successfully loaded text resume (${text.length} characters)`);
      } else {
        // PDF: Convert to base64 and send to server
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = () => reject(new Error('Failed to read file buffer.'));
        });
        reader.readAsDataURL(file);

        const base64Data = await base64Promise;

        const res = await fetch('/api/extract-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Data,
            mimeType: 'application/pdf',
            fileName: file.name,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to extract text from PDF.');
        }

        setResumeText(data.text);
        const methodLabel =
          data.method === 'gemini_multimodal_ocr'
            ? 'Deep Gemini OCR extraction'
            : 'Structured PDF text parser';
        setExtractSuccess(`Extracted ${data.charCount || data.text.length} characters via ${methodLabel}`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error processing resume file.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setErrorMsg('Please upload a resume or paste your resume text to begin analysis.');
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMsg('Please paste a target job description or pick one of the sample postings.');
      return;
    }
    setErrorMsg(null);
    onSubmit({
      resumeText,
      studentProfile,
      jobDescription,
      targetRole: studentProfile.targetRole || 'Software Engineer',
      roadmapDuration,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Feature 02 · AI Resume Analyzer & Skill Gap Matrix</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
          AI Resume Analyzer & ATS Readiness
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          Analyze your resume, identify missing keywords, evaluate ATS readiness heuristics, and compare against target job specifications.
        </p>
      </div>

      {/* 1-Click Sample Profiles Showcase Cards */}
      <div className="mb-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-sky-400" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                1-Click Verified Sample Profiles
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test the end-to-end Gemini analysis instantly with verified student resumes and real-world tech job requirements.
            </p>
          </div>
          {selectedDemo && (
            <button
              type="button"
              onClick={onClearDemo}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer self-start sm:self-auto"
            >
              Clear Demo Preset
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_CANDIDATES.map((candidate) => {
            const isSelected = selectedDemo?.id === candidate.id;
            return (
              <button
                key={candidate.id}
                type="button"
                onClick={() => {
                  setResumeText(candidate.resumeText);
                  setStudentProfile(candidate.profile);
                  setJobDescription(candidate.jobDescription);
                  setFileName(`Demo: ${candidate.name} Resume`);
                  setExtractSuccess(`Loaded profile for ${candidate.name}`);
                  setErrorMsg(null);
                }}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{candidate.name}</span>
                    <span className="text-[10px] text-sky-400 uppercase tracking-wide font-mono">
                      {candidate.id.split('-')[1]}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-300 font-medium mt-0.5">
                    {candidate.targetRole}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                    {candidate.tagline}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Click to load</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: Resume Upload & Student Profile */}
          <div className="space-y-6">
            {/* 1. Resume Document Upload */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h3 className="text-sm font-semibold text-white">Student Resume</h3>
                </div>
                <span className="text-xs text-slate-400">PDF or TXT</span>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-950/90 rounded-xl p-6 text-center cursor-pointer transition-colors group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-108 transition-transform">
                  <Upload className="w-5 h-5 text-sky-400" />
                </div>
                <div className="text-xs font-medium text-slate-200">
                  Drag & drop your resume here, or <span className="text-sky-400 underline">browse</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supports standard text & multimodal PDF document parsing
                </div>
              </div>

              {/* Extraction Status */}
              {isExtracting && (
                <div className="mt-3 flex items-center gap-2 text-xs text-sky-400 animate-pulse bg-sky-950/30 p-2.5 rounded-lg border border-sky-900/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extracting resume text via Gemini OCR engine...</span>
                </div>
              )}

              {extractSuccess && !isExtracting && (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/50">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{extractSuccess}</span>
                </div>
              )}

              {/* Editable Resume Text Preview */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <label htmlFor="resume-text-input">Extracted Resume Content</label>
                  <span>{resumeText.length} characters</span>
                </div>
                <textarea
                  id="resume-text-input"
                  rows={7}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste or review your resume text here (Education, Skills, Experience, Projects)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>
            </div>

            {/* 2. Student Profile */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h3 className="text-sm font-semibold text-white">Student Academic & Career Profile</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Candidate Name</label>
                  <input
                    type="text"
                    value={studentProfile.name}
                    onChange={(e) => setStudentProfile({ ...studentProfile, name: e.target.value })}
                    placeholder="e.g. Alex Chen"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Target Role</label>
                  <input
                    type="text"
                    value={studentProfile.targetRole}
                    onChange={(e) => setStudentProfile({ ...studentProfile, targetRole: e.target.value })}
                    placeholder="e.g. Junior Full-Stack Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Education Level</label>
                  <select
                    value={studentProfile.education}
                    onChange={(e) => setStudentProfile({ ...studentProfile, education: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Bachelor of Science (Senior / Final-Year)">Undergraduate (Final-Year / Senior)</option>
                    <option value="Bachelor of Science (Recent Graduate)">Recent Bachelor's Graduate (0-1 yrs)</option>
                    <option value="Master of Science Candidate">Master's Student / Postgrad</option>
                    <option value="Bootcamp Graduate & Certificate">Coding Bootcamp Graduate</option>
                    <option value="Self-Taught Developer">Self-Taught Developer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Major / Focus</label>
                  <input
                    type="text"
                    value={studentProfile.degree}
                    onChange={(e) => setStudentProfile({ ...studentProfile, degree: e.target.value })}
                    placeholder="e.g. Computer Science, Data Science, Math"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Experience Level</label>
                  <select
                    value={studentProfile.experience}
                    onChange={(e) => setStudentProfile({ ...studentProfile, experience: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Academic & Personal Projects Only">Academic & Personal Projects Only</option>
                    <option value="Student Projects & 1 Summer Internship">Student Projects & 1 Internship (1-3 months)</option>
                    <option value="0-1 Years (Freelance or Junior Experience)">0-1 Years (Freelance or Junior Experience)</option>
                    <option value="1-2 Years (Associate / Entry-Level)">1-2 Years (Associate / Entry-Level)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Key Self-Reported Skills</label>
                  <input
                    type="text"
                    value={studentProfile.skills}
                    onChange={(e) => setStudentProfile({ ...studentProfile, skills: e.target.value })}
                    placeholder="e.g. TypeScript, React, Python, Docker, SQL, Git"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Career Interests & Passions</label>
                  <input
                    type="text"
                    value={studentProfile.interests}
                    onChange={(e) => setStudentProfile({ ...studentProfile, interests: e.target.value })}
                    placeholder="e.g. Distributed systems, FinTech, machine learning apps, dev tools"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Target Job Description & Preferences */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h3 className="text-sm font-semibold text-white">Target Job / Internship Description</h3>
                </div>

                {/* Sample job picker */}
                <select
                  aria-label="Insert sample job description"
                  defaultValue=""
                  onChange={(e) => {
                    const sample = SAMPLE_JOB_OPTIONS.find((s) => s.title === e.target.value);
                    if (sample) {
                      setJobDescription(sample.description);
                      setStudentProfile((prev) => ({ ...prev, targetRole: sample.role }));
                    }
                  }}
                  className="text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>
                    Select Sample Job...
                  </option>
                  {SAMPLE_JOB_OPTIONS.map((sample) => (
                    <option key={sample.title} value={sample.title}>
                      {sample.title}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-slate-400 mb-2">
                Paste the full responsibilities, requirements, and preferred qualifications of any tech job or internship posting.
              </p>

              <textarea
                rows={14}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job or internship description here (Qualifications, Responsibilities, Tech Stack)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            {/* 4. Roadmap Duration Preferences */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <h3 className="text-sm font-semibold text-white">Learning Roadmap Horizon</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRoadmapDuration('7-day')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    roadmapDuration === '7-day'
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-indigo-300">7-Day Intensive Sprint</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Fast-track crash preparation focused strictly on critical blockers for an upcoming interview.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRoadmapDuration('30-day')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    roadmapDuration === '30-day'
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-indigo-300">30-Day Comprehensive Mastery</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Structured 4-week progression with hands-on portfolio projects and verified competencies.
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Action Card */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isExtracting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-500 hover:from-indigo-500 hover:via-sky-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-sky-200" />
                    <span>Gemini is Analysing Skill Gaps...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-300" />
                    <span>Analyse Skill Gaps & Navigate Career</span>
                    <ArrowRight className="w-4 h-4 text-sky-300" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2.5">
                Evaluates true resume evidence without hallucination · Generates custom roadmap & gap-targeted interview prep
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
