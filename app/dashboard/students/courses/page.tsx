"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { studentService } from "@/services/studentService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookOpen, Clock, Award } from "lucide-react";

export default function StudentCoursesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "student") return;
    void load();
  }, [authLoading, isAuthenticated, user?.role]);

  const load = async () => {
    setLoading(true);
    const res = await studentService.getEnrolledCourses();
    if (res.success) setRows(res.data || []);
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

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <StudentSidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">My Courses</h1>
          <p className="text-gray-400 text-sm">Continue where you left off</p>
        </div>

        {rows.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
              <p className="text-gray-400">
                Enroll in a program to start learning
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((c: any, idx: number) => {
              const course = c.course;
              const progress = c.progress?.overallProgress ?? 0;
              const isCompleted = progress >= 100;
              
              return (
                <Card 
                  key={course?._id || idx}
                  className="border-gray-800 hover:border-lime-400/30 transition-all"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Course Image */}
                    {course?.coverImage && (
                      <div className="w-full h-40 rounded-lg overflow-hidden bg-slate-800">
                        <img 
                          src={course.coverImage} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Title & Progress */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white font-semibold line-clamp-2">
                          {course?.title}
                        </h3>
                        <span className="text-sm text-lime-400 font-semibold shrink-0">
                          {progress}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {course?.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={16} />
                        {c.lessonsCompleted || 0}/{c.totalLessons || 0}
                      </span>
                      {course?.estimatedHours && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={16} />
                          {course.estimatedHours}h
                        </span>
                      )}
                      {isCompleted && (
                        <span className="flex items-center gap-1.5 text-lime-400">
                          <Award size={16} />
                          Complete
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Action Button */}
                    <Link href={`/dashboard/students/courses/${course?._id}`}>
                      <Button 
                        className="w-full bg-[#EFB14A] hover:bg-[#EFB14A]/90" 
                        size="sm"
                      >
                        {isCompleted ? "Review Course" : "Continue Learning"}
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