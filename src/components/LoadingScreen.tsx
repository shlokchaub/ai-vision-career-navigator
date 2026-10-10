import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, CheckCircle, Cpu, Loader2 } from 'lucide-react';

const SCAN_STEPS = [
  'Ingesting resume document architecture & extracting verified evidence...',
  'Cross-referencing technical skills against target job specifications...',
  'Computing ATS-inspired keyword, impact & section heuristic scores...',
  'Synthesizing entry-level career pathways & adjacent role trajectories...',
  'Formulating targeted learning roadmap milestones & interview practice questions...',
];

export const LoadingScreen: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Central Animated Compass / Radar Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-violet-500 animate-pulse opacity-40 blur-md" />
          <div className="relative w-full h-full bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
            <Compass className="w-10 h-10 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight mb-2">
          AI VISION Analysing Profile
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Google Gemini 3.8 Flash is parsing your resume against the target role requirements
        </p>

        {/* Progress Steps List */}
        <div className="space-y-3 text-left">
          {SCAN_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-300 text-xs ${
                  isCurrent
                    ? 'bg-slate-950/80 border border-indigo-500/50 text-indigo-200'
                    : isDone
                    ? 'bg-slate-950/40 border border-slate-900 text-slate-400'
                    : 'opacity-40 text-slate-600'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                  )}
                </div>
                <div className="flex-1 leading-snug">{step}</div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Cpu className="w-3 h-3 text-indigo-400" />
          <span>Multimodal Reasoning & Structured Output Extraction</span>
        </div>
      </div>
    </div>
  );
};
