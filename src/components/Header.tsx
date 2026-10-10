import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  FileText,
  Map,
  MessageSquareCode,
  Search,
  RefreshCw,
  Download,
  User,
  LayoutDashboard,
  Target,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { DEMO_CANDIDATES } from '../data/samples';
import { DemoCandidate, ActiveFeature } from '../types';

interface HeaderProps {
  userName: string;
  onOpenProfile: () => void;
  activeFeature: ActiveFeature;
  onSelectFeature: (feature: ActiveFeature) => void;
  onScrollToJobSearch: () => void;
  hasResumeResults: boolean;
  onResetResume: () => void;
  onSelectDemo: (demo: DemoCandidate) => void;
  onOpenExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  onOpenProfile,
  activeFeature,
  onSelectFeature,
  onScrollToJobSearch,
  hasResumeResults,
  onResetResume,
  onSelectDemo,
  onOpenExport,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (feat: ActiveFeature) => {
    onSelectFeature(feat);
    setMobileMenuOpen(false);
  };
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3.5">
            <div
              onClick={() => onSelectFeature('dashboard')}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectFeature('dashboard')}
                  className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:text-sky-300 transition-colors cursor-pointer"
                >
                  <span>AI VISION</span>
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-normal">
                Personalized AI tools for your career journey
              </p>
            </div>
          </div>

          {/* Quick Nav & Tools Shortcuts */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => onSelectFeature('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeature === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-sky-300" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectFeature('career-twin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeature === 'career-twin'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-cyan-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Career Twin</span>
            </button>

            <button
              onClick={() => onSelectFeature('career-matching')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeature === 'career-matching'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>Career Matching</span>
            </button>

            <button
              onClick={() => onSelectFeature('resume-analyzer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeature === 'resume-analyzer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>Resume Analyzer</span>
            </button>

            <button
              onClick={() => onSelectFeature('skill-gap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeature === 'skill-gap'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-sky-300" />
              <span>Skill Gap</span>
            </button>

            <button
              onClick={() => onSelectFeature('career-roadmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeature === 'career-roadmap'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-emerald-300" />
              <span>Roadmap</span>
            </button>

            <button
              onClick={() => onSelectFeature('virtual-interview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeature === 'virtual-interview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Interview</span>
            </button>

            <button
              onClick={onScrollToJobSearch}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-sky-400 hover:text-sky-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Job Search</span>
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Profile Selector */}
            <select
              aria-label="Load demo student profile"
              defaultValue=""
              onChange={(e) => {
                const found = DEMO_CANDIDATES.find((c) => c.id === e.target.value);
                if (found) {
                  onSelectDemo(found);
                }
              }}
              className="text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-2 cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="" disabled>
                Load Sample Candidate
              </option>
              {DEMO_CANDIDATES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.targetRole})
                </option>
              ))}
            </select>

            {hasResumeResults && (
              <>
                {onOpenExport && (
                  <button
                    onClick={onOpenExport}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-3 py-2 transition-colors cursor-pointer hidden md:flex"
                    title="Export formatted report"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Export</span>
                  </button>
                )}

                <button
                  onClick={onResetResume}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 rounded-lg px-2.5 py-1.5 sm:py-2 transition-colors cursor-pointer"
                  title="Reset analysis"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </>
            )}

            {/* Profile Button in Top Nav */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Edit Candidate Profile"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-slate-950 shrink-0">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-semibold max-w-[90px] sm:max-w-[120px] truncate">
                {userName || 'My Profile'}
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-slate-800/80 bg-slate-950/95 space-y-1 animate-in fade-in duration-150">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${
                activeFeature === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-sky-400" />
              <span>Dashboard & Readiness Score</span>
            </button>

            <button
              onClick={() => handleNavClick('career-twin')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${
                activeFeature === 'career-twin' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Career Twin — Future Self</span>
            </button>

            <button
              onClick={() => handleNavClick('career-matching')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${
                activeFeature === 'career-matching' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>AI Career Matching</span>
            </button>

            <button
              onClick={() => handleNavClick('resume-analyzer')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${
                activeFeature === 'resume-analyzer' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>AI Resume Analyzer</span>
            </button>

            <button
              onClick={() => handleNavClick('skill-gap')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${
                activeFeature === 'skill-gap' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Target className="w-4 h-4 text-sky-400" />
              <span>Skill Gap Analyser</span>
            </button>

            <button
              onClick={() => handleNavClick('career-roadmap')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${
                activeFeature === 'career-roadmap' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Map className="w-4 h-4 text-emerald-400" />
              <span>Learning Roadmap</span>
            </button>

            <button
              onClick={() => handleNavClick('virtual-interview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${
                activeFeature === 'virtual-interview' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <MessageSquareCode className="w-4 h-4 text-amber-400" />
              <span>Virtual AI Interview</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToJobSearch();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-sky-400 hover:bg-slate-900"
            >
              <Search className="w-4 h-4" />
              <span>Skill-Based Job Search</span>
            </button>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900"
              >
                <User className="w-4 h-4 text-sky-400" />
                <span>My Profile & Preferences ({userName || 'Guest'})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
