"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useAuth } from "@/lib/context/AuthContext";
import { instructorService } from "@/services/instructorService";
import { InstructorStudent } from "@/types";
import {
  Users,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  Mail,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  GraduationCap,
  Filter,
  Layers,
} from "lucide-react";
import Link from "next/link";

function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function InstructorStudentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [students, setStudents] = useState<InstructorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounced(searchQuery, 450);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const itemsPerPage = 10;

  // Server-returned aggregate stats (not derived from current page slice)
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    averageProgress: 0,
  });

  // =========================================
  // Core fetch — wrapped in useCallback so it
  // can be called directly from multiple effects
  // without stale-closure issues.
  // =========================================
  const fetchStudents = useCallback(
    async (page = currentPage, status = selectedStatus, search = debouncedSearch) => {
      if (!isAuthenticated || user?.role !== "instructor") return;

      try {
        setLoading(true);
        setError(null);

        const params: Record<string, any> = {
          page,
          limit: itemsPerPage,
        };

        if (status !== "all") params.status = status;
        if (search.trim()) params.search = search.trim();

        const response = await instructorService.getStudents(params);
        console.log("all instructor students", response);
        
        if (response?.success && Array.isArray(response.data)) {
          const uniqueStudents = removeDuplicates(response.data);
          setStudents(uniqueStudents);

          const pages = response.pages ?? 1;
          const total =
            typeof response.total === "number"
              ? response.total
              : typeof response.count === "number"
              ? response.count
              : uniqueStudents.length;

          setTotalPages(pages);
          setTotalStudents(total);

          // Use server-side aggregates when available, else derive from page data
          if (response.stats) {
            setStats({
              totalStudents: response.stats.total ?? total,
              activeStudents: response.stats.active ?? 0,
              completedStudents: response.stats.completed ?? 0,
              averageProgress: response.stats.averageProgress ?? 0,
            });
          } else {
            calculateStats(uniqueStudents, total);
          }
        } else {
          setStudents([]);
          setTotalPages(1);
          setTotalStudents(0);
          setStats({ totalStudents: 0, activeStudents: 0, completedStudents: 0, averageProgress: 0 });
          setError(response?.error || "Failed to fetch students");
        }
      } catch (err: any) {
        console.error("Failed to fetch students:", err);
        setError(err.message || "An error occurred while fetching students");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, user?.role, currentPage, selectedStatus, debouncedSearch]
  );

  // =========================================
  // Auth gate + initial load
  // =========================================
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "instructor") {
      router.push("/dashboard");
      return;
    }
    fetchStudents(1, selectedStatus, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role]);

  // =========================================
  // Status filter change → reset to page 1 + fetch
  // =========================================
  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "instructor") return;
    setCurrentPage(1);
    fetchStudents(1, selectedStatus, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  // =========================================
  // Debounced search change → reset to page 1 + fetch
  // =========================================
  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "instructor") return;
    setCurrentPage(1);
    fetchStudents(1, selectedStatus, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // =========================================
  // Pagination change → fetch (keep filters)
  // =========================================
  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "instructor") return;
    fetchStudents(currentPage, selectedStatus, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Remove duplicates defensively
  const removeDuplicates = (data: InstructorStudent[]) => {
    const seen = new Set<string>();
    return data.filter((s) => {
      if (!s?._id || seen.has(s._id)) return false;
      seen.add(s._id);
      return true;
    });
  };

  // Derive stats from current page when server doesn't supply them
  const calculateStats = (data: InstructorStudent[], total: number) => {
    const pageCount = data.length;
    const active = data.filter((s) => s.status === "active").length;
    const completed = data.filter((s) => s.status === "completed").length;
    const avgProgress =
      pageCount > 0
        ? data.reduce((sum, s) => sum + (s.progress?.overallProgress || 0), 0) / pageCount
        : 0;

    setStats({
      totalStudents: total,
      activeStudents: active,
      completedStudents: completed,
      averageProgress: Math.round(avgProgress),
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "dropped": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const filteredStudents = useMemo(() => students, [students]);

  const handleExportCSV = () => {
    if (!filteredStudents.length) return;

    const csvData = filteredStudents.map((student) => ({
      Name: `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim(),
      Email: student.email ?? "",
      Courses: student.courses?.map((c: any) => c.title).join("; ") || "N/A",
      Status: student.status,
      Progress: `${student.progress?.overallProgress || 0}%`,
      "Lessons Completed": `${student.progress?.completedLessons || 0}/${student.progress?.totalLessons || 0}`,
      "Enrollment Date": formatDate(String(student.enrollmentDate)),
      "Last Active": student.progress?.lastAccessedAt
        ? formatDate(String(student.progress.lastAccessedAt))
        : "N/A",
      Cohort: student.studentProfile?.cohort || "N/A",
    }));

    const header = Object.keys(csvData[0]).join(",");
    const rows = csvData
      .map((row) =>
        Object.values(row)
          .map((val) => {
            const v = String(val ?? "");
            return v.includes(",") ? `"${v.replace(/"/g, '""')}"` : v;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([[header, rows].join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      <div className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <Users className="text-emerald-400" size={28} />
                  My Students
                </h1>
                <p className="text-gray-400 mt-1 text-sm sm:text-base">
                  Track and manage student progress across your courses
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => fetchStudents(currentPage, selectedStatus, debouncedSearch)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-gray-700 transition-colors text-sm"
                >
                  <RefreshCw size={16} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={filteredStudents.length === 0}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            {[
              { label: "Total Students", value: totalStudents, icon: <GraduationCap className="text-blue-400" size={20} />, bg: "bg-blue-500/20" },
              { label: "Active", value: stats.activeStudents, icon: <CheckCircle className="text-green-400" size={20} />, bg: "bg-green-500/20" },
              { label: "Completed", value: stats.completedStudents, icon: <Award className="text-emerald-400" size={20} />, bg: "bg-emerald-500/20" },
              { label: "Avg Progress", value: `${stats.averageProgress}%`, icon: <TrendingUp className="text-purple-400" size={20} />, bg: "bg-purple-500/20" },
            ].map(({ label, value, icon, bg }) => (
              <div key={label} className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">{label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${bg} flex items-center justify-center shrink-0 ml-2`}>
                    {icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-gray-700 transition-colors mb-4"
          >
            <Filter size={18} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {/* Filters */}
          <div className={`bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4 sm:p-6 mb-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Search Students</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or course..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Students Table */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50 border-b border-gray-700">
                  <tr>
                    {["Student", "Courses", "Progress", "Status", "Cohort", "Enrolled", "Last Active", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <tr key={`${student._id}-${index}`} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                              {(student.firstName?.[0] || "").toUpperCase()}
                              {(student.lastName?.[0] || "").toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm truncate">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-gray-400 text-xs flex items-center gap-1 truncate">
                                <Mail size={10} />
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2 min-w-0">
                            <Layers size={14} className="text-gray-500 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              {student.courses?.length > 0 ? (
                                <div className="space-y-1">
                                  {student.courses.slice(0, 2).map((course: any, idx: number) => (
                                    <p key={`${course.id}-${idx}`} className="text-gray-300 text-xs truncate">
                                      {course.title}
                                    </p>
                                  ))}
                                  {student.courses.length > 2 && (
                                    <p className="text-gray-500 text-xs">+{student.courses.length - 2} more</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500 text-xs">No courses</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="space-y-1 min-w-[120px]">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-400">
                                {student.progress?.completedLessons || 0}/{student.progress?.totalLessons || 0}
                              </span>
                              <span className="text-white font-semibold ml-2">
                                {student.progress?.overallProgress || 0}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all ${getProgressColor(student.progress?.overallProgress || 0)}`}
                                style={{ width: `${student.progress?.overallProgress || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(student.status)}`}>
                            {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-gray-300 text-sm">{student.studentProfile?.cohort || "-"}</span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-gray-400 text-xs whitespace-nowrap">
                            <Calendar size={12} />
                            {formatDate(String(student.enrollmentDate))}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-gray-400 text-xs whitespace-nowrap">
                            <Clock size={12} />
                            {student.progress?.lastAccessedAt
                              ? formatDate(String(student.progress.lastAccessedAt))
                              : "Never"}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          {student.courses?.length > 0 ? (
                            <Link
                              href={`/dashboard/instructor/students/${student._id}/progress?courseId=${student.courses[0].id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                            >
                              <Eye size={12} />
                              View
                            </Link>
                          ) : (
                            <span className="text-gray-500 text-xs">No courses</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Users size={48} className="text-gray-600 mb-3" />
                          <p className="text-gray-400 text-lg">No students found</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {debouncedSearch || selectedStatus !== "all"
                              ? "Try adjusting your search or filters"
                              : "Students will appear here when they enroll in your courses"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <div key={`${student._id}-mobile-${index}`} className="p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold shrink-0">
                        {(student.firstName?.[0] || "").toUpperCase()}
                        {(student.lastName?.[0] || "").toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm">{student.firstName} {student.lastName}</p>
                        <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5 truncate">
                          <Mail size={10} />
                          {student.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(student.status)}`}>
                            {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : "N/A"}
                          </span>
                          {student.studentProfile?.cohort && (
                            <span className="text-gray-400 text-xs">{student.studentProfile.cohort}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Layers size={14} className="text-gray-500" />
                        <span className="text-gray-400 text-xs font-medium">Courses:</span>
                      </div>
                      {student.courses?.length > 0 ? (
                        <div className="space-y-1 ml-5">
                          {student.courses.map((course: any, idx: number) => (
                            <p key={`${course.id}-mobile-${idx}`} className="text-gray-300 text-xs truncate">• {course.title}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs ml-5">No courses enrolled</p>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-400">
                          {student.progress?.completedLessons || 0}/{student.progress?.totalLessons || 0} lessons
                        </span>
                        <span className="text-white font-semibold">{student.progress?.overallProgress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${getProgressColor(student.progress?.overallProgress || 0)}`}
                          style={{ width: `${student.progress?.overallProgress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>Enrolled: {formatDate(String(student.enrollmentDate))}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{student.progress?.lastAccessedAt ? formatDate(String(student.progress.lastAccessedAt)) : "Never"}</span>
                      </div>
                    </div>

                    {student.courses?.length > 0 ? (
                      <Link
                        href={`/dashboard/instructor/students/${student._id}/progress?courseId=${student.courses[0].id}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye size={14} />
                        View Progress
                      </Link>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/30 text-gray-500 rounded-lg text-sm">
                        No courses to view
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Users size={48} className="text-gray-600 mb-3" />
                    <p className="text-gray-400 text-lg">No students found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {debouncedSearch || selectedStatus !== "all"
                        ? "Try adjusting your search or filters"
                        : "Students will appear here when they enroll in your courses"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalStudents)} of {totalStudents} students
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Prev
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                            currentPage === pageNum
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-700 hover:bg-slate-600 text-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}