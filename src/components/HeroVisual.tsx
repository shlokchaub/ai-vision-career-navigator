import React from 'react';
import { Code2, Sparkles, Target, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface HeroVisualProps {
  currentSkillsCount?: number;
  targetRole?: string;
  candidateName?: string;
}

export const HeroVisual: React.FC<HeroVisualProps> = ({
  currentSkillsCount = 8,
  targetRole = 'Software Developer',
  candidateName,
}) => {
  return (
    <div className="relative w-full max-w-5xl mx-auto my-6 sm:my-8 px-2 sm:px-4">
      {/* Outer Card with tech-mesh border */}
      <div className="relative rounded-3xl bg-slate-900/60 border border-slate-850 p-6 sm:p-8 backdrop-blur-md overflow-hidden shadow-2xl">
        {/* Ambient background glows: Soft indigo & cyan highlights */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Small header caption */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Interactive Career Transformation Flow
            </span>
          </div>
          <div className="text-[11px] font-mono text-cyan-400/90 hidden sm:block">
            Target: <span className="text-white font-medium">{targetRole}</span>
          </div>
        </div>

        {/* 3-Stage Visual Journey */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center relative">
          {/* Stage 1: Current Skills */}
          <div className="relative p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                Phase 01
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Code2 className="w-4 h-4" />
              </div>
            </div>

            <h4 className="text-sm font-bold text-white tracking-tight">Current Skills</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Academic foundation & declared competencies
            </p>

            <div className="mt-3.5 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Foundations
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Core Stack
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Toy Projects
              </span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Baseline Evidence</span>
              <span className="font-semibold text-cyan-400 tabular-nums">Verified</span>
            </div>
          </div>

          {/* Central AI Geometric Synthesis Node */}
          <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-950/90 to-cyan-950/30 border border-indigo-500/30 text-center shadow-lg">
            {/* SVG Geometric Connected Orbital Sphere */}
            <div className="relative w-28 h-28 mb-3 flex items-center justify-center">
              <svg
                viewBox="0 0 120 120"
                className="w-full h-full overflow-visible"
                aria-hidden="true"
              >
                {/* Outer dashed orbital ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  className="opacity-40 animate-[spin_24s_linear_infinite]"
                  style={{ transformOrigin: 'center' }}
                />

                {/* Counter-rotating elliptical ring */}
                <ellipse
                  cx="60"
                  cy="60"
                  rx="48"
                  ry="24"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                  className="opacity-50 animate-[spin_18s_linear_infinite_reverse]"
                  style={{ transformOrigin: 'center' }}
                />

                {/* Inner tilted ellipse */}
                <ellipse
                  cx="60"
                  cy="60"
                  rx="24"
                  ry="48"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.2"
                  strokeDasharray="6 3"
                  className="opacity-40 animate-[spin_14s_linear_infinite]"
                  style={{ transformOrigin: 'center' }}
                />

                {/* Connecting nodes */}
                <circle cx="60" cy="8" r="3.5" fill="#38bdf8" className="opacity-90" />
                <circle cx="108" cy="60" r="3" fill="#818cf8" className="opacity-90" />
                <circle cx="60" cy="112" r="3.5" fill="#38bdf8" className="opacity-90" />
                <circle cx="12" cy="60" r="3" fill="#818cf8" className="opacity-90" />

                {/* Central illuminated nucleus */}
                <circle cx="60" cy="60" r="16" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                <circle cx="60" cy="60" r="8" fill="#38bdf8" className="opacity-80 animate-pulse" />
              </svg>

              {/* Core Icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>

            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800/60 mb-1">
              Phase 02 · Synthesis
            </span>
            <h4 className="text-sm font-bold text-white tracking-tight">Skill Growth Engine</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-[210px] leading-relaxed">
              Real-time gap extraction & personalized milestone roadmap
            </p>
          </div>

          {/* Stage 3: Career Ready */}
          <div className="relative p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                Phase 03
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
            </div>

            <h4 className="text-sm font-bold text-white tracking-tight">Career Ready</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Industry standards, verified portfolio & interview polish
            </p>

            <div className="mt-3.5 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                ATS Scored
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                GitHub Shipped
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                STAR Rehearsed
              </span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Hiring Standard</span>
              <span className="font-semibold text-emerald-400">Competitive Edge</span>
            </div>
          </div>
        </div>

        {/* Bottom subtle connector note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Structured Gemini AI synthesis with zero credential fabrication</span>
          </div>
          <span className="text-slate-400 font-mono">
            {candidateName ? `Candidate: ${candidateName}` : 'Custom Profile Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};
