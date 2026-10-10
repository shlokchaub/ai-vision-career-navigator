import React from 'react';
import {
  Award,
  User,
  Target,
  Code2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Map,
  MessageSquareCode,
  Search,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UserProfile, AnalysisResult } from '../types';

interface PersonalizedResultsViewProps {
  userProfile: UserProfile;
  analysisData: AnalysisResult;
  onStartMockInterview: () => void;
  onExploreRoadmap: () => void;
  onOpenJobSearch: () => void;
  onGenerateNewAnalysis: () => void;
  onOpenResumeAnalyzer: () => void;
}

export const PersonalizedResultsView: React.FC<PersonalizedResultsViewProps> = ({
  userProfile,
  analysisData,
  onStartMockInterview,
  onExploreRoadmap,
  onOpenJobSearch,
  onGenerateNewAnalysis,
  onOpenResumeAnalyzer,
}) => {
  const candidateName = userProfile.name || analysisData.candidateName || 'Candidate';
  const targetRole = userProfile.targetRole || 'Software Engineer';
  const readinessScore = Math.round(
    analysisData.roleFitScore * 0.5 + analysisData.atsEvaluation.overallScore * 0.5
  );

  const missingGaps = analysisData.skillGapAnalysis.filter((g) => g.status === 'missing');
  const demonstratedSkills = analysisData.skillGapAnalysis.filter((g) => g.status === 'demonstrated');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Personalized Career Readiness Report</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Evaluation for {candidateName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Target Career Goal: <span className="text-sky-400 font-semibold">{targetRole}</span>
              {userProfile.preferredLocation && (
                <span className="text-slate-400"> · Preferred Location: {userProfile.preferredLocation}</span>
              )}
            </p>
          </div>

          {/* Readiness Score Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4 shrink-0 self-start md:self-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/60 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black text-sky-400">
                {readinessScore}
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase">/ 100</span>
            </div>
            <div>
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Readiness Score
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 max-w-[170px] leading-tight">
                Role fit: {analysisData.roleFitScore}% · ATS index: {analysisData.atsEvaluation.overallScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="pt-6">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <span className="font-semibold text-white block mb-1">Candid AI Profile Evaluation:</span>
            {analysisData.executiveSummary}
          </p>
        </div>

        {/* Controls: Generate New Analysis */}
        <div className="pt-5 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Candidate: <span className="text-slate-200 font-medium">{candidateName}</span> · Generated in real-time with Google Gemini 3.8 Flash
          </span>

          <button
            type="button"
            onClick={onGenerateNewAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New Analysis</span>
          </button>
        </div>
      </div>

      {/* Grid: Current Skills vs Key Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Current Verified Skills */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Current Verified Skills ({demonstratedSkills.length})</span>
            </h4>
            <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
              Strong Grounding
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {demonstratedSkills.length > 0 ? (
              demonstratedSkills.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-200 font-medium flex items-center gap-1"
                >
                  <span>✓</span>
                  <span>{item.skill}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Skills list recorded from profile.</span>
            )}
          </div>

          {/* Key Strengths verified from resume */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Highlighted Achievements:
            </span>
            {analysisData.keyStrengths.slice(0, 2).map((str, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-semibold text-sky-300 mb-0.5">{str.title}</div>
                <div className="text-slate-400 text-[11px] leading-snug">"{str.evidenceQuote}"</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Skill Gaps to Close */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Key Skill Gaps for {targetRole}</span>
            </h4>
            <span className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider">
              High Priority
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {missingGaps.slice(0, 3).map((gap, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300">{gap.skill}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-900">
                    {gap.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {gap.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Priority Improvements */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <span>Top 3 Priority Improvements for {candidateName}</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {analysisData.atsEvaluation.actionableImprovementTips.slice(0, 3).map((tip, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center font-bold text-[10px] mb-2">
                  {idx + 1}
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {tip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Hub: Direct actions to interview, roadmap, resume, and job search */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <span>Recommended Next Actions for {candidateName}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Action 1: Mock Interview */}
          <button
            type="button"
            onClick={onStartMockInterview}
            className="p-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/80 hover:border-indigo-600 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="text-indigo-300 font-bold flex items-center justify-between mb-1">
                <span>Start Mock Interview</span>
                <MessageSquareCode className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-slate-400 text-[11px] leading-snug">
                Rehearse tailored questions testing your identified gap skills with STAR feedback.
              </p>
            </div>
            <div className="mt-3 text-indigo-300 font-semibold text-[11px] flex items-center gap-1">
              <span>Open AI Simulator</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Action 2: Learning Roadmap */}
          <button
            type="button"
            onClick={onExploreRoadmap}
            className="p-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/80 hover:border-emerald-600 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="text-emerald-300 font-bold flex items-center justify-between mb-1">
                <span>View Learning Roadmap</span>
                <Map className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-slate-400 text-[11px] leading-snug">
                Follow your step-by-step milestone plan with hands-on GitHub projects.
              </p>
            </div>
            <div className="mt-3 text-emerald-300 font-semibold text-[11px] flex items-center gap-1">
              <span>View Milestones</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Action 3: Resume Review */}
          <button
            type="button"
            onClick={onOpenResumeAnalyzer}
            className="p-4 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/80 hover:border-sky-600 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="text-sky-300 font-bold flex items-center justify-between mb-1">
                <span>Resume & ATS Breakdown</span>
                <FileText className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-slate-400 text-[11px] leading-snug">
                Inspect ATS breakdown dimensions, measurable metrics, and section depth.
              </p>
            </div>
            <div className="mt-3 text-sky-300 font-semibold text-[11px] flex items-center gap-1">
              <span>Open ATS Details</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Action 4: Skill-Based Job Search */}
          <button
            type="button"
            onClick={onOpenJobSearch}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="text-slate-200 font-bold flex items-center justify-between mb-1">
                <span>Skill Job Search</span>
                <Search className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-slate-400 text-[11px] leading-snug">
                Open verified LinkedIn and Naukri job openings matching your exact skills.
              </p>
            </div>
            <div className="mt-3 text-sky-300 font-semibold text-[11px] flex items-center gap-1">
              <span>Find Matching Jobs</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
