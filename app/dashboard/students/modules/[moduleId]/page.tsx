"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { studentService } from "@/services/studentService";
import { lessonService } from "@/services/lessonService"; // ✅ ADD THIS
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  AlertCircle,
  FileText,
  Code,
  Video,
  PenTool,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ModuleLessonsPage() {
  const params = useParams<{ moduleId: string }>();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingLesson, setStartingLesson] = useState<string | null>(null);

  const moduleId = params.moduleId;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "student") {
      router.replace("/auth/login");
      return;
    }
    if (moduleId) {
      load();
    }
  }, [authLoading, isAuthenticated, user?.role, moduleId]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await studentService.getModuleLessons(moduleId);

      if (res.success) {
        setData(res.data);
      } else {
        const errorMsg = res.error || "Failed to load lessons";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error loading module lessons:", err);
      setError("An unexpected error occurred");
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Use lessonService instead of studentService
  const handleStartLesson = async (lessonId: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    setStartingLesson(lessonId);
    try {
      // ✅ Use lessonService.startLesson
      const res = await lessonService.startLesson(lessonId);
      
      if (res.success) {
        toast.success("Lesson started! 🚀");
        // Navigate to lesson after starting
        router.push(`/dashboard/students/lessons/${lessonId}`);
      } else {
        toast.error(res.error || "Failed to start lesson");
      }
    } catch (error: any) {
      console.error('Error starting lesson:', error);
      
      // Better error message from response
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          "Failed to start lesson";
      toast.error(errorMessage);
    } finally {
      setStartingLesson(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <StudentSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading lessons...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <StudentSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-2">
              Failed to load lessons
            </p>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button
              onClick={() => router.back()}
              className="bg-[#EFB14A] hover:bg-[#EFB14A]/90"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const module = data.module;
  const lessons = data.lessons || [];
  const courseId = (module?.course as any)?._id;

  const stats = {
    total: lessons.length,
    completed: lessons.filter((l: any) => l.progress?.status === "completed").length,
    inProgress: lessons.filter((l: any) => l.progress?.status === "in_progress").length,
  };

  const completionPercentage = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "reading":
        return FileText;
      case "coding":
        return Code;
      case "assignment":
        return PenTool;
      default:
        return BookOpen;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-lime-400";
      case "in_progress":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <StudentSidebar />

      <div className="flex-1 ml-64 p-6">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/dashboard/students/courses/${courseId}`}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-gray-300 transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {module?.title || "Module"}
              </h1>
              <p className="text-gray-400 text-sm">
                {module?.description || "Module lessons"}
              </p>
            </div>
          </div>

          {/* Module Info Card */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Module Progress</span>
                <span className="text-sm font-semibold text-lime-400">
                  {completionPercentage}%
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 border border-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={16} className="text-lime-400" />
                  <p className="text-gray-400 text-sm">Total</p>
                </div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>

              <div className="bg-slate-800/50 border border-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={16} className="text-lime-400" />
                  <p className="text-gray-400 text-sm">Completed</p>
                </div>
                <p className="text-2xl font-bold text-lime-400">{stats.completed}</p>
              </div>

              <div className="bg-slate-800/50 border border-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Play size={16} className="text-yellow-400" />
                  <p className="text-gray-400 text-sm">In Progress</p>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
              </div>
            </div>
          </div>
        </header>

        {/* LESSONS LIST */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Lessons</h2>

          {lessons.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen size={64} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No lessons available
                </h3>
                <p className="text-gray-400">
                  This module doesn't have any lessons yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson: any, idx: number) => {
                const status = lesson.progress?.status || "not_started";
                const isCompleted = status === "completed";
                const isInProgress = status === "in_progress";
                const isLocked = lesson.isRequired && idx > 0 && 
                  lessons[idx - 1]?.progress?.status !== "completed";
                const isStarting = startingLesson === lesson._id;

                const LessonIcon = getLessonIcon(lesson.type);

                return (
                  <div
                    key={lesson._id}
                    className={`flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 border border-gray-700/50 hover:border-lime-400/30 px-5 py-4 rounded-xl transition-all group ${
                      isLocked ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Status Icon */}
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-lime-500/20"
                            : isInProgress
                            ? "bg-yellow-500/20"
                            : "bg-slate-700"
                        }`}
                      >
                        {isLocked ? (
                          <Lock size={20} className="text-gray-500" />
                        ) : isCompleted ? (
                          <CheckCircle2 size={20} className="text-lime-400" />
                        ) : (
                          <Play size={20} className={getStatusColor(status)} />
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold group-hover:text-lime-400 transition-colors">
                            {lesson.title}
                          </h3>
                          {lesson.isRequired && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                              Required
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <LessonIcon size={14} />
                            <span className="capitalize">{lesson.type}</span>
                          </span>

                          {lesson.estimatedMinutes && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {lesson.estimatedMinutes}min
                              </span>
                            </>
                          )}

                          <span>•</span>
                          <span className="capitalize">
                            {status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT - Action Button */}
                    <div className="shrink-0 ml-4">
                      {isLocked ? (
                        <span className="text-gray-500 text-sm">Locked</span>
                      ) : isCompleted ? (
                        <Link
                          href={`/dashboard/students/lessons/${lesson._id}`}
                          className="px-4 py-2 bg-lime-500/20 hover:bg-lime-500/30 border border-lime-500/30 rounded-lg text-lime-400 text-sm font-semibold transition-all"
                        >
                          ✓ Review
                        </Link>
                      ) : isInProgress ? (
                        <Link
                          href={`/dashboard/students/lessons/${lesson._id}`}
                          className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-semibold transition-all"
                        >
                          Continue →
                        </Link>
                      ) : (
                        <button
                          onClick={(e) => handleStartLesson(lesson._id, e)}
                          disabled={isStarting}
                          className="px-4 py-2 bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-400 rounded-lg text-white text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isStarting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Starting...</span>
                            </>
                          ) : (
                            <>
                              <Play size={14} className="fill-current" />
                              <span>Start Learning</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}