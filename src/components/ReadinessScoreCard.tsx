import React from 'react';
import { Award, TrendingUp, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, FileText, Code2, MessageSquareCode, Target } from 'lucide-react';
import { UserProfile, AnalysisResult } from '../types';

interface ReadinessScoreCardProps {
  userProfile: UserProfile;
  analysisData: AnalysisResult | null;
  onNavigateToFeature: (feature: 'resume-analyzer' | 'skill-gap' | 'career-roadmap' | 'virtual-interview' | 'job-search') => void;
}

export const ReadinessScoreCard: React.FC<ReadinessScoreCardProps> = ({
  userProfile,
  analysisData,
  onNavigateToFeature,
}) => {
  // Compute illustrative readiness breakdown
  const hasResume = !!analysisData;
  const atsScore = analysisData?.atsEvaluation?.overallScore || 0;
  const roleFitScore = analysisData?.roleFitScore || 0;
  
  // Profile completeness calculation
  const skillsCount = userProfile.skills.split(',').filter((s) => s.trim().length > 0).length;
  const profileCompletenessScore = Math.min(100, Math.round(
    (userProfile.name ? 20 : 0) +
    (userProfile.targetRole ? 25 : 0) +
    (skillsCount >= 4 ? 30 : skillsCount * 7.5) +
    (userProfile.degree ? 15 : 0) +
    (userProfile.interests ? 10 : 0)
  ));

  // Overall readiness score
  let overallReadinessScore = 0;
  if (hasResume) {
    overallReadinessScore = Math.round(roleFitScore * 0.45 + atsScore * 0.35 + profileCompletenessScore * 0.2);
  } else if (profileCompletenessScore > 40) {
    // Initial benchmark based on profile
    overallReadinessScore = Math.min(65, Math.round(profileCompletenessScore * 0.65));
  }

  const scoreTier =
    overallReadinessScore >= 80
      ? { label: 'High Readiness', color: 'text-emerald-400', ring: 'border-emerald-500/80', bg: 'bg-emerald-500/10' }
      : overallReadinessScore >= 60
      ? { label: 'Moderate Readiness', color: 'text-sky-400', ring: 'border-sky-500/80', bg: 'bg-sky-500/10' }
      : { label: 'Foundational Baseline', color: 'text-amber-400', ring: 'border-amber-500/80', bg: 'bg-amber-500/10' };

  return (
    <div className="bg-slate-900/85 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Background Accent Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-40 bg-sky-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-40 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Candidate Greeting */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Job-Readiness Evaluation</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Career Readiness Index for {userProfile.name ? userProfile.name : 'Candidate'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Targeting: <span className="text-sky-400 font-semibold">{userProfile.targetRole || 'Software Engineering'}</span>
            {userProfile.preferredLocation && (
              <span className="text-slate-400"> · {userProfile.preferredLocation}</span>
            )}
          </p>
        </div>

        {/* Big Circular/Badge Metric */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shrink-0 self-start lg:self-auto">
          <div className={`w-18 h-18 rounded-2xl border ${scoreTier.ring} ${scoreTier.bg} flex flex-col items-center justify-center`}>
            <span className={`text-2xl sm:text-3xl font-black ${scoreTier.color}`}>
              {overallReadinessScore}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              / 100
            </span>
          </div>

          <div>
            <div className={`text-xs font-bold ${scoreTier.color} uppercase tracking-wider`}>
              {scoreTier.label}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[190px] leading-tight">
              {hasResume
                ? 'Synthesized from resume evidence, verified skills, and role match'
                : 'Upload your resume below to unlock verified ATS & gap benchmarking'}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-slate-800">
        {/* Pillar 1: Profile Completeness */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              Skills & Profile
            </span>
            <span className="font-bold text-sky-400">{profileCompletenessScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${profileCompletenessScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {skillsCount} skills entered ({userProfile.education || 'Student'})
          </p>
        </div>

        {/* Pillar 2: Resume Quality */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Resume & ATS
            </span>
            <span className="font-bold text-indigo-400">
              {hasResume ? `${atsScore}%` : 'Pending'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${atsScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {hasResume ? 'Heuristic structure & keyword parseability' : 'Upload resume in section below'}
          </p>
        </div>

        {/* Pillar 3: Role Alignment */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Role Alignment
            </span>
            <span className="font-bold text-emerald-400">
              {hasResume ? `${roleFitScore}%` : 'Estimated'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${hasResume ? roleFitScore : 55}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {hasResume ? 'Calculated vs job specifications' : 'Matched to entry-level criteria'}
          </p>
        </div>

        {/* Pillar 4: Interview Preparedness */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquareCode className="w-3.5 h-3.5 text-amber-400" />
              Interview Drill
            </span>
            <span className="font-bold text-amber-400">
              {hasResume ? 'Ready to Test' : 'Available'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%' }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Interactive STAR mock questions ready
          </p>
        </div>
      </div>

      {/* Actionable Next Steps to Improve Score */}
      <div className="pt-6 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <span>Priority Actions to Boost {userProfile.name ? `${userProfile.name}'s` : 'Your'} Career Readiness</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Action 1 */}
          <div
            onClick={() => onNavigateToFeature('resume-analyzer')}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="font-semibold text-sky-300 flex items-center justify-between">
                <span>1. Run Resume Gap Analysis</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                Scan your PDF against real job postings to expose missing keywords and weak bullet points.
              </p>
            </div>
            <div className="mt-2 text-[10px] text-indigo-400 font-medium">Estimated impact: +15 to +25 pts</div>
          </div>

          {/* Action 2 */}
          <div
            onClick={() => onNavigateToFeature('career-roadmap')}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="font-semibold text-emerald-300 flex items-center justify-between">
                <span>2. Follow 7-Day Sprint Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                Build verifiable GitHub portfolio milestones in testing, Docker, and caching to close high-priority gaps.
              </p>
            </div>
            <div className="mt-2 text-[10px] text-emerald-400 font-medium">Estimated impact: +10 to +20 pts</div>
          </div>

          {/* Action 3 */}
          <div
            onClick={() => onNavigateToFeature('virtual-interview')}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="font-semibold text-amber-300 flex items-center justify-between">
                <span>3. Complete Virtual AI Interview</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                Rehearse technical and behavioural screening questions with real-time Gemini rubric scoring and STAR models.
              </p>
            </div>
            <div className="mt-2 text-[10px] text-amber-400 font-medium">Estimated impact: +10 to +15 pts</div>
          </div>
        </div>
      </div>

      {/* Transparent Disclaimer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-300 font-medium">Evaluation Transparency Notice: </span>
          The Career Readiness Index is an illustrative, educational estimate generated via AI heuristics comparing candidate credentials with entry-level tech hiring patterns. It does not represent an official assessment or guaranteed probability of employment from any recruiter or employer.
        </div>
      </div>
    </div>
  );
};
