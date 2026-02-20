"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useAuth } from "@/lib/context/AuthContext";
import { submissionService } from "@/services/submissionService";
import { assessmentService } from "@/services/assessmentService";
import {
  FileText, RefreshCw, Search, Filter,
  Eye, ArrowLeft, Paperclip, AlertCircle, X,
} from "lucide-react";

const MONGO_ID_RE = /^[a-f\d]{24}$/i;

type Row = {
  _id: string;
  studentId: { _id: string; firstName: string; lastName: string; email?: string } | string;
  status: "draft" | "submitted" | "graded" | "late";
  score?: number;
  percentage?: number;
  attemptNumber: number;
  submittedAt?: string;
  gradedAt?: string;
  attachments?: string[];
};

type Summary = { total: number; submitted: number; graded: number; late: number };

export default function AssessmentSubmissionsPage() {
  const router = useRouter();

  // ✅ Folder is named [assessmentId], so Next.js exposes params.assessmentId
  // Path: /dashboard/instructor/assessments/[id]/submissions/page.tsx
  const params = useParams<{ assessmentId: string }>();
  const assessmentId = params.assessmentId;

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const isValidId = Boolean(
    assessmentId &&
    assessmentId !== "undefined" &&
    assessmentId !== "null" &&
    MONGO_ID_RE.test(assessmentId)
  );

  const [assessment, setAssessment] = useState<any>(null);
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  // Client-side search on top of server-paged rows
  const rows = useMemo(() => {
    if (!search.trim()) return allRows;
    const s = search.toLowerCase();
    return allRows.filter((r) => {
      const student = r.studentId as any;
      const name = `${student?.firstName || ""} ${student?.lastName || ""}`.toLowerCase();
      const email = (student?.email || "").toLowerCase();
      return name.includes(s) || email.includes(s);
    });
  }, [allRows, search]);

  const courseId = useMemo(() => {
    if (!assessment?.courseId) return null;
    return typeof assessment.courseId === "string"
      ? assessment.courseId
      : assessment.courseId?._id;
  }, [assessment]);

  const fetchAssessmentMeta = useCallback(async () => {
    if (!isValidId) return;
    try {
      const res = await assessmentService.getById(assessmentId);
      if (res?.success && res.data) setAssessment(res.data);
    } catch {}
  }, [assessmentId, isValidId]);

  const fetchRows = useCallback(async () => {
    if (!isValidId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await submissionService.getSubmissionsByAssessment(assessmentId, {
        page,
        limit,
        status: status === "all" ? undefined : status,
      });
      if (res.success) {
        setAllRows(res.data || []);
        setTotal(res.total ?? res.data?.length ?? 0);
      } else {
        setError(res.error || "Failed to load submissions");
        setAllRows([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load submissions");
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  }, [assessmentId, isValidId, page, status]);

  const fetchSummary = useCallback(async () => {
    if (!isValidId) return;
    try {
      const [allRes, submittedRes, gradedRes, lateRes] = await Promise.all([
        submissionService.getSubmissionsByAssessment(assessmentId, { page: 1, limit: 1 }),
        submissionService.getSubmissionsByAssessment(assessmentId, { page: 1, limit: 1, status: "submitted" }),
        submissionService.getSubmissionsByAssessment(assessmentId, { page: 1, limit: 1, status: "graded" }),
        submissionService.getSubmissionsByAssessment(assessmentId, { page: 1, limit: 1, status: "late" }),
      ]);
      setSummary({
        total: allRes?.total ?? 0,
        submitted: submittedRes?.total ?? 0,
        graded: gradedRes?.total ?? 0,
        late: lateRes?.total ?? 0,
      });
    } catch {}
  }, [assessmentId, isValidId]);

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
    fetchAssessmentMeta();
    fetchRows();
    fetchSummary();
  }, [authLoading, isAuthenticated, user?.role, isValidId, fetchAssessmentMeta, fetchRows, fetchSummary]);

  const statusBadgeClass = (s: Row["status"]) => ({
    graded:    "bg-green-500/20 text-green-400 border-green-500/30",
    late:      "bg-red-500/20 text-red-400 border-red-500/30",
    submitted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    draft:     "bg-slate-600/20 text-gray-300 border-slate-500/30",
  }[s] ?? "bg-slate-600/20 text-gray-300 border-slate-500/30");

  // ── Invalid ID ──────────────────────────────────────────────────────────────
  if (!authLoading && !isValidId) {
    return (
      <div className="min-h-screen bg-slate-900 flex overflow-hidden">
        <InstructorSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Invalid Assessment ID</p>
            <p className="text-gray-400 text-sm mb-5">
              Navigate here by clicking "Submissions" on an assessment in the Assessments list.
            </p>
            <Link
              href="/dashboard/instructor/assessments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium"
            >
              <ArrowLeft size={15} /> Go to Assessments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
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

  // ── Page ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      <InstructorSidebar />
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="text-emerald-400 shrink-0" size={28} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {assessment?.title ?? "Submissions"}
                </h1>
                <p className="text-gray-500 text-xs mt-0.5 font-mono">{assessmentId}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard/instructor/assessments"
                className="px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-slate-700 flex items-center gap-2 text-sm"
              >
                <ArrowLeft size={16} /> Assessments
              </Link>
              {courseId && MONGO_ID_RE.test(courseId) && (
                <Link
                  href={`/dashboard/instructor/courses/${courseId}/submissions`}
                  className="px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-slate-700 flex items-center gap-2 text-sm"
                >
                  Course Submissions
                </Link>
              )}
              <button
                onClick={() => { fetchRows(); fetchSummary(); }}
                className="px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white hover:bg-slate-700 flex items-center gap-2 text-sm"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </header>

          {/* Summary */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total",     value: summary.total,     color: "text-white" },
                { label: "Submitted", value: summary.submitted, color: "text-yellow-400" },
                { label: "Graded",    value: summary.graded,    color: "text-green-400" },
                { label: "Late",      value: summary.late,      color: "text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-800/50 rounded-xl border border-gray-700 p-4">
                  <p className="text-gray-400 text-xs mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student name or email"
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-sm"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-500 shrink-0" />
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="flex-1 px-3 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 text-sm"
                >
                  <option value="all">All ({summary?.total ?? 0})</option>
                  <option value="submitted">Submitted ({summary?.submitted ?? 0})</option>
                  <option value="graded">Graded ({summary?.graded ?? 0})</option>
                  <option value="late">Late ({summary?.late ?? 0})</option>
                </select>
              </div>
              <div className="flex items-center justify-end text-sm text-gray-400">
                {search ? `${rows.length} of ${allRows.length} shown` : `${total} total`}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center justify-between">
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={() => setError(null)}><X size={14} className="text-red-400" /></button>
            </div>
          )}

          {/* Table */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl overflow-hidden">
            {rows.length === 0 ? (
              <div className="p-12 text-center">
                <FileText size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  {search ? `No submissions match "${search}"` : "No submissions yet for this assessment."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50 border-b border-gray-700">
                    <tr>
                      {["Student", "Attempt", "Status", "Score", "Submitted", "Attachments", "Actions"].map((h) => (
                        <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {rows.map((r) => {
                      const student = r.studentId as any;
                      return (
                        <tr key={r._id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-white text-sm font-medium">
                              {student?.firstName} {student?.lastName}
                            </p>
                            {student?.email && (
                              <p className="text-gray-500 text-xs">{student.email}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-300 text-sm">#{r.attemptNumber}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${statusBadgeClass(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {typeof r.score === "number" ? (
                              <>
                                <span className="text-white font-semibold">{r.score}</span>
                                {typeof r.percentage === "number" && (
                                  <span className="text-gray-500 text-xs ml-1">({r.percentage}%)</span>
                                )}
                              </>
                            ) : <span className="text-gray-500">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-sm">
                            {r.submittedAt
                              ? new Date(r.submittedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {Array.isArray(r.attachments) && r.attachments.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-gray-300 text-sm">
                                <Paperclip size={13} /> {r.attachments.length}
                              </span>
                            ) : <span className="text-gray-500 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/dashboard/instructor/submissions/${r._id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Eye size={13} />
                              {r.status === "graded" ? "Review" : "Grade"}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between text-sm text-gray-400">
                <span>Page {page} of {pages} · {total} total</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page === pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}