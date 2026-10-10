import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  FileCheck2,
  Compass,
  Calendar,
  MessageSquare,
  Download,
  RefreshCw,
  Target,
  FileText,
  AlertTriangle,
  Award,
  ChevronRight,
} from 'lucide-react';
import { AnalysisResult, StudentProfile } from '../types';
import { OverviewTab } from './tabs/OverviewTab';
import { SkillGapTab } from './tabs/SkillGapTab';
import { AtsEvaluatorTab } from './tabs/AtsEvaluatorTab';
import { CareerNavigatorTab } from './tabs/CareerNavigatorTab';
import { RoadmapTab } from './tabs/RoadmapTab';
import { InterviewPrepTab } from './tabs/InterviewPrepTab';
import { ReportModal } from './ReportModal';

interface DashboardProps {
  data: AnalysisResult;
  profile: StudentProfile;
  targetRole: string;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  profile,
  targetRole,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isReportOpen, setIsReportOpen] = useState(false);

  const demonstratedCount = data.skillGapAnalysis.filter(
    (s) => s.status === 'demonstrated'
  ).length;
  const criticalCount = data.skillGapAnalysis.filter(
    (s) => s.priority === 'critical' && s.status !== 'demonstrated'
  ).length;

  const navItems = [
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: `${data.roleFitScore}% Fit`,
    },
    {
      id: 'skills',
      label: 'Skill Gap Matrix',
      icon: Layers,
      badge: `${criticalCount} Blockers`,
    },
    {
      id: 'ats',
      label: 'ATS Heuristic Review',
      icon: FileCheck2,
      badge: `${data.atsEvaluation.overallScore}/100`,
    },
    {
      id: 'roles',
      label: 'Career Navigator',
      icon: Compass,
      badge: `${data.careerNavigatorRoles.length} Roles`,
    },
    {
      id: 'roadmap',
      label: 'Actionable Roadmap',
      icon: Calendar,
      badge: data.learningRoadmap.duration,
    },
    {
      id: 'interview',
      label: 'Interview Practice',
      icon: MessageSquare,
      badge: 'Simulator',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Profile Summary & Key Metrics Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
              <span>Target Role Analysis</span>
              <span aria-hidden="true">·</span>
              <span>Candidate: {profile.name || 'Student Candidate'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {targetRole}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {profile.education} · {profile.degree} · {profile.experience}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download Report</span>
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/70 border border-indigo-800 text-indigo-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Modify Inputs</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* 1. Role Fit */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Role Fit Match</span>
              <Target className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-400 tracking-tight">
              {data.roleFitScore}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Entry-level alignment estimate
            </div>
          </div>

          {/* 2. ATS Heuristic Score */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>ATS Heuristic</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-400 tracking-tight">
              {data.atsEvaluation.overallScore}
              <span className="text-sm font-normal text-slate-500">/100</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Educational scanning heuristic
            </div>
          </div>

          {/* 3. Demonstrated vs Gaps */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Skill Coverage</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {demonstratedCount}
              <span className="text-sm font-normal text-slate-500">
                {' '}
                / {data.skillGapAnalysis.length}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Evidenced in resume
            </div>
          </div>

          {/* 4. Critical Blockers */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Priority Blockers</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              {criticalCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Critical gap{criticalCount !== 1 ? 's' : ''} to resolve
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Sidebar Navigation + Tab Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2 sticky top-24">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-sm space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isActive
                        ? 'bg-indigo-700/80 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* AI Verification Standards Note Box */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-indigo-300 font-semibold block mb-1">
              AI Verification Standards
            </span>
            Real-time JSON schema-constrained generation with zero fabrication of experience or credentials.
          </div>
        </div>

        {/* Right Tab Content View */}
        <div className="lg:col-span-9">
          {activeTab === 'overview' && (
            <OverviewTab data={data} onNavigateTab={setActiveTab} />
          )}
          {activeTab === 'skills' && (
            <SkillGapTab skills={data.skillGapAnalysis} />
          )}
          {activeTab === 'ats' && (
            <AtsEvaluatorTab evaluation={data.atsEvaluation} />
          )}
          {activeTab === 'roles' && (
            <CareerNavigatorTab
              roles={data.careerNavigatorRoles}
              targetRole={targetRole}
            />
          )}
          {activeTab === 'roadmap' && (
            <RoadmapTab roadmap={data.learningRoadmap} />
          )}
          {activeTab === 'interview' && (
            <InterviewPrepTab
              questions={data.interviewPreparation}
              targetRole={targetRole}
            />
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        data={data}
        profile={profile}
        targetRole={targetRole}
      />
    </div>
  );
};
