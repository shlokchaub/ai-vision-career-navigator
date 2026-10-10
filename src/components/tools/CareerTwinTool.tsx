import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FolderGit2,
  RefreshCw,
  Loader2,
  Layers,
  ChevronRight,
  User,
  Zap,
  Target,
} from 'lucide-react';
import { UserProfile, CareerTwinData, CareerTwinGap } from '../../types';

interface CareerTwinToolProps {
  userProfile: UserProfile;
  onStartTransformation: (recommendedSkills: string[]) => void;
  onNavigateToRoadmap: () => void;
}

const COMMON_ROLES = [
  'Software Developer',
  'Data Analyst',
  'Web Developer',
  'AI/ML Engineer',
  'Cybersecurity Analyst',
  'Cloud & DevOps Engineer',
];

export const CareerTwinTool: React.FC<CareerTwinToolProps> = ({
  userProfile,
  onStartTransformation,
  onNavigateToRoadmap,
}) => {
  const [selectedRole, setSelectedRole] = useState(userProfile.targetRole || 'Software Developer');
  const [customRole, setCustomRole] = useState('');
  const [twinData, setTwinData] = useState<CareerTwinData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const candidateName = userProfile.name ? userProfile.name.trim() : 'Candidate';

  const fetchTwinComparison = async (targetRoleToFetch: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/career-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          currentSkills: userProfile.skills,
          targetRole: targetRoleToFetch,
          education: `${userProfile.education} (${userProfile.degree || 'Engineering'})`,
          projects: userProfile.interests || 'Academic software development',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.twin) {
        throw new Error(json.error || 'Failed to generate Career Twin comparison.');
      }

      setTwinData(json.twin);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error generating Career Twin comparison.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTwinComparison(selectedRole);
  }, []);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    fetchTwinComparison(role);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customRole.trim()) {
      setSelectedRole(customRole.trim());
      fetchTwinComparison(customRole.trim());
    }
  };

  const handleTriggerTransformation = () => {
    if (twinData?.topThreeGaps) {
      const skills = twinData.topThreeGaps.map((g) => g.skill);
      onStartTransformation(skills);
    } else {
      onNavigateToRoadmap();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header with Feature Identity & Transparency Disclaimer */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Innovation · Career Twin</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
            Career Twin — Your Future Self
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Visual side-by-side comparison between your current skill baseline and industry expectations for{' '}
            <span className="text-cyan-400 font-semibold">{selectedRole}</span>.
          </p>
        </div>

        {/* Quick Role Selection Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start lg:self-auto">
          {COMMON_ROLES.slice(0, 4).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleChange(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedRole === role
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
              }`}
            >
              {role.split(' ')[0]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => fetchTwinComparison(selectedRole)}
            disabled={isLoading}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Recalculate Career Twin"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading && (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-white">
            Gemini is synthesizing Career Twin for {candidateName}...
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Extracting declared competencies vs. production standards for {selectedRole}.
          </p>
        </div>
      )}

      {twinData && !isLoading && (
        <div className="space-y-8">
          {/* 2. Side-by-Side Dual Profiles: Current Self vs. Future Self */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card A: Your Current Self */}
            <div className="relative rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 sm:p-7 shadow-xl overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                      Profile Origin
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Your Current Self</span>
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300">
                    Candidate: {candidateName}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-850 mb-5">
                  {twinData.currentSelf.summary}
                </p>

                {/* Explicitly Stated Skills */}
                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Explicitly Declared Skills</span>
                    <span className="text-[10px] text-cyan-400 lowercase font-mono">user-provided</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {twinData.currentSelf.explicitSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-900/60 text-cyan-200 text-xs font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inferred Skills */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Inferred Foundations</span>
                    <span className="text-[10px] text-slate-400 lowercase font-mono">deduced from projects</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {twinData.currentSelf.inferredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono"
                      >
                        ~ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Demonstrated Domain:</span>
                <span className="font-semibold text-cyan-300">{twinData.currentSelf.strongestDomain}</span>
              </div>
            </div>

            {/* Card B: Your Future Self */}
            <div className="relative rounded-3xl bg-slate-900/80 border border-indigo-500/40 p-6 sm:p-7 shadow-xl overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                      Industry Target
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                      <Target className="w-4 h-4 text-indigo-400" />
                      <span>Your Future Self</span>
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-950/70 border border-indigo-800 text-indigo-300">
                    Role: {twinData.futureSelf.roleTitle}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-850 mb-5">
                  {twinData.futureSelf.expectedIndustryBaseline}
                </p>

                {/* Must-Have Production Competencies */}
                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Must-Have Production Competencies</span>
                    <span className="text-[10px] text-amber-400 lowercase font-mono">screening filter</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {twinData.futureSelf.mustHaveSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/80 text-indigo-200 text-xs font-mono font-medium"
                      >
                        ★ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Emerging Advantage Skills */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Emerging Advantage Skills</span>
                    <span className="text-[10px] text-emerald-400 lowercase font-mono">hiring edge</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {twinData.futureSelf.emergingAdvantageSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-200 text-xs font-mono"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Baseline Alignment:</span>
                <span className="font-semibold text-indigo-300 tabular-nums">
                  {twinData.readinessPercentage}% Target Fit
                </span>
              </div>
            </div>
          </div>

          {/* 3. Visual Skill Dimension Comparison */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Competency Dimension Gap Analysis</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparing current verified skills vs. hiring expectations across 5 pillars
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-2 rounded bg-cyan-400 inline-block" /> Current Self
                </span>
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-3 h-2 rounded bg-indigo-500 inline-block" /> Future Self
                </span>
              </div>
            </div>

            <div className="space-y-5">
              {twinData.competencyDimensions.map((dim, idx) => {
                const diff = Math.max(0, dim.targetLevel - dim.currentLevel);
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-850 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">{dim.name}</span>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-cyan-400 tabular-nums">{dim.currentLevel}%</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-indigo-400 tabular-nums">{dim.targetLevel}% Target</span>
                        <span className="text-[10px] text-amber-400 px-2 py-0.5 rounded bg-amber-950/50 border border-amber-900/60 tabular-nums">
                          -{diff}% Gap
                        </span>
                      </div>
                    </div>

                    {/* Dual Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden relative">
                      {/* Target Level background bar */}
                      <div
                        className="h-full bg-indigo-500/40 rounded-full absolute top-0 left-0"
                        style={{ width: `${dim.targetLevel}%` }}
                      />
                      {/* Current Level filled bar */}
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full absolute top-0 left-0 transition-all duration-500"
                        style={{ width: `${dim.currentLevel}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                      {dim.gapDescription}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Ranked Top 3 Skill Gaps & Action Plans */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                Action Priorities
              </span>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Your Transformation Path: Top 3 Critical Skill Gaps</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ranked blockers preventing your current profile from matching the {selectedRole} industry baseline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {twinData.topThreeGaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center font-bold text-xs tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-900">
                        {gap.priority} Priority
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight">{gap.skill}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{gap.category}</span>

                    <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-medium block text-[10px] uppercase mb-0.5">
                        Why Hiring Managers Care:
                      </span>
                      {gap.whyItMatters}
                    </div>

                    <div className="mt-3 text-xs text-slate-300 leading-relaxed">
                      <span className="text-cyan-400 font-medium block text-[10px] uppercase mb-0.5">
                        Recommended Action Plan:
                      </span>
                      {gap.actionPlan}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold mb-1">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Portfolio Deliverable:</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{gap.expectedDeliverable}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Standout "Start My Transformation" Action Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                  Close Your Career Gap
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading">
                Ready to Become Your Future Self?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {twinData.transformationSummary}
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerTransformation}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Start My Transformation</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>

          {/* 6. Transparency & Disclaimer Footer */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-300 font-medium">Educational Transparency Distinction: </span>
              Career Twin is a comparative planning and benchmarking tool, not a predictive engine or guaranteed career assessment. Skills marked as unverified indicate an absence of documentation in your current inputs rather than proof of inability. Updating your profile immediately recalibrates your Twin projection.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
