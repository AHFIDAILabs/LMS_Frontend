"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import InstructorSidebar from "@/components/dashboard/InstructorSide";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { instructorService } from "@/services/instructorService"; // <-- ensure these three methods exist
import {
  Video,
  FileText,
  Layers,
  Plus,
  ArrowRight,
  BookOpen,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

type ContentStats = {
  modules: number;
  lessons: number;
  assessments: number;
  totalContent: number;
};

type ActivityItem = {
  type: "module" | "lesson" | "assessment";
  title: string;
  action: "created" | "updated" | "published" | "unpublished";
  time: string; // formatted
  icon: any;
  color: string;
};

export default function InstructorContentPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<ContentStats>({
    modules: 0,
    lessons: 0,
    assessments: 0,
    totalContent: 0,
  });
  const [recent, setRecent] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInstructor = user?.role === "instructor";

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !isInstructor) {
      router.push("/dashboard");
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadContentStats(), loadRecentActivity()]);
      } catch (err: any) {
        setError(err?.message || "Failed to load content overview");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, isInstructor]);

  /** --------------------------------------------
   * LOAD STATISTICS — instructor-scoped counts
   * ---------------------------------------------*/
  const loadContentStats = async () => {
    const [modRes, lesRes, asmRes] = await Promise.all([
      instructorService.getInstructorModules(),     // { success, count, data }
      instructorService.getInstructorLessons(),     // { success, count, data }
      instructorService.getInstructorAssessments(), // { success, count, data }
    ]);

    const modules = modRes?.count ?? (modRes?.data?.length ?? 0);
    const lessons = lesRes?.count ?? (lesRes?.data?.length ?? 0);
    const assessments = asmRes?.count ?? (asmRes?.data?.length ?? 0);

    setStats({
      modules,
      lessons,
      assessments,
      totalContent: modules + lessons + assessments,
    });
  };

  /** --------------------------------------------
   * LOAD RECENT ACTIVITY — from instructor lists
   * ---------------------------------------------*/
  const loadRecentActivity = async () => {
    const [modRes, lesRes, asmRes] = await Promise.all([
      instructorService.getInstructorModules(),
      instructorService.getInstructorLessons(),
      instructorService.getInstructorAssessments(),
    ]);

    const modules = (modRes?.data ?? []).slice(0, 3);
    const lessons = (lesRes?.data ?? []).slice(0, 3);
    const assessments = (asmRes?.data ?? []).slice(0, 3);

    const modItems: ActivityItem[] = modules.map((m: any) => ({
      type: "module",
      title: m.title,
      action: "updated",
      time: new Date(m.updatedAt || m.createdAt).toLocaleString(),
      icon: Layers,
      color: "text-blue-400",
    }));

    const lessonItems: ActivityItem[] = lessons.map((l: any) => ({
      type: "lesson",
      title: l.title,
      action: "updated",
      time: new Date(l.updatedAt || l.createdAt).toLocaleString(),
      icon: Video,
      color: "text-purple-400",
    }));

    const assessmentItems: ActivityItem[] = assessments.map((a: any) => ({
      type: "assessment",
      title: a.title,
      action: "updated",
      time: new Date(a.updatedAt || a.createdAt).toLocaleString(),
      icon: FileText,
      color: "text-emerald-400",
    }));

    const merged = [...modItems, ...lessonItems, ...assessmentItems].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    setRecent(merged.slice(0, 6));
  };

  const contentSections = useMemo(
    () => [
      {
        title: "Modules",
        description: "Organize your course content into structured modules and weeks",
        icon: Layers,
        iconColor: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        href: "/dashboard/instructor/contents/modules",
        stats: [
          { label: "Total Modules", value: stats.modules },
          {
            label: "Avg Lessons/Module",
            value: stats.modules > 0 ? Math.round(stats.lessons / stats.modules) : 0,
          },
        ],
        actions: [
          { label: "View All Modules", href: "/dashboard/instructor/contents/modules", primary: false },
          { label: "Create Module", href: "/dashboard/instructor/contents/modules/create", primary: true },
        ],
      },
      {
        title: "Lessons",
        description: "Create and manage video lessons, reading materials, and resources",
        icon: Video,
        iconColor: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
        href: "/dashboard/instructor/contents/lessons",
        stats: [
          { label: "Total Lessons", value: stats.lessons },
          { label: "Published", value: "—" }, // optionally add a published count endpoint later
        ],
        actions: [
          { label: "View All Lessons", href: "/dashboard/instructor/contents/lessons", primary: false },
          { label: "Create Lesson", href: "/dashboard/instructor/contents/lessons/create", primary: true },
        ],
      },
      {
        title: "Assessments",
        description: "Build quizzes, assignments, projects, and capstone assessments",
        icon: FileText,
        iconColor: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        href: "/dashboard/instructor/assessments",
        stats: [
          { label: "Total Assessments", value: stats.assessments },
          { label: "Pending Grading", value: "—" }, // optionally wire to /instructors/submissions/pending
        ],
        actions: [
          { label: "View All Assessments", href: "/dashboard/instructor/assessments", primary: false },
          { label: "Create Assessment", href: "/dashboard/instructor/assessments/create", primary: true },
        ],
      },
    ],
    [stats]
  );

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
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <BookOpen className="text-emerald-400" size={32} />
              Course Content
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Create and manage your course modules, lessons, and assessments
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <OverviewCard icon={<BookOpen className="text-emerald-300" size={24} />} value={stats.totalContent} label="Total Content Items" />
            <OverviewCard icon={<Layers className="text-blue-400" size={24} />} value={stats.modules} label="Modules" />
            <OverviewCard icon={<Video className="text-purple-400" size={24} />} value={stats.lessons} label="Lessons" />
            <OverviewCard icon={<FileText className="text-emerald-400" size={24} />} value={stats.assessments} label="Assessments" />
          </div>

          {/* Content Sections */}
          <div className="grid gap-6 mb-8">
            {contentSections.map((section) => (
              <div
                key={section.title}
                className={`bg-slate-800/50 backdrop-blur rounded-xl border ${section.borderColor} overflow-hidden hover:bg-slate-800/70 transition-all`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center shrink-0`}>
                        <section.icon className={section.iconColor} size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white mb-2">{section.title}</h2>
                        <p className="text-gray-400 text-sm">{section.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {section.stats.map((s) => (
                      <div key={s.label} className="bg-slate-900/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {section.actions.map((action) => (
                      <Link
                        key={action.label}
                        href={action.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          action.primary
                            ? `${section.bgColor} ${section.iconColor} hover:opacity-80`
                            : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                        }`}
                      >
                        {action.primary && <Plus size={16} />}
                        {action.label}
                        {!action.primary && <ArrowRight size={16} />}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={20} />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recent.length > 0 ? (
                recent.map((a, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <a.icon className={a.color} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{a.title}</p>
                      <p className="text-gray-500 text-xs">
                        {a.action} • {a.time}
                      </p>
                    </div>
                    <CheckCircle className="text-green-400 shrink-0" size={16} />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent updates yet.</p>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 bg-linear-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              💡 Content Organization Tips
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">→</span>
                <span>
                  <strong>Modules</strong> organize content by week or topic—create them first
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">→</span>
                <span>
                  <strong>Lessons</strong> contain the learning materials—videos, readings, etc.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">→</span>
                <span>
                  <strong>Assessments</strong> test knowledge—add them after lessons
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">→</span>
                <span>Use <strong>draft mode</strong> while building; publish when ready</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-3">{icon}</div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}