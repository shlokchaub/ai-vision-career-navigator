import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { AnalysisResult } from '../../types';

interface OverviewTabProps {
  data: AnalysisResult;
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data, onNavigateTab }) => {
  const criticalGaps = data.skillGapAnalysis.filter(
    (g) => g.priority === 'critical' && g.status !== 'demonstrated'
  );

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Executive Evaluation</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {data.executiveSummary}
        </p>

        {/* Role fit rationale */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>Role Fit Methodology & Entry-Level Perspective</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {data.roleFitRationale}
          </p>
        </div>
      </div>

      {/* Grid: Key Strengths vs Critical Gap Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verified Strengths */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Demonstrated Strengths</h3>
              </div>
              <span className="text-xs text-slate-400">
                {data.keyStrengths.length} verified in resume
              </span>
            </div>

            <div className="space-y-3.5">
              {data.keyStrengths.map((strength, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70"
                >
                  <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{strength.title}</span>
                  </div>
                  <div className="mt-1.5 text-xs text-slate-300 italic border-l-2 border-emerald-500/40 pl-2.5">
                    "{strength.evidenceQuote}"
                  </div>
                  <div className="mt-1.5 text-[11px] text-slate-400">
                    <span className="text-slate-400 font-medium">Hiring Impact:</span> {strength.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('skills')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>View all demonstrated competencies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Critical Skill Gap Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Priority Skill Blockers</h3>
              </div>
              <span className="text-xs text-amber-400 font-medium">
                {criticalGaps.length} critical requirement{criticalGaps.length !== 1 ? 's' : ''}
              </span>
            </div>

            {criticalGaps.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                No critical baseline blockers found! Your profile covers the core prerequisites for this entry-level role.
              </div>
            ) : (
              <div className="space-y-3.5">
                {criticalGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-900/30"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-amber-300">{gap.skill}</span>
                      <span className="text-[10px] text-amber-400 uppercase tracking-wider font-mono">
                        {gap.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mb-1">
                      <span className="text-slate-400 font-medium">Requirement:</span> {gap.jobRequirement}
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">
                      {gap.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('roadmap')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open tailored roadmap to close these blockers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Navigator Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-white">Recommended Next Action</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Review your ATS-inspired heuristic score or start practicing tailored interview questions.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('ats')}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Review ATS Heuristics
            </button>
            <button
              onClick={() => onNavigateTab('interview')}
              className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
            >
              Practice Interview Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
