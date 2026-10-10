import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  FolderGit2,
  BookOpen,
  CheckSquare,
  Square,
  Award,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  Code2,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { LearningRoadmap, PhaseCheckpoint } from '../../types';

interface RoadmapTabProps {
  roadmap: LearningRoadmap;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ roadmap }) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [activeCheckpointModal, setActiveCheckpointModal] = useState<{
    milestoneIndex: number;
    checkpoint: PhaseCheckpoint;
  } | null>(null);
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, number>>({});
  const [checkpointSubmitted, setCheckpointSubmitted] = useState<Record<number, boolean>>({});

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Calculate total tasks and progress
  const allTasks: string[] = [];
  roadmap.milestones.forEach((m, mIdx) => {
    if (m.detailedTasks && m.detailedTasks.length > 0) {
      m.detailedTasks.forEach((t) => allTasks.push(t.id));
    } else {
      m.practicalTasks.forEach((_, tIdx) => {
        allTasks.push(`task-${mIdx}-${tIdx}`);
      });
    }
  });

  const completedCount = allTasks.filter((t) => completedTasks[t]).length;
  const progressPercent =
    allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Live Progress */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight font-heading">
                {roadmap.title || 'Personalised Learning Roadmap'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {roadmap.objective}
            </p>
          </div>

          {/* Progress Tracker Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 min-w-[200px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Roadmap Progress</span>
              <span className="font-bold text-emerald-400 tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 text-right">
              {completedCount} of {allTasks.length} tasks completed
            </div>
          </div>
        </div>
      </div>

      {/* Stated Assumptions if present */}
      {roadmap.statedAssumptions && roadmap.statedAssumptions.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white block mb-0.5">Assumptions & Pacing:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              {roadmap.statedAssumptions.map((assump, idx) => (
                <li key={idx}>{assump}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Skill Validation Summary if present */}
      {roadmap.skillValidationSummary && roadmap.skillValidationSummary.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Baseline Competency Analysis
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {roadmap.skillValidationSummary.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-emerald-300 border border-slate-800">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.isValidated ? 'Validated' : 'Self-Reported'}
                  </span>
                </div>
                <div className="font-semibold text-white text-xs">{item.skill}</div>
                <div className="text-[11px] text-slate-400 leading-snug">{item.whyItMatters}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones Timeline */}
      <div className="space-y-6">
        {roadmap.milestones.map((milestone, mIdx) => {
          const hasDetailedTasks = milestone.detailedTasks && milestone.detailedTasks.length > 0;

          return (
            <div
              key={mIdx}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden space-y-5"
            >
              {/* Header: Phase & Title */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                      {milestone.phaseOrDay}
                    </span>
                    {milestone.timeFrame && (
                      <span className="text-[11px] text-slate-400">· {milestone.timeFrame}</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight mt-0.5 font-heading">
                    {milestone.title}
                  </h3>
                  {milestone.learningObjective && (
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      {milestone.learningObjective}
                    </p>
                  )}
                </div>

                {/* Focus Skills */}
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

              {/* Practical Tasks Checkbox List */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hands-On Action Items</span>
                </div>

                {hasDetailedTasks ? (
                  milestone.detailedTasks!.map((task, tIdx) => {
                    const taskId = task.id || `task-${mIdx}-${tIdx}`;
                    const isChecked = !!completedTasks[taskId];
                    const isExpanded = !!expandedTasks[taskId];

                    return (
                      <div
                        key={taskId}
                        className={`rounded-xl border transition-all text-xs ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                            : 'bg-slate-950/70 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="p-3.5 flex items-center justify-between gap-3">
                          <div
                            onClick={() => toggleTask(taskId)}
                            className="flex items-start gap-3 cursor-pointer flex-1"
                          >
                            <button
                              type="button"
                              aria-label="Toggle task completion"
                              className="mt-0.5 shrink-0 focus:outline-none"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500" />
                              )}
                            </button>
                            <div>
                              <span className={`font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                                {task.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 ml-2">
                                ({task.estimatedTime})
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleTaskExpanded(taskId)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-slate-850 space-y-3 text-xs">
                            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                              <span className="text-[11px] font-bold text-cyan-400 block mb-1">What to learn:</span>
                              <p className="text-slate-300 leading-relaxed">{task.whatToLearn}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                              <span className="text-[11px] font-bold text-amber-400 block mb-1">Practice task:</span>
                              <p className="text-slate-300 leading-relaxed">{task.practiceTask}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                              <span className="text-[11px] font-bold text-emerald-400 block mb-1">Verification:</span>
                              <p className="text-slate-300 leading-relaxed">{task.completionCriteria}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  milestone.practicalTasks.map((task, tIdx) => {
                    const taskId = `task-${mIdx}-${tIdx}`;
                    const isChecked = !!completedTasks[taskId];

                    return (
                      <div
                        key={tIdx}
                        onClick={() => toggleTask(taskId)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300 line-through opacity-85'
                            : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          aria-label="Toggle task completion"
                          className="mt-0.5 shrink-0 focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                        <span className="leading-snug select-none">{task}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Portfolio Project Milestone & Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>Portfolio Milestone (GitHub Deliverable)</span>
                  </div>
                  <p className="text-slate-300 leading-snug">
                    {milestone.projectMilestone}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                    <Award className="w-3.5 h-3.5" />
                    <span>Progress Verification Test</span>
                  </div>
                  <p className="text-slate-300 leading-snug">
                    {milestone.howToVerifyProgress}
                  </p>
                </div>
              </div>

              {/* Phase Checkpoint Button if present */}
              {milestone.checkpoint && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-white block">{milestone.checkpoint.title}</span>
                    <span className="text-slate-400">{milestone.checkpoint.description}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCheckpointModal({ milestoneIndex: mIdx, checkpoint: milestone.checkpoint! })}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shrink-0 cursor-pointer"
                  >
                    Take Checkpoint Quiz
                  </button>
                </div>
              )}

              {/* Recommended Resources */}
              {milestone.recommendedResources && milestone.recommendedResources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-400 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    Key Guides:
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

      {/* Checkpoint Modal */}
      {activeCheckpointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white font-heading">
                {activeCheckpointModal.checkpoint.title}
              </h4>
              <button
                type="button"
                onClick={() => setActiveCheckpointModal(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {activeCheckpointModal.checkpoint.questions.map((q, qIdx) => {
                const selected = checkpointAnswers[q.id];
                const submitted = checkpointSubmitted[activeCheckpointModal.milestoneIndex];
                const isCorrect = selected === q.correctAnswerIndex;

                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-semibold text-white">
                      {qIdx + 1}. {q.question}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={submitted}
                          onClick={() => setCheckpointAnswers({ ...checkpointAnswers, [q.id]: oIdx })}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs cursor-pointer ${
                            selected === oIdx
                              ? submitted
                                ? isCorrect
                                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                                  : 'bg-rose-950 border-rose-500 text-rose-200'
                                : 'bg-emerald-950 border-emerald-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {submitted && (
                      <p className="text-[11px] text-slate-400 pt-1">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              {!checkpointSubmitted[activeCheckpointModal.milestoneIndex] ? (
                <button
                  type="button"
                  onClick={() =>
                    setCheckpointSubmitted({
                      ...checkpointSubmitted,
                      [activeCheckpointModal.milestoneIndex]: true,
                    })
                  }
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Submit Answers
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveCheckpointModal(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
