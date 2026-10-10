import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp, Compass, BookOpen, Search, Loader2, AlertCircle } from 'lucide-react';
import { CareerMatchInput, CareerMatchResult } from '../../types';

interface CareerMatchingToolProps {
  candidateName?: string;
  onApplyRoleToJobSearch: (role: string, skills: string[]) => void;
}

const SAMPLE_PROFILES: { label: string; data: CareerMatchInput }[] = [
  {
    label: 'CS Senior (Web & Distributed Systems)',
    data: {
      technicalSkills: 'TypeScript, React, Node.js, Express, PostgreSQL, Git, Tailwind CSS, REST APIs',
      softSkills: 'Agile collaboration, technical communication, problem decomposition, code reviews',
      education: 'B.S. in Computer Science (Final-Year Senior)',
      projects: 'SplitFlow expense sharing full-stack app, Campus room scheduling portal in React/Node serving 1400 users',
      interests: 'FinTech platforms, high-performance web systems, real-time collaboration tools',
      experienceLevel: 'Student Projects & 1 Summer Internship',
    },
  },
  {
    label: 'Data Science Graduate (Applied ML & Analytics)',
    data: {
      technicalSkills: 'Python, Pandas, NumPy, SQL (PostgreSQL), Scikit-Learn, Matplotlib, Jupyter, Tableau',
      softSkills: 'Quantitative reasoning, data storytelling, hypothesis testing, stakeholder presentations',
      education: 'B.S. in Data Science & Applied Statistics (Recent Graduate)',
      projects: 'Clinical Patient Readmission Predictor (XGBoost, AUC 0.82), E-commerce Customer Churn & Segmentation with SQL',
      interests: 'Healthcare AI, predictive analytics, automated business intelligence dashboards',
      experienceLevel: 'Academic Research & Capstone Project',
    },
  },
  {
    label: 'Bootcamp & Systems Enthusiast (Cloud & DevOps)',
    data: {
      technicalSkills: 'Linux CLI, Bash, Docker, Git, Python automation, AWS (EC2, S3, VPC), Networking basics',
      softSkills: 'Root cause analysis, incident documentation, systems mindset, disciplined learning',
      education: 'Cloud & Infrastructure Engineering Bootcamp + B.A.',
      projects: 'Multi-Tier VPC Architecture on AWS, Automated Linux server hardening and backup cron suite',
      interests: 'Cloud infrastructure, infrastructure-as-code, CI/CD automation, site reliability',
      experienceLevel: 'Bootcamp Graduate & Hands-on Home Lab',
    },
  },
];

export const CareerMatchingTool: React.FC<CareerMatchingToolProps> = ({
  candidateName = 'Candidate',
  onApplyRoleToJobSearch,
}) => {
  const [profile, setProfile] = useState<CareerMatchInput>(SAMPLE_PROFILES[0].data);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CareerMatchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.technicalSkills.trim() && !profile.projects.trim()) {
      setErrorMsg('Please specify your technical skills or projects to discover matched careers.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/career-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          candidateName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to match career paths.');
      }

      setResult(data.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with career matching engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Feature 01 · AI Career Matching</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Discover Your High-Fit Tech Roles
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Analyze your skills, projects, interests and goals to discover suitable career opportunities with transparent fit scores and transition bridges.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400">Load sample:</span>
          {SAMPLE_PROFILES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setProfile(sample.data);
                setErrorMsg(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {sample.label.split(' ')[0]} {sample.label.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">
              Technical Skills <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={profile.technicalSkills}
              onChange={(e) => setProfile({ ...profile, technicalSkills: e.target.value })}
              placeholder="e.g. Python, SQL, React, Node.js, Docker, Java, Git"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Education & Degree</label>
            <input
              type="text"
              value={profile.education}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
              placeholder="e.g. B.S. in Computer Science (Senior)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Experience Level</label>
            <select
              value={profile.experienceLevel}
              onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="Student Projects & Coursework">Student Projects & Coursework Only</option>
              <option value="Student Projects & 1 Summer Internship">Student Projects & 1 Internship</option>
              <option value="Recent Graduate (0-1 Years)">Recent Graduate (0-1 Years)</option>
              <option value="Junior Engineer (1-2 Years)">Junior Engineer (1-2 Years)</option>
              <option value="Bootcamp Graduate & Self-Taught">Bootcamp Graduate & Self-Taught</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">Key Projects & Hands-On Work</label>
            <textarea
              rows={3}
              value={profile.projects}
              onChange={(e) => setProfile({ ...profile, projects: e.target.value })}
              placeholder="Describe 1-2 major projects you built (stack, features, database, users, problems solved)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Soft Skills & Working Style</label>
            <input
              type="text"
              value={profile.softSkills}
              onChange={(e) => setProfile({ ...profile, softSkills: e.target.value })}
              placeholder="e.g. Code reviews, sprint planning, cross-functional communication"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Interests & Target Domains</label>
            <input
              type="text"
              value={profile.interests}
              onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
              placeholder="e.g. Distributed systems, FinTech, AI apps, cloud automation"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-200" />
                <span>Matching Roles with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>Discover Suitable Career Roles</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Match Summary */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <h4 className="text-base font-bold text-white">AI Profile Alignment Summary</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Matched Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {result.topRoles.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Role Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider">
                        Matched Pathway {idx + 1}
                      </span>
                      <h4 className="text-lg font-bold text-white tracking-tight mt-0.5">
                        {item.role}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-sky-400">
                        {item.matchPercentage}%
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Role Fit
                      </div>
                    </div>
                  </div>

                  {/* Why it fits */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {item.fitReason}
                  </p>

                  {/* Skills You Have vs Bridge Skills */}
                  <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Foundational Skills You Have</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.skillsYouHave.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Bridge Skills to Excel</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.bridgeSkills.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-900/50 text-indigo-300 text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Next Steps */}
                  {item.recommendedNextSteps && item.recommendedNextSteps.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800 text-xs">
                      <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                        <span>Suggested Actionable Next Steps</span>
                      </div>
                      <ul className="space-y-1 text-slate-400">
                        {item.recommendedNextSteps.map((step, stepIdx) => (
                          <li key={stepIdx} className="flex items-start gap-1.5">
                            <span className="text-sky-400 font-bold">›</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer with Market Demand & Direct Job Search Action */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-slate-400">
                    <span className="text-slate-300 font-medium">Market Demand:</span> {item.marketDemand}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onApplyRoleToJobSearch(item.role, [...item.skillsYouHave, ...item.bridgeSkills]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800 text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Jobs for {item.role.split(' ')[0]}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
