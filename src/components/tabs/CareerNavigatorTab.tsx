import React from 'react';
import { Compass, TrendingUp, CheckCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { CareerRoleRecommendation } from '../../types';

interface CareerNavigatorTabProps {
  roles: CareerRoleRecommendation[];
  targetRole: string;
}

export const CareerNavigatorTab: React.FC<CareerNavigatorTabProps> = ({ roles, targetRole }) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Career Navigator: Recommended Entry-Level Roles
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          Based on verified technical foundations in your resume, here are adjacent and alternative entry-level job roles where your current skillset translates into high hiring competitiveness.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {roles.map((role, idx) => (
          <div
            key={idx}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              {/* Header: Title & Match */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {role.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Entry-Level / Early Career Pathway
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-black text-sky-400">
                    {role.matchPercentage}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Profile Fit
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {role.rationale}
              </p>

              {/* Skills to Leverage vs Skills to Bridge */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Skills You Can Leverage Now</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.leverageSkills.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                    <span>Bridge Skills to Excel</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.bridgeSkills.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-indigo-950/40 border border-indigo-900/60 text-indigo-300 text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Market Outlook */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Market Demand:</span>
              </span>
              <span className="text-slate-300 font-medium">{role.marketOutlook}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
