"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { instructorService } from "@/services/instructorService";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { StudentProgress } from "@/types";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  MessageSquare,
  Github,
  Linkedin,
  FileText,
  Video,
  Download,
  BarChart3,
  AlertCircle,
} from "lucide-react";



export default function StudentProgressPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // CRITICAL: use() must be called first, before any other hooks
  const { id: studentId } = use(params);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY - BEFORE ANY EARLY RETURNS
  const [studentData, setStudentData] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "lessons" | "assessments">("overview");

  useEffect(() => {
    // Early returns inside useEffect are fine
    if (authLoading) return;
    
    if (!isAuthenticated || user?.role !== "instructor") {
      router.push("/dashboard");
      return;
    }

    if (!courseId) {
      setError("Course ID is required");
      setLoading(false);
      return;
    }

    fetchStudentProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role, studentId, courseId]);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching progress for student:', studentId, 'course:', courseId);
      const response = await instructorService.getStudentProgress(studentId, courseId!);
      console.log('Progress response:', response);
      
      if (response.success && response.data) {
        setStudentData(response.data);
      } else {
        setError(response.error || "Failed to fetch student progress");
      }
    } catch (err: any) {
      console.error("Failed to fetch student progress:", err);
      setError(err.message || "An error occurred while fetching student progress");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "dropped":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex overflow-hidden">
        <InstructorSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading student progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-slate-900 flex overflow-hidden">
        <InstructorSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-2">Failed to load student data</p>
            <p className="text-gray-500 mb-4">{error || "Student not found"}</p>
            <Link
              href="/dashboard/instructor/students"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Students
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { student, course, progress, modules, assessments, stats } = studentData;

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      <InstructorSidebar />
      <div className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Link
              href="/dashboard/instructor/students"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Students</span>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {student.firstName?.[0]}
                  {student.lastName?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {student.firstName} {student.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-gray-400 text-sm flex items-center gap-1 truncate">
                      <Mail size={14} />
                      {student.email}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(student.status)}`}>
                      {student.status?.charAt(0).toUpperCase() + student.status?.slice(1) || 'N/A'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 flex items-center gap-1 truncate">
                    <BookOpen size={14} className="shrink-0" />
                    <span className="truncate">{course.title}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={fetchStudentProgress}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-gray-700 transition-colors text-sm"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors text-sm">
                  <MessageSquare size={16} />
                  <span className="hidden sm:inline">Message</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-purple-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {progress.overallProgress}%
              </p>
              <p className="text-xs text-gray-400">Overall Progress</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-green-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {progress.completedLessons}/{progress.totalLessons}
              </p>
              <p className="text-xs text-gray-400">Lessons Done</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-blue-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {formatTime(stats.totalTimeSpent )}
              </p>
              <p className="text-xs text-gray-400">Time Spent</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="text-yellow-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {stats.averageScore ? `${stats.averageScore}%` : "N/A"}
              </p>
              <p className="text-xs text-gray-400">Avg Score</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="text-emerald-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {stats.streak || 0}
              </p>
              <p className="text-xs text-gray-400">Day Streak</p>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Student Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Enrollment Date</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  {formatDate(student.enrollmentDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Last Active</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  {formatDate(stats.lastActiveDate)}
                </p>
              </div>
              {student.studentProfile?.cohort && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Cohort</p>
                  <p className="text-white font-medium">{student.studentProfile.cohort}</p>
                </div>
              )}
              {student.studentProfile?.githubProfile && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">GitHub</p>
                  <a
                    href={student.studentProfile.githubProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-2"
                  >
                    <Github size={16} />
                    View Profile
                  </a>
                </div>
              )}
              {student.studentProfile?.linkedinProfile && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">LinkedIn</p>
                  <a
                    href={student.studentProfile.linkedinProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-2"
                  >
                    <Linkedin size={16} />
                    View Profile
                  </a>
                </div>
              )}
            </div>
            {student.studentProfile?.bio && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Bio</p>
                <p className="text-white text-sm">{student.studentProfile.bio}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden mb-6">
            <div className="flex border-b border-gray-700 overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <BarChart3 size={16} className="inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("lessons")}
                className={`px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "lessons"
                    ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Video size={16} className="inline mr-2" />
                Lessons Progress
              </button>
              <button
                onClick={() => setActiveTab("assessments")}
                className={`px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "assessments"
                    ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText size={16} className="inline mr-2" />
                Assessments
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Progress Overview</h3>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">Course Completion</span>
                        <span className="text-white font-bold text-lg">
                          {progress.overallProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all ${getProgressColor(progress.overallProgress)}`}
                          style={{ width: `${progress.overallProgress}%` }}
                        />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Completed</p>
                          <p className="text-white font-semibold">
                            {progress.completedLessons} lessons
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Remaining</p>
                          <p className="text-white font-semibold">
                            {progress.totalLessons - progress.completedLessons} lessons
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="text-green-400 shrink-0" size={20} />
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm">Last Active</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {formatDate(stats.lastActiveDate)} at{" "}
                              {new Date(stats.lastActiveDate).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Clock className="text-blue-400 shrink-0" size={20} />
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm">Total Time Invested</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {formatTime(stats.totalTimeSpent)} spent learning
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lessons Tab */}
              {activeTab === "lessons" && (
                <div className="space-y-4">
                  {modules && modules.length > 0 ? (
                    modules.map((module) => (
                      <div key={module._id} className="bg-slate-700/30 rounded-lg p-4">
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                          <BookOpen size={18} className="text-emerald-400" />
                          Module {module.order}: {module.title}
                        </h3>
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson._id}
                              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {lesson.isCompleted ? (
                                  <CheckCircle className="text-green-400 shrink-0" size={18} />
                                ) : (
                                  <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-600 shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-white text-sm font-medium truncate">
                                    {lesson.title}
                                  </p>
                                  {lesson.completedAt && (
                                    <p className="text-gray-400 text-xs mt-0.5">
                                      Completed {formatDate(lesson.completedAt)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {lesson.duration && (
                                <span className="text-gray-400 text-xs whitespace-nowrap ml-2">
                                  {lesson.duration} min
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Video size={48} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No lesson data available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Assessments Tab */}
              {activeTab === "assessments" && (
                <div className="space-y-4">
                  {assessments && assessments.length > 0 ? (
                    assessments.map((assessment) => (
                      <div key={assessment._id} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white font-bold flex items-center gap-2">
                              <FileText size={18} className="text-emerald-400 shrink-0" />
                              <span className="truncate">{assessment.title}</span>
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">
                              Type: {assessment.type}
                              {assessment.dueDate && ` • Due: ${formatDate(assessment.dueDate)}`}
                            </p>
                          </div>
                          {assessment.submission && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                                assessment.submission.status === "graded"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : assessment.submission.status === "late"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              }`}
                            >
                              {assessment.submission.status.charAt(0).toUpperCase() +
                                assessment.submission.status.slice(1)}
                            </span>
                          )}
                        </div>
                        {assessment.submission ? (
                          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Submitted</span>
                              <span className="text-white">
                                {formatDate(assessment.submission.submittedAt)}
                              </span>
                            </div>
                            {assessment.submission.score !== undefined && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Score</span>
                                <span className="text-white font-bold">
                                  {assessment.submission.score}%
                                </span>
                              </div>
                            )}
                            {assessment.submission.feedback && (
                              <div className="pt-2 border-t border-gray-700">
                                <p className="text-gray-400 text-xs mb-1">Feedback</p>
                                <p className="text-white text-sm">
                                  {assessment.submission.feedback}
                                </p>
                              </div>
                            )}
                            {assessment.submission.status === "submitted" && (
                              <button className="w-full mt-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors">
                                Grade Submission
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                            <XCircle className="text-gray-600 mx-auto mb-2" size={24} />
                            <p className="text-gray-400 text-sm">Not submitted yet</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText size={48} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No assessments available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}