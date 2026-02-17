"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { studentService } from "@/services/studentService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Award, BookOpen, Clock, RefreshCw, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentProgramsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "student") {
      router.replace("/auth/login");
      return;
    }
    void loadPrograms();
  }, [authLoading, isAuthenticated, user?.role]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await studentService.getEnrolledPrograms();
      
      if (res.success) {
        setPrograms(res.data || []);
      } else {
        const errorMsg = res.error || "Failed to load programs";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error loading programs:", err);
      setError("An unexpected error occurred");
      toast.error("Failed to load programs");
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
            <p className="text-gray-400">Loading programs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <StudentSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Programs</h1>
            <p className="text-gray-400">Track your progress across programs</p>
          </div>
          
          <button
            onClick={loadPrograms}
            disabled={loading}
            className="p-2 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
            title="Refresh programs"
          >
            <RefreshCw size={20} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <div>
              <p className="text-red-400 font-medium">Error loading programs</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && programs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No programs yet</h3>
              <p className="text-gray-400 mb-4">Enroll in a program to start learning</p>
              <Link href="/programs">
                <Button className="bg-[#EFB14A] hover:bg-[#EFB14A]/90">Browse Programs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((item: any) => {
              const program = item.enrollment?.program;
              const stats = item.stats;
              
              if (!program) return null;

              const progress = stats?.overallProgress || 0;
              const status = stats?.status || "pending";

              return (
                <Card
                  key={program._id}
                  className="hover:border-lime-500/50 transition-all"
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-lime-500 to-emerald-500 flex items-center justify-center shrink-0">
                        <Award size={32} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-1 truncate">
                          {program.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {program.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Overall Progress</span>
                        <span className="text-sm font-semibold text-lime-400">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen size={16} className="text-lime-400 shrink-0" />
                        <span className="text-gray-400">
                          {stats?.completedCourses || 0}/{stats?.totalCourses || 0} Courses
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-blue-400 shrink-0" />
                        <span className="text-gray-400">
                          {program.estimatedHours || 0} hours
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                    <Link href={`/dashboard/students/myProgram/${program._id}`}>
                      <Button
                        className="w-full bg-[#EFB14A] hover:bg-[#EFB14A]/90"
                        size="sm"
                      >
                        {status === "completed" ? "Review Program" : "View Courses"}
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