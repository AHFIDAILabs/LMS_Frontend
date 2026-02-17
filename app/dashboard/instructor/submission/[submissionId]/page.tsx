"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useAuth } from "@/lib/context/AuthContext";
import { submissionService } from "@/services/submissionService";
import { FileText, ArrowLeft, Check, Loader2 } from "lucide-react";

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams<{ submissionId: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [data, setData] = useState<any>(null);
  const [score, setScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const submissionId = params.submissionId;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "instructor") {
      router.push("/dashboard");
      return;
    }
    void fetchSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role, submissionId]);

  const fetchSubmission = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await submissionService.getSubmission(submissionId);
      setData(res.data);
      if (typeof res.data?.score === "number") setScore(res.data.score);
      if (res.data?.feedback) setFeedback(res.data.feedback);
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
    try {
      await submissionService.gradeSubmission(submissionId, { score, feedback });
      await fetchSubmission();
    } catch (err: any) {
      setError(err?.message || "Failed to grade submission");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex overflow-hidden">
        <InstructorSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex overflow-hidden">
        <InstructorSidebar />
        <div className="flex-1 lg:ml-64 p-6">
          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : (
            <p className="text-gray-400">Submission not found.</p>
          )}
          <Link href="/dashboard/instructor/assessments" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>
    );
  }

  const student = (data.studentId as any) || {};
  const assessment = (data.assessmentId as any) || {};

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      <InstructorSidebar />
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-emerald-400" size={28} />
              <div>
                <h1 className="text-2xl font-bold text-white">Submission</h1>
                <p className="text-gray-400 text-sm">
                  {assessment?.title ? `Assessment: ${assessment.title}` : `Assessment ${assessment?._id || ""}`}
                </p>
              </div>
            </div>
            <Link href={`/dashboard/instructor/assessments/${assessment?._id || ""}/submissions`} className="text-emerald-400 hover:text-emerald-300 text-sm">
              <ArrowLeft size={14} className="inline mr-1" />
              Back to Submissions
            </Link>
          </div>

          {/* Student & meta */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-4 mb-6">
            <p className="text-white text-sm"><span className="text-gray-400">Student:</span> {student?.firstName} {student?.lastName}</p>
            {student?.email && <p className="text-gray-400 text-xs mt-1">{student.email}</p>}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mt-3">
              <div><span className="text-gray-400">Status:</span> {data.status}</div>
              <div><span className="text-gray-400">Attempt:</span> {data.attemptNumber}</div>
              <div><span className="text-gray-400">Submitted:</span> {data.submittedAt ? new Date(data.submittedAt).toLocaleString() : "-"}</div>
              <div><span className="text-gray-400">Graded:</span> {data.gradedAt ? new Date(data.gradedAt).toLocaleString() : "-"}</div>
            </div>
          </div>

          {/* Answers */}
     <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-4 mb-6">
  <h2 className="text-white font-semibold mb-3">Answers</h2>
  {Array.isArray(data.answers) && data.answers.length > 0 ? (
    <ul className="space-y-4">
      {data.answers.map((ans: any, idx: number) => {
        // ✅ Look up question text by questionIndex from populated assessment
        const question = assessment?.questions?.[ans.questionIndex];
        return (
          <li key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
            <p className="text-xs text-gray-500 mb-1">
              Question {ans.questionIndex + 1}
              {question?.type && (
                <span className="ml-2 capitalize px-1.5 py-0.5 bg-slate-700 rounded text-gray-400">
                  {question.type.replace(/_/g, " ")}
                </span>
              )}
              {question?.points && (
                <span className="ml-2 text-lime-500/70">{question.points} pts</span>
              )}
            </p>
            {/* Question text */}
            <p className="text-gray-200 font-medium mb-2">
              {question?.questionText ?? `Question ${ans.questionIndex + 1}`}
            </p>
            {/* Student answer */}
            <div className="flex items-start gap-2">
              <span className="text-gray-500 text-sm shrink-0">Answer:</span>
              <span className={`text-sm ${
                ans.isCorrect === true ? "text-emerald-400" :
                ans.isCorrect === false ? "text-red-400" :
                "text-gray-300"
              }`}>
                {Array.isArray(ans.answer) ? ans.answer.join(", ") : String(ans.answer ?? "-")}
              </span>
              {/* Auto-grade result badge */}
              {ans.isCorrect !== undefined && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${
                  ans.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}>
                  {ans.isCorrect ? `✓ +${ans.pointsEarned}pts` : "✗ Incorrect"}
                </span>
              )}
            </div>
            {/* Correct answer hint for instructor (if auto-graded wrong) */}
            {ans.isCorrect === false && question?.correctAnswer && (
              <p className="text-xs text-gray-500 mt-1">
                Correct: <span className="text-emerald-400/70">
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
    <p className="text-gray-400 text-sm">No answers submitted.</p>
  )}
</div>

          {/* Grade */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-4">
            <h2 className="text-white font-semibold mb-3">Grade</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Score</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400"
                  placeholder="Enter score"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Feedback (optional)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400"
                  rows={3}
                  placeholder="Feedback for the student"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={onGrade}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? "Saving..." : "Save Grade"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}