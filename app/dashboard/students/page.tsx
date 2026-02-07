'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { studentService } from '@/services/studentService'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CircularProgress } from '@/components/ui/ProgressBar'
import { Avatar } from '@/components/ui/Avatar'
import StudentSidebar from '@/components/dashboard/StudentSidebar'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [courses, setCourses] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated || !user) {
      router.replace('/auth/login')
      return
    }

    // Instructor without a program can't use any dashboard
    if (user.role === 'instructor' && !user.programId) {
      router.replace('/')
      return
    }

    // This IS the student dashboard — only students belong here
    if (user.role !== 'student') {
      router.replace('/')
      return
    }

    loadDashboardData()
  }, [authLoading, isAuthenticated, user, router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch enrolled courses
      const coursesResponse = await studentService.getEnrolledCourses()
      
      if (coursesResponse.success) {
        setCourses(coursesResponse.data || [])
      } else {
        toast.error(coursesResponse.error || 'Failed to load courses')
      }

      // Fetch dashboard overview
      const overviewResponse = await studentService.getDashboardOverview()
      
      if (overviewResponse.success) {
        setDashboardData(overviewResponse.data)
      } else {
        console.error('Failed to load dashboard overview:', overviewResponse.error)
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'active':
        return 'primary'
      default:
        return 'neutral'
    }
  }

  const overallProgress = dashboardData?.courses?.overallProgress || 0
  const totalCourses = courses.length
  const completedCourses = courses.filter((c: any) => c.enrollmentStatus === 'completed').length
  const activeCourses = courses.filter((c: any) => c.enrollmentStatus === 'active').length

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <StudentSidebar />

      <div className="flex-1 ml-64 px-3">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-800/70 backdrop-blur border-b border-gray-800">
          <div className="container-custom p-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome back, {user?.firstName}</p>
            </div>

            <Link href="/profile" className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded-lg transition">
              <Avatar
                src={user?.profileImage}
                firstName={user?.firstName}
                lastName={user?.lastName}
                userId={user?._id}
                size="sm"
                showOnlineStatus
                isOnline
              />
              <span className="text-white text-sm font-medium hidden md:block">
                {user?.firstName}
              </span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container-custom py-8 space-y-8">
          {/* Welcome */}
          <section className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-8">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 blur-[140px]" />
            </div>

            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Keep going, {user?.firstName}! 
                </h2>
                <p className="text-gray-400 text-lg">
                  {totalCourses > 0 
                    ? "You're making great progress!"
                    : "Start your learning journey today"}
                </p>
              </div>
              <CircularProgress value={overallProgress} size={120} />
            </div>
          </section>

          {/* Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <header className="flex justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">My Courses</h3>
                  <Link href="/courses">
                    <Button variant="ghost" className="text-lime-400">
                      View all →
                    </Button>
                  </Link>
                </header>

                {totalCourses === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="mb-4 text-gray-500">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">No courses yet</h4>
                      <p className="text-gray-400 mb-4">Enroll in a program to start learning</p>
                      <Link href="/allPrograms">
                        <Button className="bg-[#EFB14A] hover:bg-[#EFB14A]/90">
                          Browse Programs
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {courses.map((courseData: any, index: number) => {
                      const course = courseData.course
                      const progress = courseData.progress?.overallProgress || 0
                      const status = courseData.enrollmentStatus || 'pending'
                      
                      return (
                        <Card key={course?._id || index}>
                          <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="text-lg font-semibold text-white">
                                  {course?.title || 'Untitled Course'}
                                </h4>
                                <p className="text-sm text-gray-400">
                                  {courseData.lessonsCompleted || 0} / {courseData.totalLessons || 0} lessons completed
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-white">
                                  {progress}%
                                </div>
                                <Badge variant={getStatusBadge(status)}>
                                  {status}
                                </Badge>
                              </div>
                            </div>

                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>

                            <Link href={`/courses/${course?._id}`}>
                              <Button size="sm" className="bg-[#EFB14A] hover:bg-[#EFB14A]/90">
                                {status === 'completed' ? 'Review Course' : 'Continue'}
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right Sidebar */}
            <aside className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Your learning overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-400">Total Courses</span>
                    <span className="text-2xl font-bold text-white">{totalCourses}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-2xl font-bold text-lime-500">
                      {completedCourses}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-400">In Progress</span>
                    <span className="text-2xl font-bold text-yellow-500">
                      {activeCourses}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Stats */}
              {dashboardData?.lessons && (
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Lessons Completed</span>
                      <span className="text-white font-semibold">
                        {dashboardData.lessons.completed} / {dashboardData.lessons.total}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Completion Rate</span>
                      <span className="text-lime-400 font-semibold">
                        {dashboardData.lessons.completionRate}%
                      </span>
                    </div>
                    {dashboardData.assessments && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Assessments</span>
                          <span className="text-white font-semibold">
                            {dashboardData.assessments.completed} / {dashboardData.assessments.total}
                          </span>
                        </div>
                        {dashboardData.assessments.averageScore > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Average Score</span>
                            <span className="text-blue-400 font-semibold">
                              {dashboardData.assessments.averageScore}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}