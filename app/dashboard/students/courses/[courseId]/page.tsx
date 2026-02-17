"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { studentService } from "@/services/studentService";
import { ArrowLeft, Layers, CheckCircle2 } from "lucide-react";

export default function StudentCourseModulesPage() {
  const params = useParams<{ courseId: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const courseId = params.courseId;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "student") return;
    void load();
  }, [authLoading, isAuthenticated, user?.role, courseId]);

  const load = async () => {
    setLoading(true);
    const res = await studentService.getCourseModules(courseId);
    if (res.success) setData(res.data);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <StudentSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const course = data?.course;
  const modules = data?.modules || [];
  const overallProgress = data?.overallProgress || 0;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <StudentSidebar />
      <main className="flex-1 ml-64 p-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/students/courses"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-gray-300"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{course?.title || "Course"}</h1>
              <p className="text-gray-400 text-sm">
                Overall progress: <span className="text-lime-400 font-semibold">{overallProgress}%</span>
              </p>
            </div>
          </div>
        </header>

        {modules.length === 0 ? (
          <div className="text-gray-400">No modules available</div>
        ) : (
          <div className="space-y-3">
            {modules.map((m: any) => {
              const mod = m.module;
              const p = m.progress || {};
              const completed = p?.completionPercentage >= 100;
              return (
                <Link
                  key={mod._id}
                  href={`/dashboard/students/modules/${mod._id}`}
                  className="flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 border border-gray-700/50 hover:border-lime-400/30 px-4 py-3 rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                      <Layers className="text-lime-400" size={18} />
                    </div>
                    <div>
                      <p className="text-white font-medium group-hover:text-lime-400 transition-colors">
                        {mod.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.completedLessons || 0}/{p.totalLessons || 0} lessons • {p.completionPercentage || 0}% complete
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {completed ? (
                      <CheckCircle2 className="text-lime-400" size={18} />
                    ) : (
                      <span className="text-gray-400 text-xs">Open</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}