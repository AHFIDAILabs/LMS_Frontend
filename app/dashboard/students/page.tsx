"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { studentService } from "@/services/studentService";

import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CircularProgress } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";

import {
  Award,
  BookOpen,
  Clock,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StudentDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== "student") {
      router.replace("/auth/login");
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data in parallel
      const [programsRes, coursesRes, overviewRes] = await Promise.allSettled([
        studentService.getEnrolledPrograms(),
        studentService.getEnrolledCourses(),
        studentService.getDashboardOverview(),
      ]);

      // Programs
      if (programsRes.status === "fulfilled" && (programsRes.value as any)?.success) {
        setPrograms((programsRes.value as any).data || []);
      } else {
        console.error(
          "Failed to load programs:",
          programsRes.status === "fulfilled" ? (programsRes.value as any).error : programsRes.reason
        );
        setPrograms([]);
      }

      // Courses
      if (coursesRes.status === "fulfilled" && (coursesRes.value as any)?.success) {
        setCourses((coursesRes.value as any).data || []);
      } else {
        console.error(
          "Failed to load courses:",
          coursesRes.status === "fulfilled" ? (coursesRes.value as any).error : coursesRes.reason
        );
        setCourses([]);
      }

      // Overview
      if (overviewRes.status === "fulfilled" && (overviewRes.value as any)?.success) {
        setOverview((overviewRes.value as any).data);
      } else {
        console.error(
          "Failed to load overview:",
          overviewRes.status === "fulfilled" ? (overviewRes.value as any).error : overviewRes.reason
        );
      }

      // If all failed
      const allFailed = [programsRes, coursesRes, overviewRes].every(
        (res) => res.status === "rejected" || (res.status === "fulfilled" && !(res as any).value?.success)
      );

      if (allFailed) {
        setError("Failed to load dashboard data. Please try again.");
        toast.error("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex overflow-x-hidden">
        <StudentSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center min-w-0">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  const overallProgress = overview?.courses?.overallProgress ?? 0;

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-x-hidden">
      <StudentSidebar />

      <div className="flex-1 w-full lg:ml-64 px-4 sm:px-6 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-800/70 backdrop-blur border-b border-gray-800">
          <div className="p-4 flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-gray-400 truncate">
                Welcome back, {user?.firstName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
                title="Refresh dashboard"
              >
                <RefreshCw size={18} className="text-gray-400" />
              </button>

              <Link
                href="/profile"
                className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded-lg transition"
              >
                <Avatar
                  src={user?.profileImage}
                  firstName={user?.firstName}
                  lastName={user?.lastName}
                  size="sm"
                  isOnline
                />
                <span className="text-white text-sm font-medium hidden md:block truncate">
                  {user?.firstName}
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="py-8 space-y-8">
          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <BarChart3 className="text-red-400" size={20} />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Welcome */}
          <section className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-slate-800 to-slate-950 p-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 blur-[140px]" />
            <div className="relative flex items-center justify-between gap-6 min-w-0">
              <div className="min-w-0">
                <h2 className="text-3xl font-bold text-white mb-2 truncate">
                  Keep going, {user?.firstName}!
                </h2>
                <p className="text-gray-400 text-lg">
                  {programs.length > 0
                    ? "You're making great progress!"
                    : "Enroll in a program to begin your journey"}
                </p>
              </div>
              <div className="shrink-0">
                <CircularProgress value={overallProgress} size={120} />
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-3 gap-8 min-w-0">
            {/* MAIN AREA */}
            <div className="lg:col-span-2 space-y-12 min-w-0">
              {/* 1️⃣ PROGRAMS SECTION */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">My Programs</h3>
                  {programs.length > 0 && (
                    <Link href="/dashboard/students/myProgram">
                      <Button variant="primary" size="sm">
                        View All
                      </Button>
                    </Link>
                  )}
                </div>

                {programs.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Award size={64} className="text-gray-600 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-white mb-2">
                        No programs yet
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Contact your administrator to enroll in a program.
                      </p>
                      <Link href="/programs/all">
                        <Button className="bg-[#EFB14A] hover:bg-[#EFB14A]/90">
                          Browse Programs
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {programs.slice(0, 3).map((item: any, idx: number) => {
                      const program = item.enrollment?.program;
                      const stats = item.stats;

                      if (!program) return null;

                      return (
                        <Card
                          key={program._id || idx}
                          className="border-gray-800 hover:border-lime-400/30 transition-all"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4 gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xl font-bold text-white mb-1 truncate">
                                  {program.title}
                                </h4>
                                <p className="text-gray-400 text-sm line-clamp-2">
                                  {program.description}
                                </p>
                              </div>

                              <span className="text-lime-400 font-bold text-lg shrink-0">
                                {stats?.overallProgress ?? 0}%
                              </span>
                            </div>

                            <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-lime-500 transition-all"
                                style={{
                                  width: `${stats?.overallProgress ?? 0}%`,
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <BookOpen size={16} />
                                  {stats?.completedCourses || 0}/{stats?.totalCourses || 0} Courses
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={16} />
                                  {program.estimatedHours || 0}h
                                </span>
                              </div>

                              <Link href={`/dashboard/students/myProgram/${program._id}`}>
                                <Button className="bg-[#EFB14A] hover:bg-[#EFB14A]/90" size="sm">
                                  Continue
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 2️⃣ COURSES SECTION */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">My Courses</h3>
                  {courses.length > 0 && (
                    <Link href="/dashboard/students/courses">
                      <Button variant="primary" size="sm">
                        View All
                      </Button>
                    </Link>
                  )}
                </div>

                {courses.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen size={48} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">
                        No courses yet. Enroll in a program to get started.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {courses.slice(0, 4).map((courseData: any, idx: number) => {
                      const course = courseData.course;
                      const progress = courseData.progress?.overallProgress ?? 0;

                      if (!course) return null;

                      return (
                        <Card
                          key={course._id || idx}
                          className="border-gray-800 hover:border-lime-400/30 transition-all"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-semibold text-white mb-1 truncate">
                                  {course.title}
                                </h4>
                                <p className="text-sm text-gray-400">
                                  {courseData.lessonsCompleted || 0}/{courseData.totalLessons || 0} lessons completed
                                </p>
                              </div>

                              <span className="text-lime-400 font-bold ml-4 shrink-0">
                                {progress}%
                              </span>
                            </div>

                            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>

                            <Link href={`/dashboard/students/courses/${course._id}`}>
                              <Button className="mt-4 bg-[#EFB14A] hover:bg-[#EFB14A]/90" size="sm">
                                Continue
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="space-y-6 min-w-0">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <StatCard label="Programs" value={programs.length} />
                  <StatCard label="Courses" value={courses.length} />
                  <StatCard
                    label="Lessons Completed"
                    value={overview?.lessons?.completed || 0}
                  />
                  <StatCard
                    label="Assessments Completed"
                    value={overview?.assessments?.completed || 0}
                  />
                  <StatCard
                    label="Average Score"
                    value={
                      overview?.assessments?.averageScore
                        ? `${overview.assessments.averageScore}%`
                        : "N/A"
                    }
                  />
                </CardContent>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 bg-slate-800/50 rounded-lg flex justify-between items-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-semibold">{value ?? 0}</span>
    </div>
  );
}