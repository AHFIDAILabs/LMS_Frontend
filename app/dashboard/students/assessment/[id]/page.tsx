"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { assessmentService } from "@/services/assessmentService";
import { submissionService } from "@/services/submissionService";
import { 
  ArrowLeft, Send, Loader2, FileText, CheckCircle2, 
  Clock, AlertCircle, ChevronRight, Calendar, Target,
  Play, BookOpen
} from "lucide-react";
import toast from "react-hot-toast";

export default function AssessmentDetailPage() {
  const params = useParams<{ id: string }>();          // ← was { assessmentId: string }
const assessmentId = params.id;                      // ← was params.assessmentId
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [assessment, setAssessment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [isRetaking, setIsRetaking] = useState(false);


  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "student") {
      router.replace("/auth/login");
      return;
    }
    void load();
  }, [authLoading, isAuthenticated, user?.role, assessmentId]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    
    try {
      // Fetch assessment details
      const assessmentRes = await assessmentService.getById(assessmentId);
      if (!assessmentRes.success) {
        setErr(assessmentRes.message || "Failed to load assessment");
        toast.error(assessmentRes.message || "Failed to load assessment");
        setLoading(false);
        return;
      }
      
      setAssessment(assessmentRes.data);
      
      // Fetch student's submissions for this assessment
      const submissionsRes = await submissionService.getMySubmissions(assessmentId);
      if (submissionsRes.success) {
        setSubmissions(submissionsRes.data || []);
        
        // Pre-fill answers if there's a draft submission
        const draftSubmission = submissionsRes.data?.find((s: any) => s.status === 'draft');
if (draftSubmission && draftSubmission.answers) {
  const answersMap: Record<string, string> = {};
  draftSubmission.answers.forEach((a: any, i: number) => {
    const key = a.questionIndex !== undefined ? `q-${a.questionIndex}` : `q-${i}`;
    answersMap[key] = Array.isArray(a.answer) ? a.answer.join(', ') : a.answer;
  });
  setAnswers(answersMap);
}
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
      setErr("Failed to load assessment");
      toast.error("Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

const handleAnswerChange = (qKey: string, answer: string) => {
  if (!qKey) return;
  setAnswers(prev => ({ ...prev, [qKey]: answer }));
};

// Replace the entire handleSubmit function

const handleSubmit = async () => {
  const unansweredQuestions = assessment.questions?.filter(
    (q: any, i: number) => !answers[q._id ?? `q-${i}`]?.trim()
  );
  if (unansweredQuestions?.length > 0) {
    toast.error(`Please answer all questions (${unansweredQuestions.length} remaining)`);
    return;
  }

  setSubmitting(true);
  try {
    const formattedAnswers = assessment.questions?.map((q: any, i: number) => {
      const qKey = q._id ?? `q-${i}`;
      return {
        questionIndex: i,            // ✅ was: questionId: q._id  — schema requires questionIndex (number)
        answer: answers[qKey] || "",
      };
    }) || [];

    const res = await submissionService.createSubmission({
      assessmentId,
      answers: formattedAnswers,
      courseId: assessment.courseId?._id || assessment.courseId,
      programId: undefined,
    });

    if (res.success) {
      toast.success("Assessment submitted successfully! 🎉");
      await load();
    } else {
      toast.error(res.error || "Failed to submit assessment");
    }
  } catch (error) {
    console.error("Error submitting assessment:", error);
    toast.error("Failed to submit assessment");
  } finally {
    setSubmitting(false);
  }
};

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <StudentSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <StudentSidebar />
        <div className="flex-1 ml-64 p-6">
          <div className="text-center max-w-md mx-auto mt-20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-2">{err || "Assessment not found"}</p>
            <Link href="/dashboard/students/assessment" className="text-lime-400 hover:text-lime-300 underline">
              Back to Assessments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get latest submitted submission (not draft)
 const latestSubmission = submissions.find(s => s.status !== 'draft');
const isSubmitted = !!latestSubmission;
const isGraded = latestSubmission?.status === 'graded';
const isPassed = isGraded && latestSubmission?.percentage >= assessment.passingScore;

// ✅ Count only real (non-draft) attempts
const completedAttempts = submissions.filter(s => s.status !== 'draft').length;
// ✅ Can retake if: graded + failed + attempts remaining
const canRetake = isGraded && !isPassed && completedAttempts < (assessment.attempts ?? 2);

const answeredCount = assessment?.questions?.filter(
  (q: any, i: number) => answers[q._id ?? `q-${i}`]?.trim()
).length ?? 0;
  const totalQuestions = assessment.questions?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      <StudentSidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Animated background effects */}
        <div className="fixed inset-0 ml-64 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              <Link href="/dashboard/students/assessment" className="text-gray-400 hover:text-gray-300 transition-colors">
                Assessments
              </Link>
              <ChevronRight size={14} className="text-gray-600" />
              <span className="text-gray-500">{assessment.title}</span>
            </div>

            {/* Title section */}
            <div className="flex items-start gap-6">
              <Link
                href="/dashboard/students/assessment"
                className="group mt-2 px-4 py-3 bg-gradient-to-br from-slate-800/90 to-slate-800/70 hover:from-slate-700/90 hover:to-slate-700/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <span className="text-purple-400 text-xs font-semibold uppercase tracking-wide">
                      {assessment.type || 'Assessment'}
                    </span>
                  </div>
                  {isSubmitted && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                      isGraded 
                        ? isPassed
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : 'bg-red-500/10 border border-red-500/20'
                        : 'bg-blue-500/10 border border-blue-500/20'
                    }`}>
                      <CheckCircle2 size={12} className={
                        isGraded 
                          ? isPassed ? 'text-emerald-400' : 'text-red-400'
                          : 'text-blue-400'
                      } />
                      <span className={`text-xs font-semibold ${
                        isGraded 
                          ? isPassed ? 'text-emerald-400' : 'text-red-400'
                          : 'text-blue-400'
                      }`}>
                        {isGraded ? (isPassed ? 'Passed' : 'Failed') : 'Submitted'}
                      </span>
                    </div>
                  )}
                </div>
                
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
                  {assessment.title}
                </h1>

                {/* Meta information */}
                <div className="flex items-center gap-6 text-sm flex-wrap">
                  {assessment.passingScore && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Target size={16} />
                      <span>Passing: {assessment.passingScore}%</span>
                    </div>
                  )}
                  {assessment.duration && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={16} />
                      <span>{assessment.duration} min</span>
                    </div>
                  )}
                  {assessment.endDate && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={16} />
                      <span>Due: {new Date(assessment.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                {(latestSubmission?.attemptNumber || isRetaking) && (
  <div className="flex items-center gap-2 text-gray-400">
    <BookOpen size={16} />
    <span>
      Attempt {isRetaking ? completedAttempts + 1 : latestSubmission.attemptNumber} of {assessment.attempts || 2}
    </span>
  </div>
)}
                </div>
              </div>
            </div>
          </header>

          {/* Assessment Content */}
          <div className="space-y-8 mb-8">
            {/* Description */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <FileText size={24} className="text-lime-400" />
                Assessment Description
              </h2>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {assessment.description || "No description provided."}
              </div>
            </div>

           
          {/* Graded Submission Result */}
{isGraded && !isRetaking && (
  <div className={`bg-gradient-to-br ${isPassed ? 'from-emerald-900/20 to-emerald-900/10 border-emerald-500/30' : 'from-red-900/20 to-red-900/10 border-red-500/30'} backdrop-blur-sm border rounded-2xl p-8 shadow-lg`}>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <CheckCircle2 size={24} className={isPassed ? 'text-emerald-400' : 'text-red-400'} />
        Your Results
      </h2>
      <div className={`px-6 py-3 ${isPassed ? 'bg-emerald-500/20' : 'bg-red-500/20'} rounded-xl`}>
        <span className={`${isPassed ? 'text-emerald-400' : 'text-red-400'} font-bold text-2xl`}>
          {latestSubmission.percentage}%
        </span>
      </div>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <p className="text-sm text-gray-400 mb-1">Score</p>
          <p className="text-2xl font-bold text-white">
            {latestSubmission.score} / {assessment.totalPoints || 100}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <p className="text-sm text-gray-400 mb-1">Attempts Used</p>
          <p className="text-2xl font-bold text-white">
            {completedAttempts} / {assessment.attempts ?? 2}
          </p>
        </div>
      </div>

      {latestSubmission.feedback && (
        <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/30">
          <p className="text-sm text-blue-400 font-semibold mb-2">Instructor Feedback:</p>
          <p className="text-gray-300 whitespace-pre-wrap">{latestSubmission.feedback}</p>
        </div>
      )}

      <div className="text-sm text-gray-400">
        Submitted on {new Date(latestSubmission.submittedAt).toLocaleString()}
        {latestSubmission.gradedAt && ` • Graded on ${new Date(latestSubmission.gradedAt).toLocaleString()}`}
      </div>

      {/* ✅ Retake button */}
      {canRetake && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-yellow-400 font-semibold mb-1">Retake Available</p>
                <p className="text-sm text-gray-300">
                  You have {(assessment.attempts ?? 2) - completedAttempts} attempt(s) remaining.
                </p>
              </div>
            </div>
            {/* ✅ Actual retake button */}
            <button
              onClick={() => {
                setAnswers({});        // clear previous answers
                setIsRetaking(true);   // show questions section again
              }}
              className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg shadow-yellow-500/20 flex items-center gap-2"
            >
              <Play size={16} />
              Start Retake
            </button>
          </div>
        </div>
      )}

      {/* No retake left */}
      {!canRetake && !isPassed && completedAttempts >= (assessment.attempts ?? 2) && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm font-semibold">
            No attempts remaining. Contact your instructor if you need assistance.
          </p>
        </div>
      )}
    </div>
  </div>
)}

       {/* Questions Section */}
{(!isSubmitted || isRetaking) && assessment.questions && assessment.questions.length > 0 && (
  <div id="questions-section" className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-lg">

     {/* Retake header banner */}
{isRetaking && (
  <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between">
    <div className="flex items-center gap-2">
      <AlertCircle size={16} className="text-yellow-400" />
      <span className="text-yellow-400 text-sm font-semibold">Retake in progress</span>
    </div>
    <button
      onClick={() => { setIsRetaking(false); setAnswers({}); }}
      className="text-gray-400 hover:text-gray-300 text-sm"
    >
      Cancel
    </button>
  </div>
)}


    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <Target size={24} className="text-cyan-400" />
        Questions ({answeredCount} / {totalQuestions})
      </h2>
      {answeredCount > 0 && answeredCount < totalQuestions && (
        <span className="text-sm text-yellow-400">
          {totalQuestions - answeredCount} remaining
        </span>
      )}
    </div>

    <div className="space-y-6">
      {assessment.questions.map((question: any, index: number) => {
        // ✅ FIX 1: stable key that doesn't collapse to undefined
        const qKey = question._id ?? `q-${index}`;
        const currentAnswer = answers[qKey] || "";
        const isAnswered = !!currentAnswer.trim();

        // Option labels for multiple choice
        const optionLabels = ["A", "B", "C", "D", "E"];

        return (
          <div
            key={qKey}
            className={`rounded-xl p-6 border transition-all duration-200 ${
              isAnswered
                ? "bg-slate-800/80 border-lime-500/30"
                : "bg-slate-900/50 border-slate-700/30"
            }`}
          >
            {/* Question header */}
            <div className="flex items-start gap-4 mb-5">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 transition-colors ${
                isAnswered
                  ? "bg-lime-500 text-white"
                  : "bg-gradient-to-br from-slate-600 to-slate-700 text-gray-300"
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-gray-100 text-lg font-medium leading-relaxed">
                  {question.questionText}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-slate-700/50 rounded-md">
                    {question.type.replace(/_/g, " ")}
                  </span>
                  {question.points && (
                    <span className="text-xs text-lime-500/70">
                      {question.points} {question.points === 1 ? "point" : "points"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ FIX 2: Render input based on question type */}

            {/* MULTIPLE CHOICE */}
            {question.type === "multiple_choice" && question.options?.length > 0 && (
              <div className="space-y-3 ml-12">
                {question.options.map((option: string, optIdx: number) => {
                  const label = optionLabels[optIdx] ?? String(optIdx + 1);
                  const isSelected = currentAnswer === option;
                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${
                        isSelected
                          ? "bg-lime-500/15 border-lime-500/50 shadow-sm shadow-lime-500/10"
                          : "bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/40 hover:border-slate-600/60"
                      }`}
                    >
                      {/* Hidden native radio */}
                      <input
                        type="radio"
                        name={`question-${qKey}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(qKey, option)}
                        className="sr-only"
                      />
                      {/* Custom radio + letter */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                        isSelected
                          ? "bg-lime-500 text-white"
                          : "bg-slate-700 text-gray-400 group-hover:bg-slate-600"
                      }`}>
                        {label}
                      </div>
                      <span className={`flex-1 text-base transition-colors ${
                        isSelected ? "text-white font-medium" : "text-gray-300"
                      }`}>
                        {option}
                      </span>
                      {/* Check indicator */}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 12 9" fill="none" className="w-3 h-3">
                            <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {/* TRUE / FALSE */}
            {question.type === "true_false" && (
              <div className="flex gap-4 ml-12">
                {["True", "False"].map((option) => {
                  const isSelected = currentAnswer === option;
                  return (
                    <label
                      key={option}
                      className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? option === "True"
                            ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                            : "bg-red-500/15 border-red-500/50 text-red-400"
                          : "bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/40 text-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qKey}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(qKey, option)}
                        className="sr-only"
                      />
                      <span className="font-semibold text-base">{option}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* SHORT ANSWER */}
            {question.type === "short_answer" && (
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(qKey, e.target.value)}
                placeholder="Type your answer here..."
                rows={3}
                className="w-full ml-12 px-4 py-3 bg-slate-800/70 border border-slate-700/50 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all resize-none"
                style={{ width: "calc(100% - 3rem)" }}
              />
            )}

            {/* CODING */}
            {question.type === "coding" && (
              <div className="ml-12" style={{ width: "calc(100% - 3rem)" }}>
                {question.codeTemplate && (
                  <div className="mb-3 p-4 bg-slate-950/80 border border-slate-700/50 rounded-xl font-mono text-sm text-gray-400">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Template</p>
                    <pre className="whitespace-pre-wrap">{question.codeTemplate}</pre>
                  </div>
                )}
                <textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(qKey, e.target.value)}
                  placeholder="Write your code here..."
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/50 rounded-xl text-lime-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all resize-y font-mono text-sm"
                  spellCheck={false}
                />
              </div>
            )}

            {/* ESSAY */}
            {question.type === "essay" && (
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(qKey, e.target.value)}
                placeholder="Write your essay response here..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-800/70 border border-slate-700/50 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all resize-y ml-12"
                style={{ width: "calc(100% - 3rem)" }}
              />
            )}
          </div>
        );
      })}
    </div>

    {/* Submit Button */}
    <div className="mt-8">
      <button
        onClick={handleSubmit}
        disabled={submitting || answeredCount < totalQuestions}
        className="w-full px-6 py-4 bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-400 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-lime-500/30 hover:shadow-xl hover:shadow-lime-500/40"
      >
        {submitting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send size={20} />
            <span>Submit Assessment ({answeredCount}/{totalQuestions} answered)</span>
          </>
        )}
      </button>
      {answeredCount < totalQuestions && (
        <p className="text-center text-sm text-gray-400 mt-3">
          Please answer all {totalQuestions} questions before submitting
        </p>
      )}
    </div>
  </div>
)}
          </div>
        </div>
      </main>
    </div>
  );
}