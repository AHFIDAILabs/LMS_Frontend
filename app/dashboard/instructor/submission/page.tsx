"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useAuth } from "@/lib/context/AuthContext";
import { submissionService } from "@/services/submissionService";
import { FileText, RefreshCw, Search, Filter, Eye } from "lucide-react";

type Row = {
  _id: string;
  studentId: { _id: string; firstName: string; lastName: string; email?: string } | string;
  status: "draft" | "submitted" | "graded" | "late";
  score?: number;
  percentage?: number;
  attemptNumber: number;
  submittedAt?: string;
  gradedAt?: string;
};

export default function AssessmentSubmissionsPage() {
  const router = useRouter();
  const params = useParams<{ assessmentId: string }>();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const assessmentId = params.assessmentId;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "instructor") {
      router.push("/dashboard");
      return;
    }
    void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role, assessmentId, page, status]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side filter by student name/email (if provided)
    // You can also move this back-end with a `search` param if supported
    const s = search.toLowerCase();
    const filtered = rows.filter((r) => {
      const student = r.studentId as any;
      const name = `${student?.firstName || ""} ${student?.lastName || ""}`.toLowerCase();
      const email = (student?.email || "").toLowerCase();
      return name.includes(s) || email.includes(s);
    });
    setRows(filtered);
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
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-emerald-400" size={28} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Assessment Submissions</h1>
                <p className="text-gray-400 text-sm">Assessment ID: {assessmentId}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchRows()}
                className="px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white hover:bg-slate-700 flex items-center gap-2"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </header>

          {/* Filters */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-4 mb-4">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student name or email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                />
              </div>
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
                  className="w-full px-4 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                >
                  <option value="all">All</option>
                  <option value="submitted">Submitted</option>
                  <option value="graded">Graded</option>
                  <option value="late">Late</option>
                </select>
              </div>
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

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl overflow-hidden">
            {rows.length === 0 ? (
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
                    {rows.map((r) => {
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
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs border ${
                                r.status === "graded"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : r.status === "late"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            {typeof r.score === "number" ? `${r.score}` : "-"}
                            {typeof r.percentage === "number" && <span className="text-xs text-gray-500"> ({r.percentage}%)</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "-"}
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
