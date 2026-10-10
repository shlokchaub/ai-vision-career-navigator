import React from 'react';
import { Sparkles, FileText, Map, MessageSquareCode, ArrowRight, Zap, Target } from 'lucide-react';
import { ActiveFeature } from '../types';

interface FeatureCardsProps {
  activeFeature: ActiveFeature;
  onSelectFeature: (feature: ActiveFeature) => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  activeFeature,
  onSelectFeature,
}) => {
  const cards = [
    {
      id: 'career-twin' as ActiveFeature,
      title: 'Career Twin',
      subtitle: 'Your Future Self',
      description: 'Visual side-by-side comparison between your current skills and target role expectations.',
      badge: 'Flagship Innovation',
      accentColor: 'from-cyan-400 via-sky-500 to-indigo-500',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      activeBorder: 'border-cyan-500/80 shadow-cyan-500/20',
      icon: Zap,
      highlights: ['Current vs. Future Self', 'Dimension gap radar', 'Top 3 transformation steps'],
    },
    {
      id: 'career-matching' as ActiveFeature,
      title: 'Career Matching',
      subtitle: 'Role Discovery',
      description: 'Analyze your skills, projects, and goals to discover highly aligned tech opportunities.',
      badge: 'Alignment',
      accentColor: 'from-sky-500 to-indigo-500',
      iconBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      activeBorder: 'border-sky-500/80 shadow-sky-500/10',
      icon: Sparkles,
      highlights: ['Profile-to-role matching', 'Fit score & rationale', 'Targeted next steps'],
    },
    {
      id: 'resume-analyzer' as ActiveFeature,
      title: 'Resume Analyzer',
      subtitle: 'ATS Heuristics',
      description: 'Extract skills, evaluate ATS readiness, and polish bullet points with STAR models.',
      badge: 'ATS & Gaps',
      accentColor: 'from-indigo-500 to-violet-500',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      activeBorder: 'border-indigo-500/80 shadow-indigo-500/10',
      icon: FileText,
      highlights: ['PDF & TXT OCR parsing', 'Heuristic ATS scoring', 'Recruiter gap matrix'],
    },
    {
      id: 'career-roadmap' as ActiveFeature,
      title: 'Career Roadmap',
      subtitle: 'Sprint & Mastery',
      description: 'Get a personalized step-by-step roadmap from current baseline to target role.',
      badge: 'Action Plan',
      accentColor: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      activeBorder: 'border-emerald-500/80 shadow-emerald-500/10',
      icon: Map,
      highlights: ['7-day & 30-day horizons', 'Hands-on portfolio tasks', 'Interactive progress tracking'],
    },
    {
      id: 'virtual-interview' as ActiveFeature,
      title: 'Virtual AI Interview',
      subtitle: 'Mock Simulator',
      description: 'Practice HR, technical and behavioural interviews with personalized AI feedback.',
      badge: 'AI Mock Drill',
      accentColor: 'from-amber-500 to-rose-500',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      activeBorder: 'border-amber-500/80 shadow-amber-500/10',
      icon: MessageSquareCode,
      highlights: ['Adaptive follow-ups', 'STAR rubric scoring', 'Committee performance debrief'],
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 5 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = activeFeature === card.id;

          return (
            <div
              key={card.id}
              onClick={() => onSelectFeature(card.id)}
              className={`group relative rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between border backdrop-blur-md ${
                isActive
                  ? `bg-slate-900/95 ${card.activeBorder} shadow-xl scale-[1.01]`
                  : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700/80 shadow-md'
              }`}
            >
              {/* Top Accent Line */}
              <div
                className={`absolute top-0 left-5 right-5 h-0.5 rounded-full bg-gradient-to-r ${card.accentColor} transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
                }`}
              />

              <div>
                {/* Header: Icon & Badge */}
                <div className="flex items-center justify-between mb-3 mt-1">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] uppercase font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                    {card.badge}
                  </span>
                </div>

                {/* Card Title & Subtitle */}
                <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors font-heading">
                  {card.title}
                </h3>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5">{card.subtitle}</div>

                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed min-h-[36px]">
                  {card.description}
                </p>

                {/* Feature highlights */}
                <ul className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400">
                  {card.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 truncate">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Trigger Button */}
              <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {isActive ? 'Active' : 'Open'}
                </span>
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-transform ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-800/60 text-slate-400 group-hover:translate-x-0.5 group-hover:text-white'
                }`}>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
