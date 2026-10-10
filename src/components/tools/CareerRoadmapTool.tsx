import React, { useState, useEffect } from 'react';
import {
  Map,
  Calendar,
  CheckSquare,
  Square,
  CheckCircle2,
  FolderGit2,
  Award,
  BookOpen,
  Loader2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Zap,
  Clock,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  RotateCcw,
  Code2,
  HelpCircle,
  Check,
  Filter,
  PlayCircle,
} from 'lucide-react';
import {
  LearningRoadmap,
  StandaloneRoadmapInput,
  RoadmapMilestone,
  RoadmapTask,
  PhaseCheckpoint,
  ValidatedSkillItem,
  DiagnosticQuestion,
  UserProfile,
} from '../../types';

const SAMPLE_ROADMAP_PRESETS = [
  {
    label: '2nd-Yr B.Tech: C, Java, Git → Software Dev (60 Days)',
    data: {
      currentSkills: 'C, Java, Git',
      targetRole: 'Software Developer',
      duration: '60-day' as const,
      currentLevel: 'Beginner',
      studyYear: '2nd Year B.Tech IT',
      dailyTime: '1 hour/day',
    },
  },
  {
    label: 'Junior Web Dev: React, JS, Git → Full-Stack (30 Days)',
    data: {
      currentSkills: 'HTML, CSS, JavaScript, React basics, Git',
      targetRole: 'Full-Stack Developer',
      duration: '30-day' as const,
      currentLevel: 'Beginner',
      studyYear: '2nd Year / 3rd Year',
      dailyTime: '1 hour/day',
    },
  },
  {
    label: 'Data Analyst: Python, SQL → Data Analyst (30 Days)',
    data: {
      currentSkills: 'Python basics, SQL basics, Excel',
      targetRole: 'Data Analyst',
      duration: '30-day' as const,
      currentLevel: 'Beginner',
      studyYear: '3rd Year B.Tech',
      dailyTime: '1 hour/day',
    },
  },
];

interface CareerRoadmapToolProps {
  initialTargetRole?: string;
  initialSkills?: string;
  priorityGaps?: string[];
  userProfile?: UserProfile;
}

type TaskStatus = 'not-started' | 'in-progress' | 'completed';

export const CareerRoadmapTool: React.FC<CareerRoadmapToolProps> = ({
  initialTargetRole,
  initialSkills,
  priorityGaps = [],
  userProfile,
}) => {
  const [input, setInput] = useState<StandaloneRoadmapInput>({
    candidateName: userProfile?.name || 'Candidate',
    currentSkills: initialSkills || userProfile?.skills || SAMPLE_ROADMAP_PRESETS[0].data.currentSkills,
    targetRole: initialTargetRole || userProfile?.targetRole || SAMPLE_ROADMAP_PRESETS[0].data.targetRole,
    duration: '60-day',
    currentLevel: 'Beginner',
    studyYear: userProfile?.experienceYear || '2nd Year B.Tech IT',
    dailyTime: '1 hour/day',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Skill diagnostic assessment state
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, number>>({});
  const [diagnosticSubmitted, setDiagnosticSubmitted] = useState(false);
  const [validatedSkillNames, setValidatedSkillNames] = useState<Set<string>>(new Set());

  // Phase checkpoint state
  const [activeCheckpointModal, setActiveCheckpointModal] = useState<{
    milestoneIndex: number;
    checkpoint: PhaseCheckpoint;
  } | null>(null);
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, number>>({});
  const [checkpointSubmitted, setCheckpointSubmitted] = useState<Record<number, boolean>>({});
  const [checkpointScores, setCheckpointScores] = useState<Record<number, { score: number; total: number; passed: boolean }>>({});

  // Sync initial props
  useEffect(() => {
    if (initialTargetRole || initialSkills || userProfile) {
      setInput((prev) => ({
        ...prev,
        targetRole: initialTargetRole || userProfile?.targetRole || prev.targetRole,
        currentSkills: initialSkills || userProfile?.skills || prev.currentSkills,
        studyYear: userProfile?.experienceYear || prev.studyYear,
        candidateName: userProfile?.name || prev.candidateName,
      }));
    }
  }, [initialTargetRole, initialSkills, userProfile]);

  // Load persisted progress from localStorage when targetRole changes
  useEffect(() => {
    if (input.targetRole) {
      try {
        const key = `ai_vision_roadmap_progress_${input.targetRole.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.taskStatuses) setTaskStatuses(parsed.taskStatuses);
          if (parsed.validatedSkillNames) setValidatedSkillNames(new Set(parsed.validatedSkillNames));
          if (parsed.checkpointScores) setCheckpointScores(parsed.checkpointScores);
          if (parsed.checkpointSubmitted) setCheckpointSubmitted(parsed.checkpointSubmitted);
        }
      } catch (e) {
        console.warn('Failed to load roadmap progress from localStorage:', e);
      }
    }
  }, [input.targetRole]);

  // Save progress to localStorage
  const saveProgressToStorage = (
    newStatuses: Record<string, TaskStatus>,
    newValidatedSkills = validatedSkillNames,
    newScores = checkpointScores,
    newSubmitted = checkpointSubmitted
  ) => {
    try {
      const key = `ai_vision_roadmap_progress_${input.targetRole.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          taskStatuses: newStatuses,
          validatedSkillNames: Array.from(newValidatedSkills),
          checkpointScores: newScores,
          checkpointSubmitted: newSubmitted,
        })
      );
    } catch (e) {
      console.warn('Failed to save roadmap progress to localStorage:', e);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.targetRole.trim()) {
      setErrorMsg('Please specify a target role for your personalized roadmap.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok || !data.roadmap) {
        throw new Error(data.error || 'Failed to generate career roadmap.');
      }

      setRoadmap(data.roadmap);
      // Auto expand first task of first milestone
      setExpandedTasks({ 'task-0-0': true });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with roadmap architect.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate on first mount with initial presets
  useEffect(() => {
    handleGenerate();
  }, []);

  const setTaskStatus = (taskId: string, status: TaskStatus) => {
    const updated = { ...taskStatuses, [taskId]: status };
    setTaskStatuses(updated);
    saveProgressToStorage(updated);
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Calculate progress metrics
  const allTaskIds: { id: string; title: string; milestoneIndex: number }[] = [];
  if (roadmap) {
    roadmap.milestones.forEach((m, mIdx) => {
      if (m.detailedTasks && m.detailedTasks.length > 0) {
        m.detailedTasks.forEach((t) => {
          allTaskIds.push({ id: t.id, title: t.title, milestoneIndex: mIdx });
        });
      } else {
        m.practicalTasks.forEach((t, tIdx) => {
          allTaskIds.push({ id: `task-${mIdx}-${tIdx}`, title: t, milestoneIndex: mIdx });
        });
      }
    });
  }

  const completedCount = allTaskIds.filter((t) => taskStatuses[t.id] === 'completed').length;
  const inProgressCount = allTaskIds.filter((t) => taskStatuses[t.id] === 'in-progress').length;
  const progressPercent = allTaskIds.length > 0 ? Math.round((completedCount / allTaskIds.length) * 100) : 0;

  // Upcoming task (first non-completed task)
  const upNextTask = allTaskIds.find((t) => taskStatuses[t.id] !== 'completed');

  // Diagnostic submission handler
  const handleDiagnosticSubmit = () => {
    if (!roadmap?.diagnosticAssessments) return;
    const correctSkills = new Set(validatedSkillNames);
    roadmap.diagnosticAssessments.forEach((q) => {
      if (diagnosticAnswers[q.id] === q.correctAnswerIndex) {
        correctSkills.add(q.skill);
      }
    });
    setValidatedSkillNames(correctSkills);
    setDiagnosticSubmitted(true);
    saveProgressToStorage(taskStatuses, correctSkills);
  };

  // Phase Checkpoint submission handler
  const handleCheckpointSubmit = (mIdx: number, checkpoint: PhaseCheckpoint) => {
    let score = 0;
    checkpoint.questions.forEach((q) => {
      if (checkpointAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });
    const total = checkpoint.questions.length;
    const passed = (score / total) * 100 >= (checkpoint.passingScorePercent || 70);

    const updatedScores = {
      ...checkpointScores,
      [mIdx]: { score, total, passed },
    };
    const updatedSubmitted = {
      ...checkpointSubmitted,
      [mIdx]: true,
    };

    setCheckpointScores(updatedScores);
    setCheckpointSubmitted(updatedSubmitted);
    saveProgressToStorage(taskStatuses, validatedSkillNames, updatedScores, updatedSubmitted);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 font-mono">
            <Map className="w-4 h-4" />
            <span>Feature 03 · AI Personalized Learning Roadmap</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
            Personalized Step-by-Step Learning Roadmap
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Tailored specifically for college students (e.g. 2nd-year B.Tech) with actionable tasks, jargon explanations, GitHub deliverables, and interactive checkpoint quizzes.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400">Load preset:</span>
          {SAMPLE_ROADMAP_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInput({
                  ...input,
                  ...preset.data,
                });
                setErrorMsg(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {preset.label.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {priorityGaps.length > 0 && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 flex items-start gap-3 text-xs text-cyan-200">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">Career Twin Transformation Prioritization:</span>
            <span>Prioritizing critical gaps identified from your Future Self comparison: </span>
            <span className="font-semibold text-cyan-300 font-mono">{priorityGaps.join(', ')}</span>
          </div>
        </div>
      )}

      {/* Input Form with 6 Dynamic Inputs */}
      <form onSubmit={handleGenerate} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Student Profile & Learning Constraints</span>
          </span>
          <span className="text-[11px] text-slate-400">Paced for realistic college schedules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* 1. Year of Study */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Current Year of Study <span className="text-rose-400">*</span>
            </label>
            <select
              value={input.studyYear || '2nd Year B.Tech IT'}
              onChange={(e) => setInput({ ...input, studyYear: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="1st Year B.Tech / Foundations">1st Year B.Tech / Foundations</option>
              <option value="2nd Year B.Tech IT">2nd Year B.Tech IT</option>
              <option value="2nd Year B.Tech Computer Science">2nd Year B.Tech Computer Science</option>
              <option value="3rd Year B.Tech / Pre-Placement">3rd Year B.Tech / Pre-Placement</option>
              <option value="4th Year / Final-Year Student">4th Year / Final-Year Student</option>
              <option value="Recent Graduate / Career Changer">Recent Graduate / Career Changer</option>
            </select>
          </div>

          {/* 2. Target Role */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Target Career Role <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={input.targetRole}
              onChange={(e) => setInput({ ...input, targetRole: e.target.value })}
              placeholder="e.g. Software Developer, Full-Stack Developer"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 3. Proficiency Level */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Current Proficiency Level</label>
            <select
              value={input.currentLevel}
              onChange={(e) => setInput({ ...input, currentLevel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Beginner">Beginner (Foundations & Syntax)</option>
              <option value="Intermediate">Intermediate (Can build small apps)</option>
              <option value="Advanced">Advanced (Production & Optimization)</option>
            </select>
          </div>

          {/* 4. Current Skills */}
          <div className="lg:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">
              Current Skills Baseline <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={input.currentSkills}
              onChange={(e) => setInput({ ...input, currentSkills: e.target.value })}
              placeholder="e.g. C, Java, Git (comma separated)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400">Quick add:</span>
              {['C', 'Java', 'Git', 'Python', 'SQL', 'HTML/CSS', 'Data Structures'].map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    const current = input.currentSkills ? input.currentSkills.split(',').map((s) => s.trim()) : [];
                    if (!current.includes(skill)) {
                      setInput({
                        ...input,
                        currentSkills: current.length > 0 ? `${input.currentSkills}, ${skill}` : skill,
                      });
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-emerald-300 hover:border-emerald-800 transition-colors"
                >
                  +{skill}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Daily Available Time */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Daily Available Time</label>
            <select
              value={input.dailyTime || '1 hour/day'}
              onChange={(e) => setInput({ ...input, dailyTime: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="30 mins/day">30 mins / day (~3.5 hrs/week)</option>
              <option value="1 hour/day">1 hour / day (~7 hrs/week)</option>
              <option value="2 hours/day">2 hours / day (~14 hrs/week)</option>
              <option value="3+ hours/day">3+ hours / day (Intensive)</option>
            </select>
          </div>

          {/* 6. Duration Options */}
          <div className="lg:col-span-3">
            <label className="block text-slate-300 font-semibold mb-1.5">Target Roadmap Duration</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '30-day', label: '30-Day Sprint', desc: '4 Weekly Phases' },
                { id: '60-day', label: '60-Day College Plan', desc: '8 Weeks / Balanced' },
                { id: '90-day', label: '90-Day Full Mastery', desc: '12 Weeks / Placement Ready' },
                { id: '7-day', label: '7-Day Fast-Track', desc: 'Intensive Interview Drill' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setInput({ ...input, duration: opt.id as any })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    input.duration === opt.id
                      ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paced for <strong>{input.dailyTime}</strong> over <strong>{input.duration}</strong></span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Designing Custom Roadmap with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Generate Verified Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Roadmap Display */}
      {roadmap && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Stated Assumptions & Transparency Banner */}
          {roadmap.statedAssumptions && roadmap.statedAssumptions.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
              <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block mb-1">Roadmap Grounding & Stated Assumptions:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {roadmap.statedAssumptions.map((assump, idx) => (
                    <li key={idx}>{assump}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 1. Skill Validation & Competency Analysis Matrix */}
          {roadmap.skillValidationSummary && roadmap.skillValidationSummary.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-base font-bold text-white tracking-tight font-heading">
                      Meaningful Skill Validation Matrix
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Distinguishing self-reported skills from assessment-validated competencies for {input.targetRole}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDiagnosticModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Validate Skills (Quick Diagnostic)</span>
                  </button>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {roadmap.skillValidationSummary.map((item, idx) => {
                  const isValidated = validatedSkillNames.has(item.skill) || item.isValidated;

                  // Category styling
                  const categoryBadge =
                    item.category === 'You already know'
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                      : item.category === 'Strengthen this skill'
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                      : 'bg-indigo-950/60 border-indigo-800 text-indigo-300';

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between text-xs space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${categoryBadge}`}>
                            {item.category}
                          </span>

                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                              isValidated
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {isValidated ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Assessment-Validated</span>
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-3 h-3 text-amber-400" />
                                <span>Self-Reported</span>
                              </>
                            )}
                          </span>
                        </div>

                        <h5 className="text-sm font-bold text-white tracking-tight">
                          {item.skill}
                        </h5>

                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          <strong className="text-slate-400">Why it matters:</strong> {item.whyItMatters}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-850">
                        <span className="text-[11px] text-slate-400 block font-medium">Demonstrated Competency Required:</span>
                        <span className="text-xs text-emerald-300 font-mono mt-0.5 block leading-snug">
                          {item.competencyToDemonstrate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Progress Tracker & Up Next Dashboard Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-base font-bold text-white tracking-tight font-heading">
                    {roadmap.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {roadmap.objective}
                </p>
              </div>

              {/* Interactive Progress Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 min-w-[220px]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400 font-medium">Overall Progress</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>{completedCount} of {allTaskIds.length} completed</span>
                  {inProgressCount > 0 && <span className="text-amber-400 font-mono">{inProgressCount} in progress</span>}
                </div>
              </div>
            </div>

            {/* "Up Next for You Today" Banner */}
            {upNextTask && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-teal-950/30 border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <PlayCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      Up Next For You Today ({input.dailyTime})
                    </span>
                    <span className="text-white font-semibold text-xs sm:text-sm">
                      {upNextTask.title}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setExpandedTasks({ ...expandedTasks, [upNextTask.id]: true });
                    setTaskStatus(upNextTask.id, 'in-progress');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  Start Task Now
                </button>
              </div>
            )}

            {/* Filter controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter tasks:</span>
                {(['all', 'pending', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                      statusFilter === f
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setTaskStatuses({});
                  saveProgressToStorage({});
                }}
                className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Progress</span>
              </button>
            </div>
          </div>

          {/* 3. Chronological Phases Timeline */}
          <div className="space-y-6">
            {roadmap.milestones.map((milestone, mIdx) => {
              const checkpointPassed = checkpointScores[mIdx]?.passed;
              const hasDetailedTasks = milestone.detailedTasks && milestone.detailedTasks.length > 0;

              return (
                <div
                  key={mIdx}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 relative overflow-hidden"
                >
                  {/* Phase Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                          {milestone.phaseOrDay}
                        </span>
                        {milestone.timeFrame && (
                          <span className="text-[11px] text-slate-400">· {milestone.timeFrame}</span>
                        )}
                      </div>
                      <h5 className="text-lg font-bold text-white tracking-tight mt-1 font-heading">
                        {milestone.title}
                      </h5>
                      {milestone.learningObjective && (
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          <strong>Objective:</strong> {milestone.learningObjective}
                        </p>
                      )}
                    </div>

                    {/* Focus Skills Tags */}
                    <div className="flex flex-wrap gap-1.5 self-start">
                      {milestone.focusSkills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tasks Section */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Actionable Learning Tasks ({hasDetailedTasks ? milestone.detailedTasks!.length : milestone.practicalTasks.length})</span>
                    </div>

                    {/* Detailed Task Cards */}
                    {hasDetailedTasks ? (
                      milestone.detailedTasks!.map((task, tIdx) => {
                        const taskId = task.id || `task-${mIdx}-${tIdx}`;
                        const currentStatus = taskStatuses[taskId] || 'not-started';
                        const isExpanded = !!expandedTasks[taskId];

                        // Filter check
                        if (statusFilter === 'completed' && currentStatus !== 'completed') return null;
                        if (statusFilter === 'pending' && currentStatus === 'completed') return null;

                        return (
                          <div
                            key={taskId}
                            className={`rounded-2xl border transition-all ${
                              currentStatus === 'completed'
                                ? 'bg-slate-950/50 border-emerald-900/50'
                                : currentStatus === 'in-progress'
                                ? 'bg-slate-950/90 border-amber-500/50 shadow-md shadow-amber-500/5'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {/* Task Summary Row */}
                            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-3">
                                {/* Status Toggle Checkbox */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStatus: TaskStatus =
                                      currentStatus === 'completed'
                                        ? 'not-started'
                                        : currentStatus === 'in-progress'
                                        ? 'completed'
                                        : 'in-progress';
                                    setTaskStatus(taskId, nextStatus);
                                  }}
                                  className="mt-0.5 shrink-0 focus:outline-none cursor-pointer"
                                  title={`Status: ${currentStatus}. Click to cycle.`}
                                >
                                  {currentStatus === 'completed' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                  ) : currentStatus === 'in-progress' ? (
                                    <div className="w-5 h-5 rounded-md border-2 border-amber-400 flex items-center justify-center">
                                      <div className="w-2 h-2 bg-amber-400 rounded-sm" />
                                    </div>
                                  ) : (
                                    <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                                  )}
                                </button>

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h6
                                      className={`text-sm font-semibold ${
                                        currentStatus === 'completed'
                                          ? 'text-slate-400 line-through'
                                          : 'text-white'
                                      }`}
                                    >
                                      {task.title}
                                    </h6>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                      {task.estimatedTime}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                    {task.whatToLearn}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                {/* Status Pill */}
                                <select
                                  value={currentStatus}
                                  onChange={(e) => setTaskStatus(taskId, e.target.value as TaskStatus)}
                                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border bg-slate-900 focus:outline-none cursor-pointer ${
                                    currentStatus === 'completed'
                                      ? 'text-emerald-400 border-emerald-800'
                                      : currentStatus === 'in-progress'
                                      ? 'text-amber-400 border-amber-800'
                                      : 'text-slate-400 border-slate-800'
                                  }`}
                                >
                                  <option value="not-started">Not Started</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>

                                {/* Expand Accordion Button */}
                                <button
                                  type="button"
                                  onClick={() => toggleTaskExpanded(taskId)}
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title={isExpanded ? 'Collapse task details' : 'Expand full 8-point explanation'}
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Expanded 8-Point Explanations for 2nd-Year B.Tech Students */}
                            {isExpanded && (
                              <div className="px-5 pb-5 pt-2 border-t border-slate-850 space-y-4 text-xs animate-in fade-in duration-200">
                                {/* 1. What & Why */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                                      1. What to Learn (Beginner Friendly)
                                    </span>
                                    <p className="text-slate-200 leading-relaxed">
                                      {task.whatToLearn}
                                    </p>
                                  </div>

                                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                                      2. Why to Learn It (Career Impact)
                                    </span>
                                    <p className="text-slate-200 leading-relaxed">
                                      {task.whyToLearn}
                                    </p>
                                  </div>
                                </div>

                                {/* 2. What Exactly To Do */}
                                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                                    3. What Exactly to Do Today (Step-by-Step)
                                  </span>
                                  <ol className="list-decimal list-inside space-y-1 text-slate-200">
                                    {task.whatToDo.map((step, sIdx) => (
                                      <li key={sIdx} className="leading-relaxed">{step}</li>
                                    ))}
                                  </ol>
                                </div>

                                {/* 3. Practice Task & Deliverable */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                                      <Code2 className="w-3.5 h-3.5" />
                                      <span>4. Practice Task (Code to Write)</span>
                                    </span>
                                    <p className="text-slate-200 leading-relaxed">
                                      {task.practiceTask}
                                    </p>
                                  </div>

                                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                                    <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                                      <FolderGit2 className="w-3.5 h-3.5" />
                                      <span>5. Mini-Project or Deliverable</span>
                                    </span>
                                    <p className="text-slate-200 leading-relaxed">
                                      {task.deliverable}
                                    </p>
                                  </div>
                                </div>

                                {/* 4. Completion Criteria & Learning Resources */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                                      <Award className="w-3.5 h-3.5" />
                                      <span>6 & 7. Completion Criteria</span>
                                    </span>
                                    <p className="text-slate-300 leading-relaxed">
                                      {task.completionCriteria}
                                    </p>
                                  </div>

                                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                                      <BookOpen className="w-3.5 h-3.5" />
                                      <span>8. Authentic Learning Resources</span>
                                    </span>
                                    <div className="space-y-1.5">
                                      {task.learningResources && task.learningResources.length > 0 ? (
                                        task.learningResources.map((res, rIdx) => (
                                          <a
                                            key={rIdx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-emerald-300 hover:text-emerald-200 hover:underline flex items-center gap-1.5 truncate"
                                          >
                                            <ExternalLink className="w-3 h-3 shrink-0" />
                                            <span>{res.title}</span>
                                          </a>
                                        ))
                                      ) : (
                                        <span className="text-slate-400 italic">Official documentation links included in phase footer.</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      // Fallback for simple practical tasks
                      milestone.practicalTasks.map((taskStr, tIdx) => {
                        const taskId = `task-${mIdx}-${tIdx}`;
                        const isChecked = taskStatuses[taskId] === 'completed';

                        return (
                          <div
                            key={tIdx}
                            onClick={() => setTaskStatus(taskId, isChecked ? 'not-started' : 'completed')}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300 line-through opacity-85'
                                : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <button type="button" className="mt-0.5 shrink-0 focus:outline-none">
                              {isChecked ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                            </button>
                            <span className="leading-relaxed select-none">{taskStr}</span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Portfolio Milestone & Progress Verification Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs pt-1">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>Phase Milestone (GitHub Deliverable)</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {milestone.projectMilestone}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                        <Award className="w-3.5 h-3.5" />
                        <span>Progress Verification Test</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {milestone.howToVerifyProgress}
                      </p>
                    </div>
                  </div>

                  {/* Phase Checkpoint Quiz Section */}
                  {milestone.checkpoint && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <h6 className="text-sm font-bold text-white tracking-tight">
                            {milestone.checkpoint.title}
                          </h6>
                          {checkpointPassed && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                              PASSED ({checkpointScores[mIdx]?.score}/{checkpointScores[mIdx]?.total})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl">
                          {milestone.checkpoint.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveCheckpointModal({ milestoneIndex: mIdx, checkpoint: milestone.checkpoint! })}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                          checkpointPassed
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{checkpointPassed ? 'Review Quiz Answers' : 'Take Phase Checkpoint'}</span>
                      </button>
                    </div>
                  )}

                  {/* Recommended Resources Links */}
                  {milestone.recommendedResources && milestone.recommendedResources.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-400">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        Key Documentation:
                      </span>
                      {milestone.recommendedResources.map((res, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-emerald-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]"
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Diagnostic Assessment Modal */}
      {showDiagnosticModal && roadmap?.diagnosticAssessments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  Skill Validation Check
                </span>
                <h4 className="text-lg font-bold text-white font-heading">
                  Quick 3-Minute Competency Diagnostic
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnosticModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              We never assume skills without evidence. Answer these short diagnostic questions to officially convert your self-reported skills into <strong>Assessment-Validated</strong> competencies.
            </p>

            <div className="space-y-6">
              {roadmap.diagnosticAssessments.map((q, qIdx) => {
                const selectedOpt = diagnosticAnswers[q.id];
                const isCorrect = selectedOpt === q.correctAnswerIndex;

                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                        {q.skill}
                      </span>
                      <span className="text-[11px] text-slate-400">Question {qIdx + 1} of {roadmap.diagnosticAssessments!.length}</span>
                    </div>

                    <h5 className="text-sm font-semibold text-white leading-snug">
                      {q.question}
                    </h5>

                    <div className="space-y-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={diagnosticSubmitted}
                          onClick={() => setDiagnosticAnswers({ ...diagnosticAnswers, [q.id]: oIdx })}
                          className={`w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer flex items-center justify-between ${
                            selectedOpt === oIdx
                              ? diagnosticSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
                                : 'bg-emerald-950/50 border-emerald-500 text-white'
                              : diagnosticSubmitted && oIdx === q.correctAnswerIndex
                              ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {diagnosticSubmitted && oIdx === q.correctAnswerIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>

                    {diagnosticSubmitted && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] leading-relaxed text-slate-300">
                        <strong className="text-white block mb-0.5">Explanation:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              {!diagnosticSubmitted ? (
                <button
                  type="button"
                  disabled={Object.keys(diagnosticAnswers).length < roadmap.diagnosticAssessments.length}
                  onClick={handleDiagnosticSubmit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer"
                >
                  Submit & Validate Skills
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDiagnosticModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Done (View Validated Matrix)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase Checkpoint Quiz Modal */}
      {activeCheckpointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  Phase Checkpoint Assessment
                </span>
                <h4 className="text-lg font-bold text-white font-heading">
                  {activeCheckpointModal.checkpoint.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveCheckpointModal(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeCheckpointModal.checkpoint.description} Passing score: {activeCheckpointModal.checkpoint.passingScorePercent || 70}%.
            </p>

            <div className="space-y-6">
              {activeCheckpointModal.checkpoint.questions.map((q, qIdx) => {
                const selectedOpt = checkpointAnswers[q.id];
                const isSubmitted = !!checkpointSubmitted[activeCheckpointModal.milestoneIndex];
                const isCorrect = selectedOpt === q.correctAnswerIndex;

                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">
                        Question {qIdx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Competency: {q.competencyTested}
                      </span>
                    </div>

                    <h5 className="text-sm font-semibold text-white leading-snug">
                      {q.question}
                    </h5>

                    <div className="space-y-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => setCheckpointAnswers({ ...checkpointAnswers, [q.id]: oIdx })}
                          className={`w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer flex items-center justify-between ${
                            selectedOpt === oIdx
                              ? isSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
                                : 'bg-emerald-950/50 border-emerald-500 text-white'
                              : isSubmitted && oIdx === q.correctAnswerIndex
                              ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && oIdx === q.correctAnswerIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>

                    {isSubmitted && (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] leading-relaxed text-slate-300">
                        <strong className="text-white block mb-0.5">Explanation:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Checkpoint Results Banner */}
            {checkpointSubmitted[activeCheckpointModal.milestoneIndex] && (
              <div
                className={`p-4 rounded-2xl border text-xs ${
                  checkpointScores[activeCheckpointModal.milestoneIndex]?.passed
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
                    : 'bg-amber-950/50 border-amber-800 text-amber-200'
                }`}
              >
                <div className="font-bold text-sm mb-1">
                  {checkpointScores[activeCheckpointModal.milestoneIndex]?.passed
                    ? '🎉 Competency Verified!'
                    : '⚠️ Checkpoint Needs Review'}
                </div>
                <div>
                  Score: {checkpointScores[activeCheckpointModal.milestoneIndex]?.score} of{' '}
                  {checkpointScores[activeCheckpointModal.milestoneIndex]?.total} correct.
                  {checkpointScores[activeCheckpointModal.milestoneIndex]?.passed
                    ? ' You have successfully verified the competencies in this phase!'
                    : ' Review the explanations above, re-practice the tasks, and try again.'}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center gap-3">
              {checkpointSubmitted[activeCheckpointModal.milestoneIndex] ? (
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...checkpointSubmitted, [activeCheckpointModal.milestoneIndex]: false };
                    setCheckpointSubmitted(updated);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Retry Checkpoint
                </button>
              ) : <div />}

              {!checkpointSubmitted[activeCheckpointModal.milestoneIndex] ? (
                <button
                  type="button"
                  disabled={
                    activeCheckpointModal.checkpoint.questions.some((q) => checkpointAnswers[q.id] === undefined)
                  }
                  onClick={() =>
                    handleCheckpointSubmit(activeCheckpointModal.milestoneIndex, activeCheckpointModal.checkpoint)
                  }
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer"
                >
                  Submit & Score Checkpoint
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveCheckpointModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Close & Continue Roadmap
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
