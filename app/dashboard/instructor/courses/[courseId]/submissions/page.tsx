"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useAuth } from "@/lib/context/AuthContext";
import { assessmentService } from "@/services/assessmentService";
import { submissionService } from "@/services/submissionService";
import {
  FileText,
  Layers,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Eye,
  BookOpen,
} from "lucide-react";

/** Types */
type SubmissionRow = {
  _id: string;
  studentId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email?: string;
      };
  status: "draft" | "submitted" | "graded" | "late";
  score?: number;
  percentage?: number;
  attemptNumber: number;
  submittedAt?: string;
  gradedAt?: string;
};

type AssessmentRow = {
  _id: string;
  title: string;
  type: string;
  endDate?: string;
  isPublished?: boolean;
  order?: number;
  updatedAt?: string;
};

/** Per-assessment client state */
type AssessmentPanelState = {
  open: boolean;
  loading: boolean;
  error?: string | null;
  // submissions list
  rows: SubmissionRow[];
  page: number;
  pages: number;
  total: number;
  limit: number;
  status: "all" | "submitted" | "graded" | "late";
  // summary counts (lazy computed)
  counts?: {
    total: number;
    submitted: number;
    graded: number;
    late: number;
    lastSubmittedAt?: string | null;
  };
};

export default function CourseSubmissionsByAssessmentPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const courseId = params.courseId;

  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [panels, setPanels] = useState<Record<string, AssessmentPanelState>>({});
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const isInstructor = user?.role === "instructor";

  /** Load assessments for this course */
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !isInstructor) {
      router.push("/dashboard");
      return;
    }
    (async () => {
      setLoading(true);
      setPageError(null);
      try {
        const res = await assessmentService.getByCourse(courseId);
        // assessmentService.getByCourse returns { success, data: [] }
        const list: AssessmentRow[] = Array.isArray(res?.data) ? res.data : [];
        // Sort by order, fallback updatedAt desc
        list.sort((a, b) => {
          if (a.order != null && b.order != null) return a.order - b.order;
          const ta = new Date(a.updatedAt || 0).getTime();
          const tb = new Date(b.updatedAt || 0).getTime();
          return tb - ta;
        });
        setAssessments(list);
        // seed panels map
        const map: Record<string, AssessmentPanelState> = {};
        list.forEach((a) => {
          map[a._id] = {
            open: false,
            loading: false,
            error: null,
            rows: [],
            page: 1,
            pages: 1,
            total: 0,
            limit: 10,
            status: "all",
            counts: undefined,
          };
        });
        setPanels(map);
      } catch (err: any) {
        setPageError(err?.message || "Failed to load assessments for this course.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, isInstructor, courseId]);

  /** Toggle expand/collapse and lazy-load panel data */
  const onTogglePanel = async (assessmentId: string) => {
    const panel = panels[assessmentId];
    if (!panel) return;

    // Toggle first
    const nextOpen = !panel.open;
    setPanels((prev) => ({ ...prev, [assessmentId]: { ...prev[assessmentId], open: nextOpen } }));

    if (nextOpen) {
      // If opening: fetch submissions (page 1 + current status) & counts if missing
      await ensureSubmissions(assessmentId, 1, panel.status);
      if (!panel.counts) {
        await ensureCounts(assessmentId);
      }
    }
  };

  /** Fetch submissions for an assessment */
  const ensureSubmissions = async (
    assessmentId: string,
    page: number,
    status: AssessmentPanelState["status"]
  ) => {
    setPanels((prev) => ({
      ...prev,
      [assessmentId]: { ...prev[assessmentId], loading: true, error: null },
    }));
    try {
      const params: any = { page, limit: panels[assessmentId]?.limit || 10 };
      if (status !== "all") params.status = status;

      const res = await submissionService.getSubmissionsByAssessment(assessmentId, params);
      setPanels((prev) => ({
        ...prev,
        [assessmentId]: {
          ...prev[assessmentId],
          loading: false,
          rows: res.data || [],
          page: res.page || page,
          pages: res.pages || 1,
          total: res.total || (res.data?.length ?? 0),
          status,
        },
      }));
    } catch (err: any) {
      setPanels((prev) => ({
        ...prev,
        [assessmentId]: {
          ...prev[assessmentId],
          loading: false,
          error: err?.message || "Failed to load submissions",
        },
      }));
    }
  };

  /** Fetch counts (total, submitted, graded, late) lazily */
  const ensureCounts = async (assessmentId: string) => {
    try {
      const [allRes, submittedRes, gradedRes, lateRes] = await Promise.all([
        submissionService.getSubmissionsByAssessment(assessmentId, { page: 1, limit: 1 }),
        submissionService.getSubmissionsByAssessment(assessmentId, { page: 1, limit: 1, status: "submitted" }),
        submissionService.getSubmissionsByAssessment(assessmentId, { page: 1, limit: 1, status: "graded" }),
        submissionService.getSubmissionsByAssessment(assessmentId, { page: 1, limit: 1, status: "late" }),
      ]);

      const lastSubmittedAt =
        (allRes?.data && allRes.data[0]?.submittedAt) ? allRes.data[0].submittedAt : null;

      setPanels((prev) => ({
        ...prev,
        [assessmentId]: {
          ...prev[assessmentId],
          counts: {
            total: allRes?.total ?? 0,
            submitted: submittedRes?.total ?? 0,
            graded: gradedRes?.total ?? 0,
            late: lateRes?.total ?? 0,
            lastSubmittedAt,
          },
        },
      }));
    } catch {
      // Silent; counts optional
    }
  };

  /** Change page/status handlers */
  const onChangeStatus = async (assessmentId: string, status: AssessmentPanelState["status"]) => {
    await ensureSubmissions(assessmentId, 1, status);
  };
  const onChangePage = async (assessmentId: string, page: number) => {
    const curr = panels[assessmentId];
    await ensureSubmissions(assessmentId, page, curr?.status || "all");
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

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      <InstructorSidebar />
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="text-emerald-400" size={28} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Course Submissions
                </h1>
                <p className="text-gray-400 text-sm">
                  Course ID: <span className="text-gray-300">{courseId}</span>
                </p>
              </div>
            </div>
            <div>
              <button
                onClick={() => router.refresh()}
                className="px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white hover:bg-slate-700 flex items-center gap-2"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </div>

          {/* Page error */}
          {pageError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{pageError}</p>
            </div>
          )}

          {/* Assessments list */}
          <div className="space-y-4">
            {assessments.length === 0 ? (
              <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-6 text-gray-400">
                No assessments found for this course.
              </div>
            ) : (
              assessments.map((a) => {
                const p = panels[a._id];
                return (
                  <div key={a._id} className="bg-slate-800/50 border border-gray-700 rounded-xl overflow-hidden">
                    {/* Row header */}
                    <button
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-800/70 transition-colors"
                      onClick={() => onTogglePanel(a._id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                          <FileText className="text-emerald-400" size={18} />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{a.title}</p>
                          <p className="text-gray-400 text-xs">
                            Type: <span className="capitalize">{a.type}</span>
                            {a.endDate ? (
                              <>
                                {" "}
                                • Due: {new Date(a.endDate).toLocaleDateString()}
                              </>
                            ) : null}
                            {a.order != null ? <> • Order: {a.order}</> : null}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Summary counts if available */}
                        {p?.counts && (
                          <div className="hidden sm:flex items-center gap-4 text-xs">
                            <SummaryPill label="Total" value={p.counts.total} />
                            <SummaryPill label="Submitted" value={p.counts.submitted} />
                            <SummaryPill label="Graded" value={p.counts.graded} />
                            <SummaryPill label="Late" value={p.counts.late} />
                            <span className="text-gray-500">
                              {p.counts.lastSubmittedAt
                                ? `Last: ${new Date(p.counts.lastSubmittedAt).toLocaleString()}`
                                : "No submissions"}
                            </span>
                          </div>
                        )}

                        {p?.open ? (
                          <ChevronDown className="text-gray-400" size={18} />
                        ) : (
                          <ChevronRight className="text-gray-400" size={18} />
                        )}
                      </div>
                    </button>

                    {/* Panel content */}
                    {p?.open && (
                      <div className="p-4 border-t border-gray-700">
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Filter size={14} />
                            <span className="text-sm">Status</span>
                            <select
                              value={p.status}
                              onChange={(e) => onChangeStatus(a._id, e.target.value as any)}
                              className="px-3 py-2 bg-slate-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400"
                            >
                              <option value="all">All</option>
                              <option value="submitted">Submitted</option>
                              <option value="graded">Graded</option>
                              <option value="late">Late</option>
                            </select>
                          </div>
                          {/* (Optional) Local search bar – client-side filter if needed */}
                          {/* 
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input className="w-full md:w-72 pl-10 pr-3 py-2 bg-slate-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-400" placeholder="Search student..." />
                          </div> 
                          */}
                        </div>

                        {/* Error */}
                        {p.error && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                            <p className="text-red-400 text-sm">{p.error}</p>
                          </div>
                        )}

                        {/* Table */}
                        <div className="bg-slate-900/40 border border-gray-700 rounded-lg overflow-hidden">
                          {p.loading ? (
                            <div className="p-8 flex items-center justify-center">
                              <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : p.rows.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">No submissions yet.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-slate-700/50 border-b border-gray-700">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Attempt</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Submitted</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                  {p.rows.map((r) => {
                                    const student = r.studentId as any;
                                    return (
                                      <tr key={r._id} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3 text-white">
                                          {student?.firstName} {student?.lastName}
                                          {student?.email && (
                                            <span className="block text-xs text-gray-400">{student.email}</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{r.attemptNumber}</td>
                                        <td className="px-4 py-3">
                                          <StatusBadge status={r.status} />
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">
                                          {typeof r.score === "number" ? `${r.score}` : "-"}
                                          {typeof r.percentage === "number" && (
                                            <span className="text-xs text-gray-500"> ({r.percentage}%)</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">
                                          {r.submittedAt
                                            ? new Date(r.submittedAt).toLocaleString()
                                            : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <Link
                                            href={`/dashboard/instructor/submissions/${r._id}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white"
                                          >
                                            <Eye size={14} /> View / Grade
                                          </Link>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Pagination */}
                          {p.pages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between text-sm text-gray-400">
                              <span>
                                Page {p.page} of {p.pages} • {p.total} submissions
                              </span>
                              <div className="flex gap-2">
                                <button
                                  disabled={p.page === 1 || p.loading}
                                  onClick={() => onChangePage(a._id, Math.max(1, p.page - 1))}
                                  className="px-3 py-1.5 bg-slate-700 rounded-lg text-white disabled:opacity-50"
                                >
                                  Prev
                                </button>
                                <button
                                  disabled={p.page === p.pages || p.loading}
                                  onClick={() => onChangePage(a._id, Math.min(p.pages, p.page + 1))}
                                  className="px-3 py-1.5 bg-slate-700 rounded-lg text-white disabled:opacity-50"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/** Small UI helpers */
function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700/60 text-gray-200 border border-gray-600 text-xs">
      {label}: <strong className="text-white">{value}</strong>
    </span>
  );
}

function StatusBadge({ status }: { status: SubmissionRow["status"] }) {
  const map: Record<string, string> = {
    graded: "bg-green-500/20 text-green-400 border-green-500/30",
    late: "bg-red-500/20 text-red-400 border-red-500/30",
    submitted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    draft: "bg-slate-600/20 text-gray-300 border-slate-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${map[status] || "bg-slate-600/20 text-gray-300 border-slate-500/30"}`}>
      {status}
    </span>
  );
}