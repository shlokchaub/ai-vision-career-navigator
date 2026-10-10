import React from 'react';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Info,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { AtsEvaluation } from '../../types';

interface AtsEvaluatorTabProps {
  evaluation: AtsEvaluation;
}

export const AtsEvaluatorTab: React.FC<AtsEvaluatorTabProps> = ({ evaluation }) => {
  const { overallScore, disclaimer, breakdown, actionableImprovementTips } = evaluation;

  const dimensions = [
    {
      name: 'Keyword & Terminology Alignment',
      description: 'Alignment of technical terms and concepts with standard industry specifications',
      data: breakdown.keywordAlignment,
    },
    {
      name: 'Readability & Structural Flow',
      description: 'Hierarchy, parseability, section cleanliness, and scanning ergonomics',
      data: breakdown.readabilityAndStructure,
    },
    {
      name: 'Measurable Impact & Metrics',
      description: 'Quantifiable achievements, efficiency gains, and metric-backed results',
      data: breakdown.measurableImpact,
    },
    {
      name: 'Project Depth & Proof of Work',
      description: 'Verifiable technical stack details, architecture, and complexity indicators',
      data: breakdown.projectDepth,
    },
    {
      name: 'Essential Section Completeness',
      description: 'Presence of clear Education, Skills, Projects, and Experience blocks',
      data: breakdown.essentialSections,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 65) return 'text-sky-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getProgressBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-sky-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Educational Disclaimer Banner - Critical requirement */}
      <div className="bg-indigo-950/40 border border-indigo-800/80 rounded-2xl p-4.5 sm:p-5 flex items-start gap-3.5 shadow-sm">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-indigo-200">
            Educational ATS-Inspired Heuristic Model
          </div>
          <p className="text-slate-300 leading-relaxed">
            {disclaimer ||
              'This score is an educational simulation based on industry best practices for resume readability, keyword presence, and measurable outcomes. It is not an official score from any commercial ATS vendor (such as Workday, Taleo, or Greenhouse) and does not guarantee interview shortlisting.'}
          </p>
        </div>
      </div>

      {/* Main Scorecard Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Resume Heuristic Assessment
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Applicant Tracking Systems and technical screeners parse resumes looking for strong structural clarity, explicit technical terminology, and quantified impact. Here is how your uploaded resume benchmarks.
            </p>
          </div>

          {/* Big Score Gauge Card */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
            <div className="text-center">
              <div className={`text-4xl sm:text-5xl font-black tracking-tight ${getScoreColor(overallScore)}`}>
                {overallScore}
                <span className="text-base font-normal text-slate-500">/100</span>
              </div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                Heuristic Readiness
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Dimensions Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-white tracking-tight mb-5">
          Dimension Breakdown & Findings
        </h3>

        <div className="space-y-5">
          {dimensions.map((dim, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white">{dim.name}</div>
                  <div className="text-[11px] text-slate-400">{dim.description}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getProgressBg(dim.data.score)}`}
                      style={{ width: `${dim.data.score}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${getScoreColor(dim.data.score)} w-12 text-right`}>
                    {dim.data.score}/100
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-snug pt-1 border-t border-slate-800/60">
                {dim.data.feedback}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Improvement Tips */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Targeted Resume Polish Recommendations
          </h3>
        </div>

        <div className="space-y-3">
          {actionableImprovementTips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resume Bullet Polish Studio: Before vs After Examples */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>High-Impact Resume Bullet Formula</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Before vs. After: Transforming Weak Bullets into Recruiter-Ready Impact
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Hiring managers look for the Google XYZ framework: <span className="text-sky-300 font-semibold">"Accomplished [X] as measured by [Y], by doing [Z]"</span>. Compare common weak bullets with high-conversion versions:
          </p>
        </div>

        <div className="space-y-4 text-xs">
          {/* Example 1: Frontend */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="text-[11px] font-mono uppercase text-sky-400 font-semibold">
              Example 1 · Frontend Development
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-200">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  ✗ Weak / Generic Bullet Point
                </span>
                <p className="text-slate-300 italic">
                  "Worked on frontend features using React and created responsive components for the college portal."
                </p>
                <div className="text-[10px] text-rose-400/80 mt-1.5">
                  Missing metrics, scale, specific libraries, or tangible business impact.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-200">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  ✓ High-Impact Measurable Rewrite
                </span>
                <p className="text-emerald-100 font-medium">
                  "Engineered 14 responsive React UI components using TypeScript and Tailwind CSS, reducing bundle size by 18% and serving 1,400+ weekly student users with zero layout shifts."
                </p>
                <div className="text-[10px] text-emerald-400/80 mt-1.5">
                  Contains action verb, quantifiable metric (14 components, 18%, 1400 users), and exact tech stack.
                </div>
              </div>
            </div>
          </div>

          {/* Example 2: Backend & Database */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="text-[11px] font-mono uppercase text-indigo-400 font-semibold">
              Example 2 · Backend & Relational Databases
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-200">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  ✗ Weak / Generic Bullet Point
                </span>
                <p className="text-slate-300 italic">
                  "Wrote SQL queries and helped design database tables in PostgreSQL."
                </p>
                <div className="text-[10px] text-rose-400/80 mt-1.5">
                  Passive tone, no query complexity mentioned, no benchmark of performance improvement.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-200">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  ✓ High-Impact Measurable Rewrite
                </span>
                <p className="text-emerald-100 font-medium">
                  "Architected normalized PostgreSQL relational schemas and optimized multi-table JOIN queries with B-tree indexes, improving search API response times by 35% across 5,000+ daily requests."
                </p>
                <div className="text-[10px] text-emerald-400/80 mt-1.5">
                  Demonstrates architecture understanding, query optimization, and latency decrease.
                </div>
              </div>
            </div>
          </div>

          {/* Example 3: Testing & DevOps */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="text-[11px] font-mono uppercase text-amber-400 font-semibold">
              Example 3 · Automated Testing & Deployment
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-200">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  ✗ Weak / Generic Bullet Point
                </span>
                <p className="text-slate-300 italic">
                  "Tested application and used Docker to run containers on my computer."
                </p>
                <div className="text-[10px] text-rose-400/80 mt-1.5">
                  Sounds like homework; fails to convey production quality or automation standards.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-200">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  ✓ High-Impact Measurable Rewrite
                </span>
                <p className="text-emerald-100 font-medium">
                  "Containerized microservices via multi-stage Docker builds and authored 40+ unit/integration tests with Jest, boosting code coverage to 82% and integrating automated CI checks on GitHub Actions."
                </p>
                <div className="text-[10px] text-emerald-400/80 mt-1.5">
                  Highlights CI automation, coverage statistics, and modern container practices.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
