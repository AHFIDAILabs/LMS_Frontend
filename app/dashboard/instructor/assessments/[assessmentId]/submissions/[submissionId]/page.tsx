"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useAuth } from "@/lib/context/AuthContext";
import { submissionService } from "@/services/submissionService";
import {
  FileText,
  ArrowLeft,
  Check,
  Loader2,
  User,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
} from "lucide-react";

const MONGO_ID_RE = /^[a-f\d]{24}$/i;

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams<{ submissionId: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const submissionId = params.submissionId;

  // ✅ Validate before any API call
  const isValidId = Boolean(
    submissionId &&
    submissionId !== "undefined" &&
    submissionId !== "null" &&
    MONGO_ID_RE.test(submissionId)
  );

  const [data, setData] = useState<any>(null);
  const [score, setScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gradeSuccess, setGradeSuccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "instructor") {
      router.push("/dashboard");
      return;
    }
    if (!isValidId) {
      setLoading(false);
      return;
    }
    fetchSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role, submissionId, isValidId]);

  const fetchSubmission = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await submissionService.getSubmission(submissionId);
      if (res.success && res.data) {
        setData(res.data);
        if (typeof res.data.score === "number") setScore(res.data.score);
        if (res.data.feedback) setFeedback(res.data.feedback);
      } else {
        setError(res.error || "Failed to load submission");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load submission");
    } finally {
      setLoading(false);
    }
  };

  const onGrade = async () => {
    if (score === "" || typeof score !== "number") {
      setError("Please enter a valid numeric score.");
      return;
    }
    setSaving(true);
    setError(null);
    setGradeSuccess(false);
    try {
      const res = await submissionService.gradeSubmission(submissionId, { score, feedback });
      if (res.success) {
        setGradeSuccess(true);
        await fetchSubmission();
      } else {
        setError(res.error || "Failed to grade submission");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to grade submission");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
      : "—";

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex overflow-hidden">
        <InstructorSidebar />
        <div className="flex-1 lg:ml-64 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading submission…</p>
        </div>
      </div>
    );
  }

  // ─── Invalid ID guard ────────────────────────────────────────────────────────
  if (!isValidId) {
    return (
      <div className="min-h-screen bg-slate-900 flex overflow-hidden">
        <InstructorSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Invalid Submission ID</p>
            <p className="text-gray-400 text-sm mb-5">
              The URL contains an invalid or missing submission ID.
              Navigate here from the submissions list.
            </p>
            <Link
              href="/dashboard/instructor/assessments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft size={15} /> Go to Assessments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Not found / error ───────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex overflow-hidden">
        <InstructorSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <FileText size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-red-400 font-semibold mb-1">
              {error || "Submission not found"}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              It may have been deleted or you don't have access.
            </p>
            <Link
              href="/dashboard/instructor/assessments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft size={15} /> Back to Assessments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Data ready ─────────────────────────────────────────────────────────────
  const student = (data.studentId as any) || {};
  const assessment = (data.assessmentId as any) || {};
  const totalPoints = assessment?.totalPoints ?? 100;
  const isAlreadyGraded = data.status === "graded";

  // ✅ Safe back-link: only include assessmentId if it's a valid Mongo ID
  const assessmentIdStr = assessment?._id
    ? String(assessment._id)
    : "";
  const backToSubmissions =
    assessmentIdStr && MONGO_ID_RE.test(assessmentIdStr)
      ? `/dashboard/instructor/assessments/${assessmentIdStr}/submissions`
      : "/dashboard/instructor/assessments";

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      <InstructorSidebar />
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="max-w-[900px] mx-auto p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText className="text-emerald-400 shrink-0" size={26} />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {assessment?.title || "Submission Detail"}
                </h1>
                <p className="text-gray-500 text-xs mt-0.5 font-mono">{submissionId}</p>
              </div>
            </div>
            <Link
              href={backToSubmissions}
              className="self-start inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
            >
              <ArrowLeft size={14} />
              {assessmentIdStr ? "All Submissions" : "Assessments"}
            </Link>
          </div>

          {/* Student + meta */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <User size={12} /> Student
              </p>
              <p className="text-white font-semibold">
                {student?.firstName} {student?.lastName}
              </p>
              {student?.email && (
                <p className="text-gray-400 text-xs mt-0.5">{student.email}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <BookOpen size={12} /> Assessment
              </p>
              <p className="text-white font-semibold">{assessment?.title || "—"}</p>
              {assessment?.type && (
                <p className="text-gray-400 text-xs mt-0.5 capitalize">{assessment.type}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock size={12} /> Submitted
              </p>
              <p className="text-gray-300 text-sm">{formatDate(data.submittedAt)}</p>
              <p className="text-gray-500 text-xs mt-0.5">Attempt #{data.attemptNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award size={12} /> Grade
              </p>
              {isAlreadyGraded ? (
                <>
                  <p className="text-white font-bold text-lg">
                    {data.score}
                    <span className="text-gray-500 font-normal text-sm">/{totalPoints}</span>
                    <span className="text-emerald-400 text-sm ml-2">({data.percentage}%)</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Graded {formatDate(data.gradedAt)}
                  </p>
                </>
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-yellow-500/20 text-yellow-400 border-yellow-500/30 capitalize">
                  {data.status}
                </span>
              )}
            </div>
          </div>

          {/* Answers */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-5 mb-5">
            <h2 className="text-white font-semibold mb-4">
              Student Answers
              {Array.isArray(data.answers) && (
                <span className="text-gray-500 font-normal text-sm ml-2">
                  ({data.answers.length} answer{data.answers.length !== 1 ? "s" : ""})
                </span>
              )}
            </h2>

            {Array.isArray(data.answers) && data.answers.length > 0 ? (
              <ul className="space-y-4">
                {data.answers.map((ans: any, idx: number) => {
                  const question = assessment?.questions?.[ans.questionIndex];
                  const isCorrect = ans.isCorrect;

                  return (
                    <li
                      key={idx}
                      className={`rounded-xl p-4 border ${
                        isCorrect === true
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : isCorrect === false
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-slate-700/50 bg-slate-900/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-gray-500 text-xs">
                          Q{(ans.questionIndex ?? idx) + 1}
                        </span>
                        {question?.type && (
                          <span className="capitalize text-xs px-1.5 py-0.5 bg-slate-700 rounded text-gray-400">
                            {question.type.replace(/_/g, " ")}
                          </span>
                        )}
                        {question?.points != null && (
                          <span className="text-xs text-amber-400/80">{question.points} pts</span>
                        )}
                        {isCorrect !== undefined && (
                          <span
                            className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${
                              isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-red-500/10 border-red-500/30 text-red-400"
                            }`}
                          >
                            {isCorrect ? `✓ +${ans.pointsEarned ?? 0} pts` : "✗ Incorrect"}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-200 font-medium text-sm mb-3">
                        {question?.questionText ?? `Question ${(ans.questionIndex ?? idx) + 1}`}
                      </p>

                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 text-xs shrink-0 mt-0.5">Answer:</span>
                        <span
                          className={`text-sm ${
                            isCorrect === true
                              ? "text-emerald-400"
                              : isCorrect === false
                              ? "text-red-400"
                              : "text-gray-300"
                          }`}
                        >
                          {Array.isArray(ans.answer)
                            ? ans.answer.join(", ")
                            : String(ans.answer ?? "—")}
                        </span>
                      </div>

                      {isCorrect === false && question?.correctAnswer != null && (
                        <p className="text-xs text-gray-500 mt-2">
                          Correct:{" "}
                          <span className="text-emerald-400/80">
                            {Array.isArray(question.correctAnswer)
                              ? question.correctAnswer.join(", ")
                              : String(question.correctAnswer)}
                          </span>
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No answers recorded for this submission.</p>
            )}
          </div>

          {/* Grading panel */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">
              {isAlreadyGraded ? "Update Grade" : "Grade Submission"}
            </h2>

            {gradeSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4">
                <p className="text-emerald-400 text-sm">✓ Grade saved successfully.</p>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Score <span className="text-gray-600 font-normal">/ {totalPoints}</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={totalPoints}
                  value={score}
                  onChange={(e) =>
                    setScore(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full px-3 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder={`0 – ${totalPoints}`}
                />
                {typeof score === "number" && totalPoints > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    = {Math.round((score / totalPoints) * 100)}%
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5">
                  Feedback <span className="text-gray-600 font-normal">(optional)</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400 transition-colors resize-none"
                  rows={3}
                  placeholder="Leave feedback for the student…"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={onGrade}
                disabled={saving || score === ""}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {saving ? "Saving…" : isAlreadyGraded ? "Update Grade" : "Save Grade"}
              </button>
              {isAlreadyGraded && (
                <span className="text-xs text-gray-500">
                  Last graded {formatDate(data.gradedAt)}
                </span>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}