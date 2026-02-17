// app/dashboard/instructor/courses/[courseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Link from "next/link";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useEnrollmentStats } from "@/hooks/useEnrollmentStats";
import {
  BookOpen,
  Users,
  Layers,
  BarChart3,
  Edit,
  LayoutList,
  ArrowLeft,
  Settings,
  Eye,
  Clock,
  Award,
  TrendingUp,
  FileText,
  Play,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { courseService } from "@/services/courseService";

export default function InstructorCourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // ✅ Use enrollment stats hook
  const { 
    stats: enrollmentStats, 
    loading: statsLoading,
    refresh: refreshStats 
  } = useEnrollmentStats(undefined, courseId);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await courseService.getCourseContent(courseId);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load course");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      setPublishing(true);
      const res = await courseService.togglePublish(courseId);
      
      if (res.success) {
        toast.success(`Course ${res.data.isPublished ? 'published' : 'unpublished'} successfully!`);
        fetchCourse();
        refreshStats(); // ✅ Refresh stats after publishing
      } else {
        toast.error(res.error || 'Failed to toggle publish status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle publish status');
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    if (!courseId) return;
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex overflow-x-hidden">
        <InstructorSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex overflow-x-hidden">
        <InstructorSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-2">
              Failed to load course
            </p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg text-sm font-semibold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { course, modules } = data;

  // ✅ Use enrollment stats from hook
  const totalStudents = enrollmentStats?.total || course.currentEnrollment || 0;
  const activeStudents = enrollmentStats?.active || 0;
  const completedStudents = enrollmentStats?.completed || 0;
  const completionRate = enrollmentStats?.completionRate || 0;

  const totalLessons = modules?.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) || 0;
  const publishedModules = modules?.filter((m: any) => m.isPublished)?.length || 0;
  const moduleCompletionRate = modules?.length > 0 ? Math.round((publishedModules / modules.length) * 100) : 0;

  return (
    <div className="min-h-screen w-full bg-slate-950 flex overflow-x-hidden">
      <InstructorSidebar sidebarOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 w-full overflow-x-hidden">
        {/* HEADER */}
        <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-lg border-b border-gray-800">
          <div className="px-4 sm:px-6 py-3 sm:py-4 w-full overflow-x-hidden">
            {/* MOBILE */}
            <div className="flex items-center justify-between lg:hidden mb-3 w-full overflow-hidden">
              <button
                onClick={() => router.push("/dashboard/instructor/courses")}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <h1 className="text-base font-bold text-white truncate max-w-[65%]">
                {course.title}
              </h1>

              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* DESKTOP */}
            <div className="hidden lg:flex items-center justify-between w-full overflow-hidden">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => router.push("/dashboard/instructor/courses")}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-white line-clamp-1">
                    {course.title}
                  </h1>
                  <p className="text-sm text-gray-500">Course Overview</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* ✅ Refresh Stats Button */}
                <button
                  onClick={refreshStats}
                  disabled={statsLoading}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors disabled:opacity-50"
                  title="Refresh enrollment stats"
                >
                  <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                </button>

                <Link
                  href={`/courses/${course.slug || courseId}`}
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm"
                >
                  <Eye className="w-4 h-4" /> Preview
                </Link>

                <Link
                  href={`/dashboard/instructor/courses/${courseId}/edit`}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm"
                >
                  <Edit className="w-4 h-4" /> Edit
                </Link>

                <Link
                  href={`/dashboard/instructor/courses/${courseId}/curriculum`}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg font-semibold text-sm"
                >
                  <LayoutList className="w-4 h-4" /> Curriculum
                </Link>
              </div>
            </div>

            {/* MOBILE ACTION BUTTONS */}
            <div className="flex lg:hidden gap-2 mt-2 overflow-x-auto no-scrollbar">
              <Link
                href={`/dashboard/instructor/courses/${courseId}/curriculum`}
                className="px-3 py-1.5 text-xs bg-emerald-400 text-slate-900 font-semibold rounded-lg whitespace-nowrap"
              >
                Curriculum
              </Link>

              <Link
                href={`/courses/${course.slug || courseId}`}
                target="_blank"
                className="px-3 py-1.5 text-xs bg-slate-800 text-gray-300 rounded-lg whitespace-nowrap"
              >
                Preview
              </Link>

              <Link
                href={`/dashboard/instructor/courses/${courseId}/edit`}
                className="px-3 py-1.5 text-xs bg-slate-700 text-white rounded-lg whitespace-nowrap"
              >
                Edit
              </Link>

              <button
                onClick={refreshStats}
                disabled={statsLoading}
                className="px-3 py-1.5 text-xs bg-slate-700 text-white rounded-lg whitespace-nowrap disabled:opacity-50"
              >
                {statsLoading ? 'Refreshing...' : 'Refresh Stats'}
              </button>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="px-4 sm:px-6 py-6 sm:py-8 space-y-8 w-full overflow-x-hidden">

          {/* COURSE CARD */}
          <div className="bg-slate-900/50 border border-gray-800 rounded-xl p-4 sm:p-6 w-full">
            <div className="flex flex-col lg:flex-row gap-6 w-full">
              {course.coverImage && (
                <img
                  src={course.coverImage}
                  className="w-full lg:w-80 rounded-lg border border-gray-700 object-cover aspect-video"
                  alt={course.title}
                />
              )}

              <div className="space-y-4 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {course.title}
                </h2>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {course?.program?.title && (
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-gray-300 border border-gray-700 text-xs">
                      📚 {course.program.title}
                    </span>
                  )}

                  <span
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      course.isPublished
                        ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                        : "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </span>

                  {course.estimatedHours && (
                    <span className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-gray-300 border border-gray-700 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {course.estimatedHours}h
                    </span>
                  )}

                  {/* Publish/Unpublish Button */}
                  <button
                    onClick={handleTogglePublish}
                    disabled={publishing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      course.isPublished
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-emerald-400 hover:bg-emerald-500 text-slate-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {publishing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {course.isPublished ? 'Unpublishing...' : 'Publishing...'}
                      </>
                    ) : (
                      <>
                        {course.isPublished ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Publish
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>

                {/* ✅ Enhanced Stats Grid with Enrollment Data */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                  <StatNumber label="Modules" value={modules?.length || 0} />
                  <StatNumber label="Lessons" value={totalLessons} />
                  <StatNumber 
                    label="Total Enrolled" 
                    value={totalStudents}
                    highlight={true}
                  />
                  <StatNumber 
                    label="Active" 
                    value={activeStudents}
                    subtext={completedStudents > 0 ? `${completedStudents} completed` : undefined}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ✅ ENHANCED STATS GRID WITH ENROLLMENT DATA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard 
              icon={Layers} 
              label="Total Modules" 
              value={modules.length} 
              subtext={`${publishedModules} published`} 
              color="emerald" 
            />
            <StatCard 
              icon={BookOpen} 
              label="Total Lessons" 
              value={totalLessons} 
              subtext="Across all modules" 
              color="blue" 
            />
            <StatCard 
              icon={Users} 
              label="Total Enrolled" 
              value={totalStudents} 
              subtext={`${activeStudents} active`}
              color="purple" 
            />
            <StatCard 
              icon={TrendingUp} 
              label="Student Progress" 
              value={`${completionRate}%`} 
              subtext={`${completedStudents} completed`}
              color="lime" 
            />
          </div>

          {/* ✅ Enrollment Stats Section (if available) */}
          {enrollmentStats && (
            <div className="bg-slate-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Enrollment Statistics</h2>
                  <p className="text-sm text-gray-500">Student enrollment breakdown</p>
                </div>
                {statsLoading && (
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-1">Total</div>
                  <div className="text-2xl font-bold text-white">{enrollmentStats.total}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-1">Active</div>
                  <div className="text-2xl font-bold text-emerald-400">{enrollmentStats.active}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-1">Completed</div>
                  <div className="text-2xl font-bold text-lime-400">{enrollmentStats.completed}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-1">Pending</div>
                  <div className="text-2xl font-bold text-yellow-400">{enrollmentStats.pending}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-1">Suspended</div>
                  <div className="text-2xl font-bold text-orange-400">{enrollmentStats.suspended}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-1">Dropped</div>
                  <div className="text-2xl font-bold text-red-400">{enrollmentStats.dropped}</div>
                </div>
              </div>

              {/* Completion Rate Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Completion Rate</span>
                  <span className="text-white font-semibold">{enrollmentStats.completionRate}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollmentStats.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ACTION CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              icon={LayoutList}
              title="Curriculum Builder"
              description="Manage modules and lessons"
              href={`/dashboard/instructor/courses/${courseId}/curriculum`}
              color="emerald"
            />

            <ActionCard
              icon={Users}
              title="Student Management"
              description={`View ${totalStudents} enrolled learner${totalStudents !== 1 ? 's' : ''}`}
              href={`/dashboard/instructor/courses/${courseId}/students`}
              color="blue"
            />

            <ActionCard
              icon={FileText}
              title="Submissions"
              description="View & grade submissions"
              href={`/dashboard/instructor/courses/${courseId}/submissions`}
              color="purple"
            />

            <ActionCard
              icon={BarChart3}
              title="Analytics"
              description="Performance insights"
              href={`/dashboard/instructor/courses/${courseId}/analytics`}
              color="lime"
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          {/* MODULE LIST */}
          <div className="bg-slate-900/50 border border-gray-800 rounded-xl w-full overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Course Modules</h2>
                <p className="text-gray-500 text-sm">{modules.length} total</p>
              </div>

              <Link
                href={`/dashboard/instructor/courses/${courseId}/curriculum`}
                className="text-emerald-400 text-sm hover:text-emerald-300"
              >
                Manage All →
              </Link>
            </div>

            <div className="p-4 sm:p-6">
              {modules.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No modules created yet</p>

                  <Link
                    href={`/dashboard/instructor/courses/${courseId}/curriculum`}
                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg font-semibold text-sm inline-flex items-center gap-2"
                  >
                    <LayoutList className="w-4 h-4" />
                    Create First Module
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 w-full">
             
{modules.slice(0, 5).map((mod: any, idx: number) => (
  <Link
    key={mod._id}
    href={`/dashboard/instructor/courses/${courseId}/curriculum/${mod._id}/lessons`}
    prefetch={false} // optional: avoid prefetching the default-first state
    className="flex items-center justify-between w-full bg-slate-800/50 hover:bg-slate-800 border border-gray-700/50 hover:border-emerald-400/30 rounded-lg px-4 py-3 transition-all"
  >

                      {/* LEFT */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 text-gray-300 flex items-center justify-center font-semibold shrink-0">
                          {idx + 1}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-white font-medium text-sm truncate">
                            {mod.title}
                          </h3>
                          <p className="text-xs text-gray-500 truncate hidden sm:block">
                            {mod.description || "No description"}
                          </p>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-sm text-gray-300">
                            {mod?.lessons?.length || 0} lessons
                          </div>
                          <div className="text-xs text-gray-500">
                            {mod.isPublished ? (
                              <span className="text-emerald-400">Published</span>
                            ) : (
                              <span className="text-yellow-400">Draft</span>
                            )}
                          </div>
                        </div>

                        {mod.isPublished ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                    </Link>
                  ))}

                  {modules.length > 5 && (
                    <Link
                      href={`/dashboard/instructor/courses/${courseId}/curriculum`}
                      className="block text-center py-3 text-sm text-emerald-400 hover:text-emerald-300"
                    >
                      View all {modules.length} modules →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* COMPONENTS */
function StatNumber({ label, value, highlight, subtext }: any) {
  return (
    <div className={`bg-slate-800/50 p-3 rounded-lg text-center ${highlight ? 'ring-2 ring-emerald-400/20' : ''}`}>
      <div className={`text-xl font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
      {subtext && <div className="text-[10px] text-gray-600 mt-0.5">{subtext}</div>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color }: any) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    lime: "text-lime-400 bg-lime-400/10 border-lime-400/20",
  };

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 flex flex-col ${colors[color]}`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {subtext && <div className="text-xs mt-1 text-gray-500">{subtext}</div>}
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, href, color, className = "" }: any) {
  const colors: Record<string, string> = {
    emerald: "hover:border-emerald-400/40 hover:bg-emerald-400/10",
    blue: "hover:border-blue-400/40 hover:bg-blue-400/10",
    purple: "hover:border-purple-400/40 hover:bg-purple-400/10",
    lime: "hover:border-lime-400/40 hover:bg-lime-400/10",
  };

  return (
    <Link
      href={href}
      className={`border border-gray-800 rounded-xl p-4 sm:p-5 bg-slate-900/50 transition-all flex flex-col ${colors[color]} ${className}`}
    >
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-gray-300" />
      </div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </Link>
  );
}