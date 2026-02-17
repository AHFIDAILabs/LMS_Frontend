"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useAuth } from "@/lib/context/AuthContext";
import { submissionService } from "@/services/submissionService";
import { assessmentService } from "@/services/assessmentService";

import {
  FileText,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ArrowLeft,
  Paperclip
} from "lucide-react";

/* ------------------------------- Types ------------------------------- */
type Row = {
  _id: string;
  studentId:
    | { _id: string; firstName: string; lastName: string; email?: string }
    | string;
  status: "draft" | "submitted" | "graded" | "late";
  score?: number;
  percentage?: number;
  attemptNumber: number;
  submittedAt?: string;
  gradedAt?: string;
  attachments?: string[];
};

type SummaryCounts = {
  total: number;
  submitted: number;
  graded: number;
  late: number;
  lastSubmittedAt?: string | null;
};

/* ------------------------------- Page ------------------------------- */
export default function AssessmentSubmissionsPage() {
  const router = useRouter();
  const params = useParams<{ assessmentId: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const assessmentId = params.assessmentId;

  const [assessment, setAssessment] = useState<any>(null);
  const [courseId, setCourseId] = useState<string | null>(null);

  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<SummaryCounts | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  /* ---------------------- Fetch Assessment Meta ---------------------- */
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await assessmentService.getById(assessmentId);
        if (res?.data) {
          setAssessment(res.data);

          const cid =
            typeof res.data.courseId === "string"
              ? res.data.courseId
              : res.data.courseId?._id;

          setCourseId(cid || null);
        }
      } catch {}
    };
    fetchMeta();
  }, [assessmentId]);

  /* ------------------------ Auth + load rows -------------------------- */
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== "instructor") {
      router.push("/dashboard");
      return;
    }

    fetchRows();
    fetchSummary();
  }, [authLoading, isAuthenticated, user?.role, assessmentId, page, status]);

  /* ---------------------- Load submissions list ---------------------- */
  const fetchRows = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await submissionService.getSubmissionsByAssessment(assessmentId, {
        page,
        limit,
        status: status === "all" ? undefined : status,
      });

      setRows(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err?.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- Load summary counts ------------------------ */
  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const [allRes, submittedRes, gradedRes, lateRes] = await Promise.all([
        submissionService.getSubmissionsByAssessment(assessmentId, {
          page: 1,
          limit: 1,
        }),
        submissionService.getSubmissionsByAssessment(assessmentId, {
          page: 1,
          limit: 1,
          status: "submitted",
        }),
        submissionService.getSubmissionsByAssessment(assessmentId, {
          page: 1,
          limit: 1,
          status: "graded",
        }),
        submissionService.getSubmissionsByAssessment(assessmentId, {
          page: 1,
          limit: 1,
          status: "late",
        }),
      ]);

      setSummary({
        total: allRes?.total ?? 0,
        submitted: submittedRes?.total ?? 0,
        graded: gradedRes?.total ?? 0,
        late: lateRes?.total ?? 0,
        lastSubmittedAt:
          allRes?.data?.[0]?.submittedAt ?? null,
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  /* ---------------------------- Search ------------------------------- */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const s = search.toLowerCase();

    const filtered = rows.filter((r) => {
      const student = r.studentId as any;
      const name = `${student?.firstName || ""} ${student?.lastName || ""}`.toLowerCase();
      const email = (student?.email || "").toLowerCase();
      return name.includes(s) || email.includes(s);
    });

    setRows(filtered);
  };

  /* ---------------------------- Badges ------------------------------- */
  const StatusBadge = ({ status }: { status: Row["status"] }) => {
    const colors: Record<string, string> = {
      graded: "bg-green-500/20 text-green-400 border-green-500/30",
      late: "bg-red-500/20 text-red-400 border-red-500/30",
      submitted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      draft: "bg-slate-600/20 text-gray-300 border-slate-500/30",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  /* --------------------------- Loading UI ---------------------------- */
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

  /* ============================= Page ================================ */
  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      <InstructorSidebar />

      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">

          {/* HEADER */}
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-emerald-400" size={28} />

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Assessment Submissions
                </h1>

                <p className="text-gray-400 text-sm">
                  Assessment ID: {assessmentId}
                </p>

                {assessment?.title && (
                  <p className="text-xs text-gray-500">{assessment.title}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">

              {/* Back to Course Submissions */}
              {courseId && (
                <Link
                  href={`/dashboard/instructor/courses/${courseId}/submissions`}
                  className="px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-slate-700 flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Course Submissions
                </Link>
              )}

              <button
                onClick={() => {
                  fetchRows();
                  fetchSummary();
                }}
                className="px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white hover:bg-slate-700 flex items-center gap-2"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </header>

          {/* SUMMARY COUNTS */}
          {!loadingSummary && summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <SummaryCard label="Total" value={summary.total} />
              <SummaryCard label="Submitted" value={summary.submitted} color="yellow" />
              <SummaryCard label="Graded" value={summary.graded} color="green" />
              <SummaryCard label="Late" value={summary.late} color="red" />
              <SummaryCard
                label="Last Submission"
                value={
                  summary.lastSubmittedAt
                    ? new Date(summary.lastSubmittedAt).toLocaleString()
                    : "N/A"
                }
              />
            </div>
          )}

          {/* FILTERS */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-4 mb-4">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3">

              {/* SEARCH */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student name or email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* STATUS FILTER */}
              <div>
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Filter size={14} />
                  <span className="text-sm">Status</span>
                </div>

                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 text-sm"
                >
                  <option value="all">All ({summary?.total ?? 0})</option>
                  <option value="submitted">Submitted ({summary?.submitted ?? 0})</option>
                  <option value="graded">Graded ({summary?.graded ?? 0})</option>
                  <option value="late">Late ({summary?.late ?? 0})</option>
                </select>
              </div>

              {/* APPLY */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* TABLE */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl overflow-hidden">
            {rows.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No submissions yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50 border-b border-gray-700">
                    <tr>
                      <Th label="Student" />
                      <Th label="Attempt" />
                      <Th label="Status" />
                      <Th label="Score" />
                      <Th label="Submitted" />
                      <Th label="Attachments" />
                      <Th label="Actions" right />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-700">
                    {rows.map((r) => {
                      const student = r.studentId as any;
                      return (
                        <tr key={r._id} className="hover:bg-slate-700/30">
                          {/* Student */}
                          <Td>
                            <div className="text-white">
                              {student?.firstName} {student?.lastName}
                            </div>
                            {student?.email && (
                              <div className="text-xs text-gray-400">
                                {student.email}
                              </div>
                            )}
                          </Td>

                          {/* Attempt */}
                          <Td>{r.attemptNumber}</Td>

                          {/* Status */}
                          <Td>
                            <StatusBadge status={r.status} />
                          </Td>

                          {/* Score */}
                          <Td>
                            {typeof r.score === "number"
                              ? `${r.score}`
                              : "-"}
                            {typeof r.percentage === "number" && (
                              <span className="text-xs text-gray-500">
                                {" "}
                                ({r.percentage}%)
                              </span>
                            )}
                          </Td>

                          {/* Submitted */}
                          <Td>
                            {r.submittedAt
                              ? new Date(r.submittedAt).toLocaleString()
                              : "-"}
                          </Td>

                          {/* Attachments */}
                          <Td>
                            {Array.isArray(r.attachments) &&
                            r.attachments.length > 0 ? (
                              <div className="inline-flex items-center gap-1 text-gray-300">
                                <Paperclip size={14} />
                                {r.attachments.length}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">
                                —
                              </span>
                            )}
                          </Td>

                          {/* Actions */}
                          <Td right>
                            <Link
                              href={`/dashboard/instructor/submission/${r._id}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white"
                            >
                              <Eye size={14} /> View / Grade
                            </Link>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION */}
            {pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between text-sm text-gray-400">
                <span>
                  Page {page} of {pages}
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-slate-700 rounded-lg text-white disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <button
                    disabled={page === pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    className="px-3 py-1.5 bg-slate-700 rounded-lg text-white disabled:opacity-50"
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

/* ---------------------------- UI Helpers ---------------------------- */

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: "green" | "yellow" | "red";
}) {
  const colors: any = {
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-gray-700 p-4">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`text-lg font-bold ${color ? colors[color] : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function Th({ label, right }: { label: string; right?: boolean }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider ${
        right ? "text-right" : "text-left"
      }`}
    >
      {label}
    </th>
  );
}

function Td({ children, right }: { children: any; right?: boolean }) {
  return (
    <td className={`px-4 py-3 ${right ? "text-right" : "text-left"} text-gray-300`}>
      {children}
    </td>
  );
}