"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { studentService } from "@/services/studentService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProgramCoursesPage() {
  const params = useParams<{ programId: string }>();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("order");

  const programId = params.programId;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "student") {
      router.replace("/auth/login");
      return;
    }
    if (programId) {
      load();
    }
  }, [authLoading, isAuthenticated, user?.role, programId]);

const load = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('=== LOADING PROGRAM COURSES ===');
    console.log('Program ID:', programId);
    
    const res = await studentService.getProgramCourses(programId);
    
    console.log('Full Response:', res);
    console.log('Response Success:', res.success);
    console.log('Response Data:', res.data);
    console.log('Program:', res.data?.program);
    console.log('Courses Array:', res.data?.courses);
    console.log('Courses Length:', res.data?.courses?.length);
    console.log('First Course:', res.data?.courses?.[0]);
    
    if (res.success) {
      setData(res.data);
    } else {
      const errorMsg = res.error || "Failed to load program courses";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  } catch (err) {
    console.error("Error loading program courses:", err);
    setError("An unexpected error occurred");
    toast.error("Failed to load program courses");
  } finally {
    setLoading(false);
  }
};

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <StudentSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  const program = data?.program;
  let courses = data?.courses || [];

  // Sorting logic
  if (sort === "order") {
    courses = [...courses].sort((a, b) => (a.course?.order || 0) - (b.course?.order || 0));
  } else if (sort === "progress") {
    courses = [...courses].sort(
      (a, b) => (b.progress?.overallProgress || 0) - (a.progress?.overallProgress || 0)
    );
  } else if (sort === "alpha") {
    courses = [...courses].sort((a, b) =>
      (a.course?.title || "").localeCompare(b.course?.title || "")
    );
  }

  const enrolledStats = {
    totalCourses: courses.length,
    completed: courses.filter((c: any) => c.enrollmentStatus === "completed").length,
    inProgress: courses.filter((c: any) => c.enrollmentStatus === "active").length,
    pending: courses.filter((c: any) => c.enrollmentStatus === "pending").length,
  };

  const overallProgress =
    enrolledStats.totalCourses > 0
      ? Math.round(
          (courses.reduce((sum: number, c: any) => sum + (c.progress?.overallProgress || 0), 0) /
            enrolledStats.totalCourses)
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <StudentSidebar />

      <div className="flex-1 ml-64 p-6">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/students"
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-gray-300 transition"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {program?.title || "Program Courses"}
                </h1>
                <p className="text-gray-400 text-sm">Your program courses</p>
              </div>
            </div>

            <button
              onClick={load}
              disabled={loading}
              className="p-2 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
              title="Refresh courses"
            >
              <RefreshCw size={20} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <div>
                <p className="text-red-400 font-medium">Error loading courses</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Program Info Card */}
          {program && !error && (
            <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-6 mb-6">
              <p className="text-gray-300 mb-4">{program.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Overall Program Progress</span>
                  <span className="text-sm font-semibold text-lime-400">{overallProgress}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard
                  label="Total Courses"
                  value={enrolledStats.totalCourses}
                  icon={BookOpen}
                />
                <InfoCard
                  label="Completed"
                  value={enrolledStats.completed}
                  color="lime"
                  icon={CheckCircle2}
                />
                <InfoCard
                  label="In Progress"
                  value={enrolledStats.inProgress}
                  color="yellow"
                  icon={TrendingUp}
                />
                <InfoCard
                  label="Pending"
                  value={enrolledStats.pending}
                  color="gray"
                  icon={Clock}
                />
              </div>
            </div>
          )}

          {/* Sorting */}
          {courses.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-gray-400 text-sm">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              >
                <option value="order">Course Order</option>
                <option value="progress">Progress</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>
          )}
        </header>

        {/* COURSE LIST */}
        {!error && courses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No courses available</h3>
              <p className="text-gray-400">This program doesn't have any courses yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((c: any) => {
              const course = c.course;
              const progress = c.progress?.overallProgress ?? 0;
              const completedLessons = c.lessonsCompleted || 0;
              const totalLessons = c.totalLessons || 0;
              const status = c.enrollmentStatus || "pending";

              if (!course) return null;

              return (
                <Card
                  key={course._id}
                  className="bg-slate-800/40 border border-gray-700 hover:border-lime-400/40 transition-all"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-white font-semibold text-lg flex-1 line-clamp-2">
                        {course.title}
                      </h3>
                      {status === "completed" ? (
                        <CheckCircle2 className="text-lime-400 shrink-0" size={20} />
                      ) : (
                        <BookOpen className="text-gray-400 shrink-0" size={20} />
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {course.description || "No description available"}
                    </p>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <BookOpen size={16} className="shrink-0" />
                        <span>
                          {completedLessons}/{totalLessons} lessons
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock size={16} className="shrink-0" />
                        <span>{course.estimatedHours || 0} hours</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs font-semibold text-lime-400">{progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          status === "completed"
                            ? "bg-lime-500/20 text-lime-400"
                            : status === "active"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Link href={`/dashboard/students/courses/${course._id}`}>
                      <Button className="w-full bg-[#EFB14A] hover:bg-[#EFB14A]/90" size="sm">
                        {progress >= 100 ? "Review Course" : "Continue"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  color = "white",
  icon: Icon,
}: {
  label: string;
  value: any;
  color?: "white" | "lime" | "yellow" | "gray";
  icon?: any;
}) {
  const colorMap = {
    white: "text-white",
    lime: "text-lime-400",
    yellow: "text-yellow-400",
    gray: "text-gray-400",
  };

  return (
    <div className="bg-slate-800/50 border border-gray-700 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={16} className={colorMap[color]} />}
        <p className="text-gray-400 text-sm">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}