import React, { useState } from 'react';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Loader2,
  ChevronRight,
  Info,
  Clock,
  BookOpen,
} from 'lucide-react';
import {
  InterviewType,
  InterviewDifficulty,
  InterviewAnswerFeedback,
  InterviewHistoryItem,
  InterviewFinalSummary,
} from '../../types';

interface VirtualInterviewToolProps {
  initialRole?: string;
  candidateName?: string;
}

export const VirtualInterviewTool: React.FC<VirtualInterviewToolProps> = ({
  initialRole = 'Junior Full-Stack Developer',
  candidateName = 'Candidate',
}) => {
  // Configuration state
  const [targetRole, setTargetRole] = useState(initialRole);
  const [experienceLevel, setExperienceLevel] = useState('Fresh Graduate / Entry-Level');
  const [interviewType, setInterviewType] = useState<InterviewType>('Technical');
  const [difficultyLevel, setDifficultyLevel] = useState<InterviewDifficulty>('Intermediate');

  // Active session state
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<InterviewAnswerFeedback | null>(null);
  const [qaHistory, setQaHistory] = useState<InterviewHistoryItem[]>([]);
  const [finalSummary, setFinalSummary] = useState<InterviewFinalSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Start new interview
  const handleStartInterview = async () => {
    if (!targetRole.trim()) {
      setErrorMsg('Please enter a target role to generate interview questions.');
      return;
    }

    setErrorMsg(null);
    setIsGeneratingQuestions(true);
    setFinalSummary(null);
    setQaHistory([]);
    setCurrentQuestionIndex(0);
    setCurrentFeedback(null);
    setActiveFollowUp(null);
    setCandidateAnswer('');

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          experienceLevel,
          interviewType,
          difficultyLevel,
          candidateName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.questions || data.questions.length === 0) {
        throw new Error(data.error || 'Failed to generate interview questions.');
      }

      setQuestions(data.questions);
      setSessionStarted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error generating interview questions.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Submit answer for evaluation
  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || candidateAnswer.trim().length < 15) {
      setErrorMsg('Please write a substantive response (at least a couple of sentences) to receive thorough feedback.');
      return;
    }

    setErrorMsg(null);
    setIsEvaluating(true);
    const activeQuestion = activeFollowUp || questions[currentQuestionIndex];

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion,
          answer: candidateAnswer,
          targetRole,
          interviewType,
          difficultyLevel,
          candidateName,
          questionIndex: currentQuestionIndex + 1,
          totalQuestions: questions.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate answer.');
      }

      const feedback = data.feedback;
      setCurrentFeedback(feedback);

      // Save to history
      setQaHistory((prev) => [
        ...prev,
        {
          questionNumber: currentQuestionIndex + 1,
          question: activeQuestion,
          answer: candidateAnswer,
          feedback,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with interview evaluator.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Switch to follow-up question
  const handleAnswerFollowUp = () => {
    if (currentFeedback?.followUpQuestion) {
      setActiveFollowUp(currentFeedback.followUpQuestion);
      setCandidateAnswer('');
      setCurrentFeedback(null);
      setErrorMsg(null);
    }
  };

  // Move to next primary question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setActiveFollowUp(null);
      setCandidateAnswer('');
      setCurrentFeedback(null);
      setErrorMsg(null);
    } else {
      // Completed all questions -> generate summary
      handleFinishInterview();
    }
  };

  // Finish interview and generate performance summary
  const handleFinishInterview = async () => {
    setIsSummarizing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/interview/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          interviewType,
          qaHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate performance debrief.');
      }

      setFinalSummary(data.summary);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error compiling interview performance summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const currentQuestionText = activeFollowUp || questions[currentQuestionIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <MessageSquareCode className="w-4 h-4" />
            <span>Feature 04 · Virtual AI Interview</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Interactive HR, Technical & Behavioural Simulator
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Practice real interview questions with instant Gemini evaluation, rubrics, constructive critiques, model answers, and adaptive follow-up challenges.
          </p>
        </div>

        {sessionStarted && !finalSummary && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Do you want to reset this interview session?')) {
                setSessionStarted(false);
                setQuestions([]);
                setQaHistory([]);
                setCurrentFeedback(null);
                setFinalSummary(null);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Change Settings</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Screen 1: Configuration Form (Before session starts) */}
      {!sessionStarted && !finalSummary && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Configure Your Mock Interview Session
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Target Job Role */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Target Job Role <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Software Developer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Fresh Graduate / College Student">Fresh Graduate / College Student</option>
                <option value="Entry-Level (0-1 Years)">Entry-Level (0-1 Years)</option>
                <option value="Junior Engineer (1-2 Years)">Junior Engineer (1-2 Years)</option>
                <option value="Bootcamp Graduate / Career Switcher">Bootcamp Graduate / Career Switcher</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                {(['Beginner', 'Intermediate', 'Advanced'] as InterviewDifficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficultyLevel(level)}
                    className={`py-1.5 text-center text-xs rounded-lg transition-colors cursor-pointer ${
                      difficultyLevel === level
                        ? 'bg-indigo-600 text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {level.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Interview Stage</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                {(['Technical', 'HR', 'Behavioural'] as InterviewType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInterviewType(type)}
                    className={`py-1.5 text-center text-xs rounded-lg transition-colors cursor-pointer ${
                      interviewType === type
                        ? 'bg-amber-600 text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="text-slate-300 font-medium">AI Feedback Notice: </span>
              Questions and critiques are simulated by Google Gemini 3.8 based on standard industry screening rubrics. Feedback is educational and not an official hiring determination or guarantee of employment.
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleStartInterview}
              disabled={isGeneratingQuestions}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Generating Interview with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Start Virtual Interview Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Screen 2: Active Interview Question & Response Mode */}
      {sessionStarted && !finalSummary && (
        <div className="space-y-6">
          {/* Progress Header Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-800 text-amber-300 font-mono text-xs font-semibold">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-400">
                Stage: <span className="text-white font-medium">{interviewType} Interview</span> · Candidate Target: <span className="text-white font-medium">{targetRole}</span>
              </span>
            </div>

            {/* End session early button */}
            <button
              type="button"
              onClick={handleFinishInterview}
              disabled={isSummarizing || qaHistory.length === 0}
              className="text-xs text-slate-400 hover:text-amber-300 underline self-start sm:self-auto cursor-pointer disabled:opacity-40 disabled:no-underline"
            >
              End Interview & View Final Debrief ({qaHistory.length} answered)
            </button>
          </div>

          {/* Current Question Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-2">
                {activeFollowUp ? (
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Adaptive Follow-Up Question</span>
                  </span>
                ) : (
                  <span>Primary Screening Question</span>
                )}
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                "{currentQuestionText}"
              </h4>
            </div>

            {/* Candidate Answer Textarea */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="font-semibold text-slate-300">Your Response</label>
                <span>{candidateAnswer.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <textarea
                rows={6}
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder="Type your response here... Tip: Structure with clear situation context, actions taken, and tangible results."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Evaluates clarity, relevance, technical structure, and completeness
              </p>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isEvaluating}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 ml-auto"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Evaluating with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Answer for AI Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Evaluation Card */}
          {currentFeedback && (
            <div className="bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6 animate-in fade-in duration-300">
              {/* Header: Overall Score & Rubric Breakdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider">
                    Instant AI Evaluation
                  </span>
                  <h5 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                    <Award className="w-5 h-5 text-sky-400" />
                    <span>Response Assessment & Rubric Score</span>
                  </h5>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-3xl font-black text-sky-400">
                      {currentFeedback.scoreOutOf10}/10
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Evaluation Score
                    </div>
                  </div>
                </div>
              </div>

              {/* Rubric Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Relevance</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {currentFeedback.rubricScores.relevance}/10
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Clarity</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {currentFeedback.rubricScores.clarity}/10
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Technical Depth</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {currentFeedback.rubricScores.depthOrCorrectness}/10
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Structure / STAR</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {currentFeedback.rubricScores.structure}/10
                  </div>
                </div>
              </div>

              {/* Overall Critique */}
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {currentFeedback.overallCritique}
              </div>

              {/* Strengths & Areas for Improvement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 space-y-2">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Strengths in Your Answer</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    {currentFeedback.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-200 space-y-2">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Areas for Improvement</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    {currentFeedback.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">✗</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Exemplary Answer */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs space-y-1.5">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Exemplary Model Answer (How a Senior Candidate Would Frame It)</span>
                </div>
                <p className="text-slate-300 leading-relaxed italic">
                  "{currentFeedback.modelAnswer}"
                </p>
              </div>

              {/* Adaptive Follow-up Challenge Prompt */}
              {currentFeedback.followUpQuestion && !activeFollowUp && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                      Interviewer Follow-Up Drill
                    </span>
                    <div className="text-amber-200 font-medium mt-0.5">
                      "{currentFeedback.followUpQuestion}"
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAnswerFollowUp}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shrink-0 transition-colors cursor-pointer"
                  >
                    Answer Follow-Up Question
                  </button>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleFinishInterview}
                  disabled={isSummarizing}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer self-start sm:self-auto"
                >
                  End & View Summary
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={isSummarizing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer self-end sm:self-auto"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating Final Debrief...</span>
                    </>
                  ) : currentQuestionIndex < questions.length - 1 ? (
                    <>
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>View Final Performance Debrief</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen 3: Final Performance Summary Report */}
      {finalSummary && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-2">
                <Award className="w-3.5 h-3.5 text-sky-400" />
                <span>Interview Debrief Completed</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Candidate Performance Summary
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Target Role: <span className="text-white font-medium">{targetRole}</span> · Stage: <span className="text-white font-medium">{interviewType}</span> · Answered {qaHistory.length} questions
              </p>
            </div>

            {/* Big Overall Score Badge */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center shrink-0 min-w-[140px]">
              <div className="text-3xl sm:text-4xl font-black text-sky-400">
                {finalSummary.overallScore}
                <span className="text-sm font-normal text-slate-500">/100</span>
              </div>
              <div className="text-[11px] font-semibold text-indigo-300 mt-0.5">
                {finalSummary.readinessLevel}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="font-semibold text-white block mb-1">Committee Executive Overview:</span>
            {finalSummary.executiveSummary}
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-900/40 space-y-3">
              <div className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Demonstrated Strengths</span>
              </div>
              <ul className="space-y-2 text-slate-300">
                {finalSummary.keyStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-rose-900/40 space-y-3">
              <div className="font-bold text-rose-300 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Priority Growth Areas</span>
              </div>
              <ul className="space-y-2 text-slate-300">
                {finalSummary.criticalGrowthAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✗</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3-Step Actionable Preparation Plan */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <div className="font-bold text-sky-300 flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Personalized Preparation Action Plan</span>
            </div>
            <div className="space-y-2 text-slate-300">
              {finalSummary.preparationRoadmap.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset / Practice Again Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Simulated by Google Gemini AI · For educational practice
            </p>
            <button
              type="button"
              onClick={() => {
                setSessionStarted(false);
                setFinalSummary(null);
                setQaHistory([]);
                setCurrentFeedback(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Practice Another Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
