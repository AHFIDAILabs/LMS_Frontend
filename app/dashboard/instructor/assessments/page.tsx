"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useAuth } from "@/lib/context/AuthContext";
import { assessmentService } from "@/services/assessmentService";
import { IAssessment } from "@/types/assessments";
import Link from "next/link";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Filter,
  Calendar,
  Award,
  RefreshCw,
} from "lucide-react";

export default function InstructorAssessmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [assessments, setAssessments] = useState<IAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    unpublished: 0,
    quizzes: 0,
    assignments: 0,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "instructor") {
      router.push("/dashboard");
      return;
    }

    fetchAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await assessmentService.admin.getAll();
      console.log("Assessments response:", response);

      if (response.success && response.data) {
        setAssessments(response.data);
        calculateStats(response.data);
      } else {
        setError("Failed to fetch assessments");
      }
    } catch (err: any) {
      console.error("Failed to fetch assessments:", err);
      setError(err.message || "An error occurred while fetching assessments");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: IAssessment[]) => {
    setStats({
      total: data.length,
      published: data.filter((a) => a.isPublished).length,
      unpublished: data.filter((a) => !a.isPublished).length,
      quizzes: data.filter((a) => a.type === "quiz").length,
      assignments: data.filter((a) => a.type === "assignment").length,
    });
  };

  const handleTogglePublish = async (assessmentId: string) => {
    try {
      const response = await assessmentService.admin.togglePublish(assessmentId);
      if (response.success) {
        fetchAssessments();
      }
    } catch (err: any) {
      console.error("Failed to toggle publish:", err);
      alert(err.message || "Failed to update assessment");
    }
  };

  const handleDelete = async (assessmentId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const response = await assessmentService.admin.delete(assessmentId);
      if (response.success) {
        fetchAssessments();
      }
    } catch (err: any) {
      console.error("Failed to delete assessment:", err);
      alert(err.message || "Failed to delete assessment");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "quiz":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "assignment":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "project":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "capstone":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchLower) ||
      assessment.description?.toLowerCase().includes(searchLower);

    const matchesType =
      selectedType === "all" || assessment.type === selectedType;

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "published" && assessment.isPublished) ||
      (selectedStatus === "unpublished" && !assessment.isPublished);

    return matchesSearch && matchesType && matchesStatus;
  });

  const paginatedAssessments = filteredAssessments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);

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
                  <FileText className="text-emerald-400" size={28} />
                  Assessments
                </h1>
                <p className="text-gray-400 mt-1 text-sm sm:text-base">
                  Create and manage quizzes, assignments, and projects
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={fetchAssessments}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-gray-700 transition-colors text-sm"
                >
                  <RefreshCw size={16} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <Link
                  href="/dashboard/instructor/assessments/create"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Create</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="text-gray-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.total}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-green-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.published}</p>
              <p className="text-xs text-gray-400">Published</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="text-yellow-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.unpublished}</p>
              <p className="text-xs text-gray-400">Draft</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-blue-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.quizzes}</p>
              <p className="text-xs text-gray-400">Quizzes</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="text-purple-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.assignments}</p>
              <p className="text-xs text-gray-400">Assignments</p>
            </div>
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
          <div
            className={`bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4 sm:p-6 mb-6 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Search Assessments
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or description..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="capstone">Capstone</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Assessments List */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-700">
              {paginatedAssessments.length > 0 ? (
                paginatedAssessments.map((assessment) => (
                  <div
                    key={assessment._id}
                    className="p-4 sm:p-6 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <FileText className="text-emerald-400 shrink-0 mt-1" size={20} />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">
                              {assessment.title}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {assessment.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3 ml-8">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeColor(
                              assessment.type
                            )}`}
                          >
                            {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                          </span>
                          
                          {assessment.isPublished ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                              Published
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              Draft
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <Award size={12} />
                            {assessment.totalPoints} pts
                          </span>

                          <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock size={12} />
                            {assessment.duration || "No"} mins
                          </span>

                          {assessment.endDate && (
                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                              <Calendar size={12} />
                              Due: {formatDate(assessment.endDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Link
                          href={`/dashboard/instructor/assessments/${assessment._id}`}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </Link>

                        <Link
                          href={`/dashboard/instructor/assessments/${assessment._id}/edit`}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                        >
                          <Edit size={14} />
                          Edit
                        </Link>

                        <button
                          onClick={() => handleTogglePublish(assessment._id)}
                          className="flex items-center gap-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-colors"
                        >
                          {assessment.isPublished ? (
                            <ToggleRight size={14} />
                          ) : (
                            <ToggleLeft size={14} />
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(assessment._id, assessment.title)}
                          className="flex items-center gap-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <FileText size={48} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-lg">No assessments found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchQuery || selectedType !== "all" || selectedStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Create your first assessment to get started"}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                <p className="text-xs sm:text-sm text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredAssessments.length)} of{" "}
                  {filteredAssessments.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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