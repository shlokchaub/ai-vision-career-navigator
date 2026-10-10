import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { StarBackground } from './components/StarBackground';
import { FeatureCards } from './components/FeatureCards';
import { HeroVisual } from './components/HeroVisual';
import { SkillJobSearch } from './components/SkillJobSearch';
import { CareerMatchingTool } from './components/tools/CareerMatchingTool';
import { CareerRoadmapTool } from './components/tools/CareerRoadmapTool';
import { VirtualInterviewTool } from './components/tools/VirtualInterviewTool';
import { SkillGapAnalyzerTool } from './components/tools/SkillGapAnalyzerTool';
import { CareerTwinTool } from './components/tools/CareerTwinTool';
import { AnalysisForm } from './components/AnalysisForm';
import { LoadingScreen } from './components/LoadingScreen';
import { Dashboard } from './components/Dashboard';
import { ReportModal } from './components/ReportModal';
import { ProfileModal } from './components/ProfileModal';
import { ReadinessScoreCard } from './components/ReadinessScoreCard';
import { PersonalizedResultsView } from './components/PersonalizedResultsView';
import { AnalysisResult, StudentProfile, DemoCandidate, ActiveFeature, UserProfile } from './types';
import { DEMO_CANDIDATES } from './data/samples';
import {
  AlertCircle,
  Compass,
  Cpu,
  Sparkles,
  User,
  LayoutDashboard,
  Target,
  FileText,
  Map,
  MessageSquareCode,
  Search,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Edit3,
  Zap,
} from 'lucide-react';

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@college.edu',
  education: 'Bachelor of Technology / B.E.',
  college: 'National Institute of Technology (NIT)',
  degree: 'B.Tech in Computer Science & Engineering',
  experienceYear: 'Final-Year / 4th Year Student',
  interests: 'Scalable web systems, cloud infrastructure, modern full-stack development, API engineering',
  skills: 'Python, Java, JavaScript, React, Node.js, PostgreSQL, SQL, Docker, Git, REST APIs',
  targetRole: 'Software Developer',
  preferredLocation: 'Bangalore, India (or Remote)',
};

export default function App() {
  // 1. User Profile State with LocalStorage Persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('ai_vision_user_profile_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load profile from localStorage:', e);
    }
    return DEFAULT_USER_PROFILE;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>('dashboard');
  const [selectedDemo, setSelectedDemo] = useState<DemoCandidate | null>(DEMO_CANDIDATES[0]);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [submittedProfile, setSubmittedProfile] = useState<StudentProfile | null>(null);
  const [submittedTargetRole, setSubmittedTargetRole] = useState<string>(userProfile.targetRole || 'Software Developer');
  const [isLoadingResume, setIsLoadingResume] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Transformation Gaps from Career Twin
  const [priorityRoadmapGaps, setPriorityRoadmapGaps] = useState<string[]>([]);

  // Action history for authentic journey tracking
  const [hasVisitedRoadmap, setHasVisitedRoadmap] = useState(false);
  const [hasVisitedInterview, setHasVisitedInterview] = useState(false);
  const [hasExploredJobs, setHasExploredJobs] = useState(false);

  // Cross-tool prefill states
  const [jobSearchSkills, setJobSearchSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js', 'Python', 'SQL']);
  const [jobSearchRole, setJobSearchRole] = useState<string>(userProfile.targetRole || 'Software Developer');

  const jobSearchRef = useRef<HTMLDivElement>(null);
  const toolWorkspaceRef = useRef<HTMLDivElement>(null);

  // Sync jobSearch skills when profile changes
  useEffect(() => {
    if (userProfile.skills) {
      const skillsArray = userProfile.skills
        .split(/[,;\n•]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      if (skillsArray.length > 0) {
        setJobSearchSkills(skillsArray);
      }
    }
    if (userProfile.targetRole) {
      setJobSearchRole(userProfile.targetRole);
      setSubmittedTargetRole(userProfile.targetRole);
    }
  }, [userProfile]);

  const handleSelectFeature = (feature: ActiveFeature) => {
    setActiveFeature(feature);
    if (feature === 'career-roadmap') setHasVisitedRoadmap(true);
    if (feature === 'virtual-interview') setHasVisitedInterview(true);
    setTimeout(() => {
      toolWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleScrollToJobSearch = () => {
    setHasExploredJobs(true);
    jobSearchRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApplyRoleToJobSearch = (role: string, skills: string[]) => {
    setHasExploredJobs(true);
    setJobSearchRole(role);
    if (skills.length > 0) {
      setJobSearchSkills(skills.slice(0, 5));
    }
    handleScrollToJobSearch();
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('ai_vision_user_profile_v2', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
    setSubmittedTargetRole(updated.targetRole);
    if (updated.skills) {
      const skillsArray = updated.skills
        .split(/[,;\n•]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      if (skillsArray.length > 0) {
        setJobSearchSkills(skillsArray);
      }
    }
    setJobSearchRole(updated.targetRole);
  };

  const handleLoadDemoProfile = (demoId: string) => {
    const found = DEMO_CANDIDATES.find((c) => c.id === demoId);
    if (found) {
      handleSelectDemo(found);
    }
  };

  const handleResetBlank = () => {
    const blank: UserProfile = {
      name: '',
      email: '',
      education: 'Bachelor of Technology / B.E.',
      college: '',
      degree: '',
      experienceYear: 'Final-Year / 4th Year Student',
      interests: '',
      skills: '',
      targetRole: 'Software Developer',
      preferredLocation: '',
    };
    setUserProfile(blank);
    setSelectedDemo(null);
    setAnalysisData(null);
    setSubmittedProfile(null);
    setPriorityRoadmapGaps([]);
    try {
      localStorage.removeItem('ai_vision_user_profile_v2');
    } catch (e) {}
    setActiveFeature('dashboard');
  };

  const handleStartResumeAnalysis = async (payload: {
    resumeText: string;
    studentProfile: StudentProfile;
    jobDescription: string;
    targetRole: string;
    roadmapDuration: string;
  }) => {
    setIsLoadingResume(true);
    setErrorMessage(null);

    // Ensure candidate name is dynamic
    const activeName = userProfile.name || payload.studentProfile.name || 'Candidate';
    const enrichedProfile: StudentProfile = {
      ...payload.studentProfile,
      name: activeName,
    };

    setSubmittedProfile(enrichedProfile);
    setSubmittedTargetRole(payload.targetRole);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          studentProfile: enrichedProfile,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server returned an error during analysis.');
      }

      if (!result.data) {
        throw new Error('Received empty data payload from Gemini model.');
      }

      const finalizedData: AnalysisResult = {
        ...result.data,
        candidateName: activeName,
      };

      setAnalysisData(finalizedData);
      setActiveFeature('results');
      setTimeout(() => {
        toolWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(
        err.message || 'Unable to complete skill gap analysis. Please try again or check your inputs.'
      );
    } finally {
      setIsLoadingResume(false);
    }
  };

  const handleResetResume = () => {
    setAnalysisData(null);
    setErrorMessage(null);
    setActiveFeature('resume-analyzer');
  };

  const handleSelectDemo = (candidate: DemoCandidate) => {
    setSelectedDemo(candidate);
    const updatedUser: UserProfile = {
      name: candidate.profile.name || candidate.name,
      email: candidate.profile.email || `${candidate.name.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
      education: candidate.profile.education,
      college: candidate.profile.college || 'National Institute of Technology',
      degree: candidate.profile.degree,
      experienceYear: candidate.profile.experience,
      interests: candidate.profile.interests,
      skills: candidate.profile.skills,
      targetRole: candidate.profile.targetRole || candidate.targetRole,
      preferredLocation: candidate.profile.preferredLocation || 'Bangalore, India (or Remote)',
    };
    handleSaveProfile(updatedUser);
    setSubmittedTargetRole(candidate.targetRole);
    setAnalysisData(null);
    setErrorMessage(null);
    setActiveFeature('career-twin');
    setTimeout(() => {
      toolWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const candidateDisplayName = userProfile.name ? userProfile.name.trim() : '';

  // 5 Authentic Progress Journey Steps (based on real user completed actions)
  const step1Done = (userProfile.skills || '').trim().length > 0;
  const step2Done = !!analysisData || activeFeature === 'skill-gap' || activeFeature === 'career-twin';
  const step3Done = hasVisitedRoadmap || activeFeature === 'career-roadmap';
  const step4Done = hasVisitedInterview || activeFeature === 'virtual-interview';
  const step5Done = hasExploredJobs;

  const currentStepNumber = !step1Done ? 1 : !step2Done ? 2 : !step3Done ? 3 : !step4Done ? 4 : !step5Done ? 5 : 5;

  const journeySteps = [
    {
      num: 1,
      title: 'Discover your skills',
      desc: 'Profile & baseline',
      done: step1Done,
      action: () => setIsProfileModalOpen(true),
    },
    {
      num: 2,
      title: 'Identify your gaps',
      desc: 'Career Twin & ATS',
      done: step2Done,
      action: () => handleSelectFeature('career-twin'),
    },
    {
      num: 3,
      title: 'Build your roadmap',
      desc: 'Sprint & portfolio milestones',
      done: step3Done,
      action: () => {
        setHasVisitedRoadmap(true);
        handleSelectFeature('career-roadmap');
      },
    },
    {
      num: 4,
      title: 'Practise interviews',
      desc: 'STAR rubric mock drills',
      done: step4Done,
      action: () => {
        setHasVisitedInterview(true);
        handleSelectFeature('virtual-interview');
      },
    },
    {
      num: 5,
      title: 'Explore relevant jobs',
      desc: 'Skill-matched listings',
      done: step5Done,
      action: () => {
        setHasExploredJobs(true);
        handleScrollToJobSearch();
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-white relative">
      {/* Subtle Starry Particle Canvas Background */}
      <StarBackground />

      {/* 1. Header with Product Name, Dynamic Profile Icon & Nav */}
      <Header
        userName={candidateDisplayName}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        activeFeature={activeFeature}
        onSelectFeature={handleSelectFeature}
        onScrollToJobSearch={handleScrollToJobSearch}
        hasResumeResults={!!analysisData}
        onResetResume={handleResetResume}
        onSelectDemo={handleSelectDemo}
        onOpenExport={() => setIsReportModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 relative z-10">
        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-5xl mx-auto px-4 mt-6">
            <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start justify-between gap-3 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-rose-100 mb-0.5">Notice</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white text-xs underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Hero Section with Memorable Tagline & Typography */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 text-center">
          {/* Small sophisticated label above hero heading */}
          <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.24em] text-cyan-400 font-semibold mb-3">
            YOUR CAREER. YOUR POTENTIAL. YOUR NEXT MOVE.
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-indigo-300 text-xs font-medium mb-3 shadow-sm backdrop-blur-md">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Google Gemini 3.8 Intelligence Engine</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight font-heading">
            AI VISION
          </h1>

          {/* Prominent Tagline below hero heading */}
          <div className="mt-3 text-xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 tracking-tight font-heading">
            “See Your Gap. Build Your Edge. Own Your Future.”
          </div>

          {/* Supporting line */}
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From your current skills to your career goals, AI VISION turns skill gaps into an actionable path to job readiness.
          </p>

          {/* Personalized Greeting */}
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm shadow-md">
            <span className="text-slate-300">
              Your next chapter starts here, <strong className="text-white font-semibold">{candidateDisplayName || 'Candidate'}</strong>.
            </span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-cyan-400 font-medium">
              Target role: {userProfile.targetRole || 'Software Developer'}
            </span>
          </div>

          {/* Quick Profile Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{candidateDisplayName ? 'Edit My Profile' : 'Set Up Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo(DEMO_CANDIDATES[0])}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Try Demo: Aarav Sharma</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo(DEMO_CANDIDATES[1])}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Try Demo: Alex Chen</span>
            </button>

            <button
              type="button"
              onClick={handleResetBlank}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Start with a blank profile"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Start Blank</span>
            </button>
          </div>
        </div>

        {/* 2. Memorable Visual Element: CSS/SVG Connected Node Journey */}
        <HeroVisual
          targetRole={userProfile.targetRole || 'Software Developer'}
          candidateName={candidateDisplayName}
          currentSkillsCount={userProfile.skills.split(',').filter(Boolean).length}
        />

        {/* 3. Compact Progress Journey (Step 1 to 5) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  Personal Job-Readiness Journey
                </span>
                <span className="text-[11px] text-slate-400">· Real-time actions tracked</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Step <span className="text-cyan-400 font-bold tabular-nums">{currentStepNumber}</span> of 5 Active
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {journeySteps.map((step) => {
                const isCurrent = currentStepNumber === step.num;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={step.action}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      step.done
                        ? 'bg-slate-950/80 border-emerald-900/60 text-slate-200'
                        : isCurrent
                        ? 'bg-cyan-950/50 border-cyan-500/80 shadow-md shadow-cyan-500/10 text-white'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                        step.done
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isCurrent
                          ? 'bg-cyan-900 text-cyan-200 border border-cyan-700'
                          : 'bg-slate-900 text-slate-400'
                      }`}>
                        Step 0{step.num}
                      </span>
                      {step.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      ) : null}
                    </div>
                    <div className={`text-xs font-semibold ${isCurrent ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {step.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {step.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Five Feature Cards Navigation Bar */}
        <FeatureCards
          activeFeature={activeFeature}
          onSelectFeature={handleSelectFeature}
        />

        {/* 5. Skill-Based Job Search Section (Full-Width) */}
        <div ref={jobSearchRef}>
          <SkillJobSearch
            initialSkills={jobSearchSkills}
            initialRole={jobSearchRole}
            candidateName={userProfile.name}
          />
        </div>

        {/* 6. Active Working Feature Workspace */}
        <div ref={toolWorkspaceRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Navigation Tabs Bar for Instant Feature Switching */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-850">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectFeature('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeFeature === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Readiness Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFeature('career-twin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeFeature === 'career-twin'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                    : 'bg-slate-900 text-cyan-300 hover:text-white hover:bg-slate-850 border border-cyan-900/50'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Career Twin</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFeature('career-matching')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeFeature === 'career-matching'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Career Matching</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFeature('resume-analyzer')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeFeature === 'resume-analyzer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume Analyzer</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFeature('skill-gap')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeFeature === 'skill-gap'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Skill Gap Matrix</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFeature('career-roadmap')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeFeature === 'career-roadmap'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Learning Roadmap</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFeature('virtual-interview')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeFeature === 'virtual-interview'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                }`}
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>Virtual AI Interview</span>
              </button>

              {analysisData && (
                <button
                  type="button"
                  onClick={() => handleSelectFeature('results')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeFeature === 'results'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Personalized Report</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Settings</span>
            </button>
          </div>

          {/* Active Workspace Container */}
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-lg">
            {/* View 0: Central Job-Readiness Dashboard */}
            {activeFeature === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Career Twin Flagship Highlight Banner */}
                <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/50 border border-cyan-500/30 p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-[11px] font-mono font-semibold">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Flagship Feature · Career Twin</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading mt-1">
                      See Your Future Self as a {userProfile.targetRole || 'Software Developer'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Visualize a side-by-side comparison between your current verified competencies and modern hiring expectations. Discover your top 3 transformation gaps.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectFeature('career-twin')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <span>Launch Career Twin</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>

                {/* 1. Career Readiness Index Card */}
                <ReadinessScoreCard
                  userProfile={userProfile}
                  analysisData={analysisData}
                  onNavigateToFeature={(feat) => {
                    if (feat === 'job-search') {
                      handleScrollToJobSearch();
                    } else {
                      handleSelectFeature(feat);
                    }
                  }}
                />

                {/* 2. Active Profile Summary Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                        Candidate Profile Record
                      </span>
                      <h3 className="text-lg font-bold text-white tracking-tight mt-0.5 font-heading">
                        {candidateDisplayName || 'Guest Candidate'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {userProfile.degree || 'Degree not set'} · {userProfile.college || 'Institution not set'} · {userProfile.education}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsProfileModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Edit Profile</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Target Career Role:</span>
                      <span className="text-white font-medium bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 block">
                        {userProfile.targetRole || 'Software Developer'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Preferred Location:</span>
                      <span className="text-white font-medium bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 block">
                        {userProfile.preferredLocation || 'Remote / Flexible'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Experience Level:</span>
                      <span className="text-white font-medium bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 block">
                        {userProfile.experienceYear || 'Student'}
                      </span>
                    </div>

                    <div className="md:col-span-3">
                      <span className="text-slate-400 font-semibold block mb-1.5">Current Recorded Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {userProfile.skills ? (
                          userProfile.skills.split(/[,;\n•]+/).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-850/60 text-cyan-300 text-xs font-mono"
                            >
                              {s.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">No skills listed yet. Click Edit Profile to add skills.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. If Analysis Data Exists: Quick Action to Full Report */}
                {analysisData && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/60 border border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                        Recent Analysis Completed
                      </span>
                      <div className="text-sm font-bold text-white mt-0.5 font-heading">
                        Detailed evaluation ready for {candidateDisplayName || 'Candidate'} ({submittedTargetRole})
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Role Fit: <span className="tabular-nums font-semibold text-cyan-400">{analysisData.roleFitScore}%</span> · ATS Scored: <span className="tabular-nums font-semibold text-indigo-400">{analysisData.atsEvaluation.overallScore}/100</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectFeature('results')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>View Personalized Results</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View: Career Twin — Flagship Interactive Comparison */}
            {activeFeature === 'career-twin' && (
              <CareerTwinTool
                userProfile={userProfile}
                onStartTransformation={(gaps) => {
                  setPriorityRoadmapGaps(gaps);
                  setHasVisitedRoadmap(true);
                  handleSelectFeature('career-roadmap');
                }}
                onNavigateToRoadmap={() => {
                  setHasVisitedRoadmap(true);
                  handleSelectFeature('career-roadmap');
                }}
              />
            )}

            {/* View 1: AI Career Matching */}
            {activeFeature === 'career-matching' && (
              <CareerMatchingTool
                candidateName={candidateDisplayName}
                onApplyRoleToJobSearch={handleApplyRoleToJobSearch}
              />
            )}

            {/* View 2: AI Resume Analyzer */}
            {activeFeature === 'resume-analyzer' && (
              <div>
                {isLoadingResume ? (
                  <LoadingScreen />
                ) : analysisData && submittedProfile ? (
                  <Dashboard
                    data={analysisData}
                    profile={submittedProfile}
                    targetRole={submittedTargetRole}
                    onReset={handleResetResume}
                  />
                ) : (
                  <AnalysisForm
                    onSubmit={handleStartResumeAnalysis}
                    isLoading={isLoadingResume}
                    selectedDemo={selectedDemo}
                    onClearDemo={() => setSelectedDemo(null)}
                  />
                )}
              </div>
            )}

            {/* View 3: Role-Specific Skill Gap Matrix */}
            {activeFeature === 'skill-gap' && (
              <SkillGapAnalyzerTool
                userProfile={userProfile}
                onApplyRoleToJobSearch={handleApplyRoleToJobSearch}
              />
            )}

            {/* View 4: AI Career Roadmap */}
            {activeFeature === 'career-roadmap' && (
              <CareerRoadmapTool
                initialTargetRole={userProfile.targetRole || submittedTargetRole}
                initialSkills={userProfile.skills}
                priorityGaps={priorityRoadmapGaps}
                userProfile={userProfile}
              />
            )}

            {/* View 5: Virtual AI Interview */}
            {activeFeature === 'virtual-interview' && (
              <VirtualInterviewTool
                initialRole={userProfile.targetRole || submittedTargetRole || 'Software Developer'}
                candidateName={candidateDisplayName}
              />
            )}

            {/* View 6: Personalized Results View (After Resume / Gap Analysis) */}
            {activeFeature === 'results' && analysisData && (
              <PersonalizedResultsView
                userProfile={userProfile}
                analysisData={analysisData}
                onStartMockInterview={() => {
                  setHasVisitedInterview(true);
                  handleSelectFeature('virtual-interview');
                }}
                onExploreRoadmap={() => {
                  setHasVisitedRoadmap(true);
                  handleSelectFeature('career-roadmap');
                }}
                onOpenJobSearch={handleScrollToJobSearch}
                onGenerateNewAnalysis={handleResetResume}
                onOpenResumeAnalyzer={() => handleSelectFeature('resume-analyzer')}
              />
            )}
          </div>
        </div>
      </main>

      {/* Global Printable Report Modal */}
      {analysisData && submittedProfile && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          data={analysisData}
          profile={submittedProfile}
          targetRole={submittedTargetRole}
        />
      )}

      {/* Profile Editing Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveProfile}
        onLoadDemoProfile={handleLoadDemoProfile}
        onResetBlank={handleResetBlank}
      />

      {/* 5. Professional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 text-center text-xs text-slate-400 relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide font-heading">AI VISION</span>
            <span aria-hidden="true">·</span>
            <span>See Your Gap. Build Your Edge. Own Your Future.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Powered by Google Gemini 3.8 Flash Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
