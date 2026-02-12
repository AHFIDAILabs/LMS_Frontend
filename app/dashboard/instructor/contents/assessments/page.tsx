"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useAuth } from "@/lib/context/AuthContext";
import { assessmentService } from "@/services/assessmentService";
import { FileText, Plus, RefreshCw, Search } from "lucide-react";

export default function AssessmentsListPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "instructor") {
      router.push("/dashboard");
      return;
    }
    void fetchAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role, page, search]);

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit };
      if (search.trim()) params.search = search.trim();

      const res = await assessmentService.admin.getAll(params);
      const rows = Array.isArray(res?.data) ? res.data : res?.data || [];
      setAssessments(rows);
      setTotal(res?.count || res?.count || rows.length);
    } catch (err: any) {
      setError(err?.message || "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const onTogglePublish = async (id: string) => {
    try {
      await assessmentService.admin.togglePublish(id);
      await fetchAssessments();
    } catch (err: any) {
      setError(err?.message || "Failed to toggle publish");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await assessmentService.admin.delete(id);
      await fetchAssessments();
    } catch (err: any) {
      setError(err?.message || "Failed to delete assessment");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      <InstructorSidebar />
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-emerald-400" size={28} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Assessments</h1>
                <p className="text-gray-400 text-sm">Manage quizzes, assignments, projects, and caps</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchAssessments()}
                className="px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white hover:bg-slate-700 flex items-center gap-2"
              >
                <RefreshCw size={16} /> Refresh
              </button>
              <Link
                href="/dashboard/instructor/assessments/create"
                className="px-3 py-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500 flex items-center gap-2"
              >
                <Plus size={16} /> Create
              </Link>
            </div>
          </header>

          {/* Search */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search assessments..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : assessments.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No assessments found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Published</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {assessments.map((a) => (
                      <tr key={a._id} className="hover:bg-slate-700/30">
                        <td className="px-4 py-3 text-white">{a.title}</td>
                        <td className="px-4 py-3 text-gray-300">{a.type}</td>
                        <td className="px-4 py-3 text-gray-300">{a.order ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-300">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs border ${
                              a.isPublished
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-slate-700/50 text-gray-300 border-gray-600/50"
                            }`}
                          >
                            {a.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <Link
                              href={`/dashboard/instructor/assessments/${a._id}/edit`}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => onTogglePublish(a._id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white"
                            >
                              {a.isPublished ? "Unpublish" : "Publish"}
                            </button>
                            <button
                              onClick={() => onDelete(a._id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
