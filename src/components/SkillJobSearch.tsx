import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Plus,
  ExternalLink,
  Briefcase,
  MapPin,
  AlertCircle,
  Sparkles,
  Building2,
  GraduationCap,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Filter,
  Globe,
  Loader2,
  Compass,
  FileCheck2,
  SendHorizontal,
  Info,
} from 'lucide-react';
import {
  StartupJobSearchInput,
  StartupJobSearchResult,
  StartupMatchCard,
  ExperienceLevel,
  OpportunityType,
  LocationOption,
} from '../types';

interface SkillJobSearchProps {
  initialSkills?: string[];
  initialRole?: string;
  candidateName?: string;
}

const POPULAR_SKILL_SUGGESTIONS = [
  'Java',
  'DSA',
  'Git',
  'React',
  'JavaScript',
  'TypeScript',
  'Tailwind CSS',
  'Python',
  'AI/ML',
  'SQL',
  'Node.js',
  'Spring Boot',
  'C++',
  'Docker',
  'AWS',
  'Business Development',
  'Marketing',
];

// Presets matching the user's specific test cases
const PRESET_SCENARIOS = [
  {
    label: 'Java Developer Internship',
    skills: ['Java', 'DSA', 'Git', 'SQL', 'Spring Boot'],
    role: 'Java Developer Internship',
    location: 'Noida' as LocationOption,
    exp: 'Student' as ExperienceLevel,
    opp: 'Internship' as OpportunityType,
    badge: 'College Internship',
  },
  {
    label: 'Frontend Developer Intern',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'TypeScript', 'HTML/CSS'],
    role: 'Frontend Developer Intern',
    location: 'Delhi-NCR' as LocationOption,
    exp: 'Student' as ExperienceLevel,
    opp: 'Internship' as OpportunityType,
    badge: 'College Internship',
  },
  {
    label: 'Python Developer Fresher',
    skills: ['Python', 'SQL', 'Django', 'Git', 'REST APIs'],
    role: 'Python Developer Fresher',
    location: 'Noida' as LocationOption,
    exp: 'Fresher' as ExperienceLevel,
    opp: 'Entry-Level Job' as OpportunityType,
    badge: 'Fresher SDE',
  },
  {
    label: 'AI/ML Internship',
    skills: ['Python', 'AI/ML', 'Machine Learning', 'PyTorch', 'Data Analysis'],
    role: 'AI/ML Internship',
    location: 'Noida' as LocationOption,
    exp: 'Student' as ExperienceLevel,
    opp: 'Internship' as OpportunityType,
    badge: 'College Internship',
  },
  {
    label: 'Data Analyst Intern',
    skills: ['Python', 'SQL', 'Excel', 'Data Analysis', 'Tableau'],
    role: 'Data Analyst Intern',
    location: 'Noida' as LocationOption,
    exp: 'Student' as ExperienceLevel,
    opp: 'Internship' as OpportunityType,
    badge: 'College Internship',
  },
  {
    label: 'Software Engineer Fresher',
    skills: ['Java', 'C++', 'DSA', 'Git', 'OOP', 'SQL'],
    role: 'Software Engineer Fresher',
    location: 'Noida' as LocationOption,
    exp: 'Fresher' as ExperienceLevel,
    opp: 'Entry-Level Job' as OpportunityType,
    badge: 'Fresher SDE-1',
  },
];

export const SkillJobSearch: React.FC<SkillJobSearchProps> = ({
  initialSkills = ['Java', 'DSA', 'Git'],
  initialRole = 'Software Developer',
  candidateName = 'Candidate',
}) => {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState('');
  const [targetRole, setTargetRole] = useState(initialRole);
  const [educationLevel, setEducationLevel] = useState('B.Tech / B.E.');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Student');
  const [preferredLocation, setPreferredLocation] = useState<LocationOption>('Noida');
  const [opportunityType, setOpportunityType] = useState<OpportunityType>('Full-Time Job');

  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<StartupJobSearchResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState<string>('All');
  const [filterDomain, setFilterDomain] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'match' | 'name'>('match');

  // Sync when parent provides new skills/role
  useEffect(() => {
    if (initialSkills && initialSkills.length > 0) {
      setSkills(initialSkills);
    }
  }, [initialSkills]);

  useEffect(() => {
    if (initialRole) {
      setTargetRole(initialRole);
    }
  }, [initialRole]);

  const addSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    setSkills([...skills, trimmed]);
    setSkillInput('');
    setValidationError(null);
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setSkills(preset.skills);
    setTargetRole(preset.role);
    setPreferredLocation(preset.location);
    setExperienceLevel(preset.exp);
    setOpportunityType(preset.opp);
    setValidationError(null);
  };

  // Perform AI Startup Matching & Direct Job Redirection Search
  const handleFindMatchingJobs = async () => {
    if (skills.length === 0) {
      setValidationError('Please enter or select at least one skill to discover matching companies.');
      return;
    }
    setValidationError(null);
    setIsLoading(true);

    try {
      const payload: StartupJobSearchInput = {
        skills,
        targetRole: targetRole.trim() || 'Software Developer',
        educationLevel,
        graduationYear,
        experienceLevel,
        preferredLocation,
        opportunityType,
        candidateName,
      };

      const res = await fetch('/api/jobs/match-startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to match startup opportunities.');
      }

      setSearchResult(resData.data);
    } catch (err: any) {
      console.error('Job matcher error:', err);
      setValidationError(err.message || 'Error communicating with startup redirection engine.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial match on mount if initialSkills exists and no results yet
  useEffect(() => {
    if (!searchResult && skills.length > 0) {
      handleFindMatchingJobs();
    }
  }, []);

  // Filter and sort startups
  const displayedStartups = (searchResult?.matchedStartups || []).filter((startup) => {
    if (filterCity !== 'All') {
      if (filterCity === 'Noida' && startup.techHub !== 'Noida') return false;
      if (filterCity === 'Delhi-NCR' && startup.techHub !== 'Delhi-NCR' && startup.techHub !== 'Gurugram' && startup.techHub !== 'Noida') return false;
      if (filterCity === 'Bengaluru' && startup.techHub !== 'Bengaluru') return false;
    }
    if (filterDomain !== 'All') {
      if (!startup.domain.toLowerCase().includes(filterDomain.toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'match') return b.matchPercentage - a.matchPercentage;
    return a.name.localeCompare(b.name);
  });

  return (
    <section id="skill-job-search" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-800/60 text-sky-300 text-xs font-semibold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Direct Job Redirection & Application Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill-Based Job Search & Direct Role Redirection
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-3xl">
              Never get dumped onto a generic company homepage again. AI VISION matches your skills with verified companies in <strong className="text-white">Noida, Delhi-NCR, and Bengaluru</strong>, redirecting you directly to <strong className="text-sky-300">role-specific vacancy listings</strong> and <strong className="text-emerald-300">official ATS application portals</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Noida / Delhi-NCR Hub Active</span>
          </div>
        </div>

        {/* Quick Test Presets (Requested in User Brief) */}
        <div className="pt-6 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instant Test Scenarios:</span>
            </span>
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer group"
              >
                <span className="font-medium group-hover:text-sky-300">{preset.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">{preset.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Inputs Form */}
        <div className="space-y-6 pt-4">
          {/* 1. Multi-Skill Tag Input */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Your Technical & Domain Skills <span className="text-rose-400">*</span>
              </label>
              <span className="text-xs text-slate-400">
                {skills.length} {skills.length === 1 ? 'skill' : 'skills'} added
              </span>
            </div>

            {/* Tag display and input box */}
            <div className="min-h-[56px] p-2.5 bg-slate-950 border border-slate-800 focus-within:border-sky-500 rounded-2xl flex flex-wrap items-center gap-2 transition-colors">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/80 border border-sky-700/60 text-xs font-semibold text-sky-200 shadow-sm"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-white hover:bg-sky-800/60 rounded p-0.5 transition-colors cursor-pointer"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={skills.length === 0 ? "Type skills (e.g. Java, DSA, Git, React, Python) and press Enter..." : "Add more skills..."}
                className="flex-1 min-w-[220px] bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none px-2 py-1"
              />

              {skillInput.trim() && (
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1">Popular in Noida/NCR:</span>
              {POPULAR_SKILL_SUGGESTIONS.map((s) => {
                const isSelected = skills.some((item) => item.toLowerCase() === s.toLowerCase());
                if (isSelected) return null;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                  >
                    + {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Structured Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            {/* Target Job Title */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                Target Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Java Developer Internship"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>
            </div>

            {/* Education Level & Graduation Year */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                Education & Grad Year
              </label>
              <div className="flex gap-2">
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-2/3 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer"
                >
                  <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="B.Sc CS / IT">B.Sc CS / IT</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="Other Degree">Other Degree</option>
                </select>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer"
              >
                <option value="Student">Student (Pre-Final / Final Year)</option>
                <option value="Fresher">Fresher (0–6 Months / Graduated)</option>
                <option value="0-2 years">0–2 Years Experience</option>
                <option value="Experienced">Experienced (&gt; 2 Years)</option>
              </select>
            </div>

            {/* Preferred Location */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                Preferred Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value as LocationOption)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer"
                >
                  <option value="Noida">Noida (Sector 62, 125, 127, 156)</option>
                  <option value="Delhi-NCR">Delhi-NCR (Broad)</option>
                  <option value="Gurugram">Gurugram / Cyber City</option>
                  <option value="Bengaluru">Bengaluru / Karnataka</option>
                  <option value="Hyderabad">Hyderabad / Telangana</option>
                  <option value="Pune">Pune / Maharashtra</option>
                  <option value="Remote">100% Remote</option>
                  <option value="Anywhere in India">Anywhere in India</option>
                </select>
              </div>
            </div>

            {/* Opportunity Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                Opportunity Type
              </label>
              <select
                value={opportunityType}
                onChange={(e) => setOpportunityType(e.target.value as OpportunityType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer"
              >
                <option value="Full-Time Job">Full-Time Job</option>
                <option value="Internship">College Internship / Co-op</option>
                <option value="Entry-Level Job">Entry-Level / SDE-1</option>
                <option value="Graduate Role">Graduate Trainee Role</option>
              </select>
            </div>
          </div>

          {/* Validation Banner */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleFindMatchingJobs}
              disabled={isLoading}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-500 hover:from-sky-400 hover:via-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Matching Relevant Vacancies with AI...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find Matching Jobs</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct vacancy redirection enabled — zero generic homepage redirects</span>
            </div>
          </div>

          {/* RESULTS DISPLAY */}
          {searchResult && (
            <div className="mt-10 pt-8 border-t border-slate-800 space-y-8 animate-in fade-in duration-300">
              {/* Summary Banner & Market Insights */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Role-Specific Search Generated</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Found {displayedStartups.length} Companies Hiring for <span className="text-sky-300 font-mono">{searchResult.querySummary.targetRole}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Candidate Profile: {searchResult.querySummary.education} · {searchResult.querySummary.experienceLevel} · Location: {searchResult.querySummary.location} ({searchResult.querySummary.opportunityType})
                  </p>
                </div>

                {/* Market Insight Pill */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 max-w-md text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px] uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Hiring Season Insight</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {searchResult.marketInsights.hiringSeasonTip}
                  </p>
                </div>
              </div>

              {/* Link Priority Transparency Ribbon */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-sky-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-medium">
                    Strict Link Priority Active:
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    1. Direct Official ATS Application → 2. Role-Filtered Careers Search → 3. Pre-filtered LinkedIn / Naukri Search
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                  <span className="flex items-center gap-1 text-emerald-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Apply on Official Website
                  </span>
                  <span className="flex items-center gap-1 text-sky-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    View Relevant Jobs
                  </span>
                </div>
              </div>

              {/* Filter Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px]">
                    <Filter className="w-3.5 h-3.5 text-sky-400" />
                    <span>Filter Startups:</span>
                  </span>

                  {/* Filter by Hub */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Hub:</span>
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="All">All Tech Hubs</option>
                      <option value="Noida">Noida Only</option>
                      <option value="Delhi-NCR">Delhi-NCR (Noida / Gurugram)</option>
                      <option value="Bengaluru">Bengaluru Only</option>
                    </select>
                  </div>

                  {/* Filter by Domain */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Sector:</span>
                    <select
                      value={filterDomain}
                      onChange={(e) => setFilterDomain(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="All">All Sectors</option>
                      <option value="Fintech">Fintech</option>
                      <option value="EdTech">EdTech</option>
                      <option value="Commerce">Commerce / Logistics</option>
                      <option value="Robotics">Robotics & AI</option>
                      <option value="Health">HealthTech</option>
                    </select>
                  </div>
                </div>

                {/* Sort Control */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="match">Highest Match %</option>
                    <option value="name">Company Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* DEDICATED COMPANY CARDS (DIRECT RELEVANT REDIRECTION) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {displayedStartups.map((company) => {
                  return (
                    <div
                      key={company.id}
                      className="bg-slate-950/85 border border-slate-800 hover:border-sky-500/60 rounded-2xl p-5 sm:p-6 transition-all shadow-xl hover:shadow-sky-500/5 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top Row: Company Badge, Name, Domain & Match Score */}
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-850">
                          <div className="flex items-start gap-3.5">
                            {/* Logo Badge */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center font-bold text-sky-300 text-base shadow-md shrink-0">
                              {company.name.slice(0, 2).toUpperCase()}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                                  {company.name}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-900 border border-slate-800 text-slate-400">
                                  {company.techHub}
                                </span>
                              </div>

                              <p className="text-xs text-sky-400 font-medium mt-0.5">
                                {company.domain}
                              </p>

                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="truncate">{company.headquarters}</span>
                              </p>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <div className="text-right shrink-0">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-600/50 text-sky-300 font-mono font-bold text-sm">
                              <span>{company.matchPercentage}%</span>
                              <span className="text-[10px] text-sky-400 font-sans uppercase">Match</span>
                            </div>
                            <div className="w-20 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all"
                                style={{ width: `${company.matchPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* SPECIFIC RELEVANT JOB OPENING BANNER (KEY USER REQUIREMENT) */}
                        <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60">
                              <Briefcase className="w-3 h-3" />
                              <span>Relevant Role</span>
                            </span>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">
                                {company.jobType || 'Internship / Entry-Level'}
                              </span>
                              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>{company.vacancyStatus || 'Verified Vacancy Listings'}</span>
                              </span>
                            </div>
                          </div>

                          <h5 className="text-sm font-bold text-white tracking-tight">
                            {company.matchedRole || company.relevantRoles[0] || targetRole}
                          </h5>

                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {company.matchRationale}
                          </p>
                        </div>

                        {/* Verified Business Description */}
                        <p className="text-xs text-slate-400 leading-relaxed mt-3.5">
                          {company.description}
                        </p>

                        {/* Skills Comparison: Matched vs To Learn */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-850">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Skills Matched
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {company.matchedSkills.map((sk) => (
                                <span
                                  key={sk}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-200"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                              <TrendingUp className="w-3 h-3" />
                              Advantage Skills To Learn
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {company.skillsToAcquire.map((sk) => (
                                <span
                                  key={sk}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-amber-200"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DIRECT REDIRECTION BUTTONS (THE PRIMARY FIX) */}
                      <div className="mt-5 pt-4 border-t border-slate-850 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-sky-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{company.linkPriority || 'Role-Specific Career Filter'}</span>
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            Direct Role Redirection
                          </span>
                        </div>

                        {/* 2 Primary Direct Redirection Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* 1. VIEW RELEVANT JOBS BUTTON (PRIMARY) */}
                          <a
                            href={company.relevantJobsUrl || company.linkedInJobsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-600/20 cursor-pointer text-center group/btn"
                            title={`Open relevant ${company.matchedRole || targetRole} job listings at ${company.name}`}
                          >
                            <Briefcase className="w-3.5 h-3.5 text-sky-200" />
                            <span>View Relevant Jobs</span>
                            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </a>

                          {/* 2. APPLY ON OFFICIAL WEBSITE BUTTON */}
                          <a
                            href={company.officialApplyUrl || company.careerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 cursor-pointer text-center group/btn"
                            title={`Apply directly on ${company.name}'s official careers portal / ATS`}
                          >
                            <SendHorizontal className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Apply on Official Website</span>
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform text-emerald-200" />
                          </a>
                        </div>

                        {/* Secondary Platform Deep Links */}
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-slate-500">Alternative platform search:</span>
                          <div className="flex items-center gap-3">
                            <a
                              href={company.naukriJobsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-indigo-300 underline underline-offset-2 flex items-center gap-0.5"
                            >
                              <span>Naukri Filter</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <a
                              href={company.careerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-0.5"
                            >
                              <span>Careers Hub</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DIRECT SEARCH AGGREGATORS (PORTAL-WIDE DEEP SEARCH) */}
              <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span>Broad Startup Search Aggregators (Role & Level Filtered)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Explore broader listings across primary recruitment networks with your exact skills and target location parameters pre-loaded.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* LinkedIn */}
                  <a
                    href={searchResult.directAggregatorUrls.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-slate-950/80 border border-sky-900/40 hover:border-sky-500 hover:bg-sky-950/20 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-sky-400 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4" />
                          LinkedIn Jobs
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        Filtered for {targetRole} with your {skills.slice(0, 2).join(', ')} skills.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs font-semibold text-sky-300 flex items-center gap-1">
                      <span>Open LinkedIn Search</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </a>

                  {/* Naukri */}
                  <a
                    href={searchResult.directAggregatorUrls.naukri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-slate-950/80 border border-indigo-900/40 hover:border-indigo-500 hover:bg-indigo-950/20 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4" />
                          Naukri.com
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        Noida and Indian tech startup hiring drives and direct applications.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs font-semibold text-indigo-300 flex items-center gap-1">
                      <span>Open Naukri Search</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </a>

                  {/* Internshala */}
                  <a
                    href={searchResult.directAggregatorUrls.internshala}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 hover:border-emerald-500 hover:bg-emerald-950/20 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4" />
                          Internshala
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        College internships and stipend roles suited for engineering students.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs font-semibold text-emerald-300 flex items-center gap-1">
                      <span>Open Internshala</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </a>

                  {/* Wellfound / AngelList */}
                  <a
                    href={searchResult.directAggregatorUrls.wellfound}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/40 hover:border-amber-500 hover:bg-amber-950/20 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" />
                          Wellfound (AngelList)
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        Direct outreach to startup founders and seed/Series-A engineering teams.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs font-semibold text-amber-300 flex items-center gap-1">
                      <span>Open Wellfound</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </a>
                </div>
              </div>

              {/* Accuracy & Transparency Disclaimer (Required) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-300 font-semibold mb-0.5">
                    Authentic Redirection Transparency Disclaimer
                  </p>
                  <p className="text-[11px]">
                    Direct links redirect to official portals and verified role vacancy searches (e.g. Pine Labs, Moglix, Blinkit, PW, Innovaccer, Addverb, Lever, Greenhouse). Vacancies vary in real time based on active recruiting cycles. <strong>AI VISION does not fabricate artificial vacancies, mock salaries, or guarantee employment outcomes</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
