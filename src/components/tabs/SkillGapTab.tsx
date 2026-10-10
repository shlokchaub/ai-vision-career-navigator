import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertCircle,
  Filter,
  Check,
  ChevronRight,
  Briefcase,
  Layers,
} from 'lucide-react';
import { SkillGapItem, SkillStatus, SkillPriority } from '../../types';

interface SkillGapTabProps {
  skills: SkillGapItem[];
}

export const SkillGapTab: React.FC<SkillGapTabProps> = ({ skills }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const demonstratedCount = skills.filter((s) => s.status === 'demonstrated').length;
  const partialCount = skills.filter((s) => s.status === 'partial').length;
  const missingCount = skills.filter((s) => s.status === 'missing').length;
  const criticalCount = skills.filter((s) => s.priority === 'critical').length;

  const filteredSkills = skills.filter((skill) => {
    if (filterStatus !== 'all' && skill.status !== filterStatus) return false;
    if (filterPriority !== 'all' && skill.priority !== filterPriority) return false;
    return true;
  });

  const getStatusIcon = (status: SkillStatus) => {
    switch (status) {
      case 'demonstrated':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'missing':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
    }
  };

  const getPriorityColor = (priority: SkillPriority) => {
    switch (priority) {
      case 'critical':
        return 'text-rose-400 font-semibold';
      case 'high':
        return 'text-amber-400 font-medium';
      case 'medium':
        return 'text-sky-400 font-normal';
      case 'low':
        return 'text-slate-400 font-normal';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary stats */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Dynamic Skill Gap Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Cross-examination of resume-verified proof vs. target job specifications.
            </p>
          </div>

          {/* Quick metric stats */}
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div>
              <span className="text-emerald-400 font-bold">{demonstratedCount}</span>
              <span className="text-slate-400 ml-1">Demonstrated</span>
            </div>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <div>
              <span className="text-amber-400 font-bold">{partialCount}</span>
              <span className="text-slate-400 ml-1">Partial</span>
            </div>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <div>
              <span className="text-rose-400 font-bold">{missingCount}</span>
              <span className="text-slate-400 ml-1">Missing</span>
            </div>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Status buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Skills ({skills.length})
            </button>
            <button
              onClick={() => setFilterStatus('demonstrated')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'demonstrated'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demonstrated ({demonstratedCount})
            </button>
            <button
              onClick={() => setFilterStatus('partial')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'partial'
                  ? 'bg-amber-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Partial ({partialCount})
            </button>
            <button
              onClick={() => setFilterStatus('missing')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'missing'
                  ? 'bg-rose-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Missing ({missingCount})
            </button>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical ({criticalCount})</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills Matrix Cards */}
      <div className="space-y-4">
        {filteredSkills.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-400">
            No skills match the selected filter criteria.
          </div>
        ) : (
          filteredSkills.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {getStatusIcon(item.status)}
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {item.skill}
                  </h3>
                </div>

                {/* Status & Priority metadata (Zero-pill discipline: unboxed text with separators) */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="capitalize">{item.status}</span>
                  <span aria-hidden="true">·</span>
                  <span className={`capitalize ${getPriorityColor(item.priority)}`}>
                    {item.priority} Priority
                  </span>
                </div>
              </div>

              {/* Grid: Job Requirement vs Resume Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider mb-1">
                    Job Requirement
                  </div>
                  <div className="text-slate-300 leading-snug">
                    {item.jobRequirement}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                    Resume Evidence Found
                  </div>
                  <div className="text-slate-300 leading-snug">
                    {item.resumeEvidence ? (
                      <span>"{item.resumeEvidence}"</span>
                    ) : (
                      <span className="text-slate-400 italic">No verifiable evidence detected in uploaded resume</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recruiter Expectation & Actionable Explanation */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-300">Recruiter Expectation: </span>
                  <span className="text-slate-400">{item.recruiterExpectation}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-300">Gap Analysis & Bridge Action: </span>
                  <span className="text-slate-300">{item.explanation}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
