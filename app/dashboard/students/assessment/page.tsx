"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { assessmentService } from "@/services/assessmentService";
import { 
  FileText, Clock, Calendar, Target, CheckCircle2, 
  AlertCircle, Loader2, Filter, Search, BookOpen,
  ClipboardList, FileQuestion, BookCheck
} from "lucide-react";
import toast from "react-hot-toast";

type AssessmentType = 'quiz' | 'assignment' | 'project' | 'capstone' | 'all';
type StatusFilter = 'all' | 'pending' | 'submitted' | 'graded';

export default function AssessmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssessmentType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "student") {
      router.replace("/auth/login");
      return;
    }
    void loadAssessments();
  }, [authLoading, isAuthenticated, user?.role]);

  const loadAssessments = async () => {
    setLoading(true);
    const res = await assessmentService.getPublished();
    if (res.success) {
      setAssessments(res.data || []);
    } else {
      toast.error(res.message || "Failed to load assessments");
    }
    setLoading(false);
  };

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    // Search filter
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assessment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === 'all' || assessment.type === typeFilter;
    
    // Status filter based on submission
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      // No submission or submission is draft
      matchesStatus = !assessment.latestSubmission || assessment.latestSubmission.status === 'draft';
    } else if (statusFilter === 'submitted') {
      // Submitted but not graded
      matchesStatus = assessment.latestSubmission?.status === 'submitted';
    } else if (statusFilter === 'graded') {
      // Graded
      matchesStatus = assessment.latestSubmission?.status === 'graded';
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Statistics
  const stats = {
    total: assessments.length,
    pending: assessments.filter(a => !a.latestSubmission || a.latestSubmission.status === 'draft').length,
    submitted: assessments.filter(a => a.latestSubmission?.status === 'submitted').length,
    graded: assessments.filter(a => a.latestSubmission?.status === 'graded').length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <StudentSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      <StudentSidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Animated background effects */}
        <div className="fixed inset-0 ml-64 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Assignments & Assessments
            </h1>
            <p className="text-gray-400 text-lg">
              Track and manage all your coursework in one place
            </p>
          </header>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={ClipboardList}
              label="Total"
              value={stats.total}
              color="from-purple-500 to-purple-600"
              iconBg="bg-purple-500/10"
              iconColor="text-purple-400"
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={stats.pending}
              color="from-yellow-500 to-yellow-600"
              iconBg="bg-yellow-500/10"
              iconColor="text-yellow-400"
            />
            <StatCard
              icon={FileText}
              label="Submitted"
              value={stats.submitted}
              color="from-blue-500 to-blue-600"
              iconBg="bg-blue-500/10"
              iconColor="text-blue-400"
            />
            <StatCard
              icon={CheckCircle2}
              label="Graded"
              value={stats.graded}
              color="from-emerald-500 to-emerald-600"
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-400"
            />
          </div>

          {/* Filters & Search */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments, lessons, or courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as AssessmentType)}
                  className="px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="quiz">Quizzes</option>
                  <option value="assignment">Assignments</option>
                  <option value="project">Projects</option>
                  <option value="capstone">Capstones</option>
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>

          {/* Assessments List */}
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-2xl flex items-center justify-center">
                <FileQuestion size={40} className="text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? "No assessments match your filters" 
                  : "No assessments yet"}
              </h3>
              <p className="text-gray-500">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                  ? "Try adjusting your search or filters"
                  : "Assessments will appear here once published"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssessments.map((assessment, index) => (
                <AssessmentCard
                  key={assessment._id}
                  assessment={assessment}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, iconBg, iconColor }: any) {
  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center gap-4">
        <div className={`p-3 ${iconBg} rounded-xl`}>
          <Icon size={24} className={iconColor} />
        </div>
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Assessment Card Component
function AssessmentCard({ assessment, index }: any) {
  const submission = assessment.latestSubmission;
  const isSubmitted = submission && submission.status !== 'draft';
  const isGraded = submission?.status === 'graded';
  const isPastDue = assessment.endDate && new Date(assessment.endDate) < new Date();
  const isPassed = isGraded && submission?.percentage >= assessment.passingScore;

  const typeConfig = {
    quiz: { icon: FileQuestion, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    assignment: { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    project: { icon: BookCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    capstone: { icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  };

  const config = typeConfig[assessment.type as keyof typeof typeConfig] || typeConfig.assignment;
  const TypeIcon = config.icon;

  return (
    <Link
      href={`/dashboard/students/assessment/${assessment._id}`}
      className="block opacity-0 animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      <div className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-lime-500/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Icon & Content */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`p-3 ${config.bg} rounded-xl shrink-0 group-hover:scale-110 transition-transform`}>
              <TypeIcon size={24} className={config.color} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Course Info */}
              {(assessment.courseId?.title || assessment.moduleId?.title) && (
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {assessment.courseId?.title && (
                    <span className="text-xs text-gray-500">
                      {assessment.courseId.title}
                    </span>
                  )}
                  {assessment.moduleId?.title && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs text-gray-400">
                        {assessment.moduleId.title}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-lime-400 transition-colors line-clamp-2">
                {assessment.title}
              </h3>

              {/* Meta Info */}
              <div className="flex items-center gap-4 flex-wrap text-sm">
                <span className="capitalize text-gray-400">{assessment.type}</span>
                
                {assessment.passingScore && (
                  <>
                    <span className="text-gray-600">•</span>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Target size={14} />
                      <span>Pass: {assessment.passingScore}%</span>
                    </div>
                  </>
                )}
                
                {assessment.duration && (
                  <>
                    <span className="text-gray-600">•</span>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock size={14} />
                      <span>{assessment.duration} min</span>
                    </div>
                  </>
                )}

                {assessment.endDate && (
                  <>
                    <span className="text-gray-600">•</span>
                    <div className={`flex items-center gap-1.5 ${isPastDue && !isSubmitted ? 'text-red-400' : 'text-gray-400'}`}>
                      <Calendar size={14} />
                      <span>Due {new Date(assessment.endDate).toLocaleDateString()}</span>
                    </div>
                  </>
                )}

                {submission?.attemptNumber && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">Attempt {submission.attemptNumber}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Status */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {/* Status Badge */}
            {!isSubmitted && (
              <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">
                  Not Started
                </span>
              </div>
            )}
            {isSubmitted && !isGraded && (
              <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <span className="text-blue-400 text-xs font-semibold uppercase tracking-wide">
                  Submitted
                </span>
              </div>
            )}
            {isGraded && (
              <div className="space-y-2">
                <div className={`px-3 py-1.5 rounded-lg ${
                  isPassed 
                    ? 'bg-emerald-500/10 border border-emerald-500/20' 
                    : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${
                    isPassed ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {isPassed ? 'Passed' : 'Failed'}
                  </span>
                </div>
                {submission.percentage !== undefined && (
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${
                      isPassed ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {submission.percentage}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Past Due Warning */}
            {isPastDue && !isSubmitted && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle size={12} className="text-red-400" />
                <span className="text-red-400 text-xs font-semibold">Overdue</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}