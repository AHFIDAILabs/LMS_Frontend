'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/context/AuthContext'
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
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import api from '@/lib/api'

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.replace('/auth/login')
      return
    }

    const load = async () => {
      try {
        await Promise.all([
          api.courses.getAll(),
          api.progress.getOverview(),
        ])
      } catch (err) {
        console.error('Dashboard load failed:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [authLoading, isAuthenticated, router])

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

  /* ---------- Mock Data (Replace Later) ---------- */

  const enrolledCourses = [
    { id: 1, title: 'Neural Networks', module: 'Introduction', progress: 75, status: 'in-progress', nextLesson: 'Backpropagation' },
    { id: 2, title: 'Python for ML', module: 'Pandas Basics', progress: 45, status: 'in-progress', nextLesson: 'Data Cleaning' },
    { id: 3, title: 'AI Fundamentals', module: 'Week 8', progress: 100, status: 'completed' },
  ]

  const upcomingLessons = [
    { id: 1, title: 'Deep Learning Basics', course: 'Neural Networks', date: 'Jan 22', time: '10:00 AM' },
    { id: 2, title: 'Data Ethics & Privacy', course: 'AI Ethics', date: 'Jan 24', time: '2:00 PM' },
  ]

  const achievements = [
    { id: 1, title: 'Fast Learner', description: 'Completed 5 lessons in a day', icon: '⚡', earned: true },
    { id: 2, title: 'Quiz Master', description: '100% on 3 quizzes', icon: '🎯', earned: true },
    { id: 3, title: 'Consistency King', description: '7-day streak', icon: '🔥', earned: false },
  ]

  const recentActivity = [
    { id: 1, type: 'lesson', title: 'Completed: Intro to CNNs', offer: '2 hours ago' },
    { id: 2, type: 'quiz', title: '95% on Module 3 Quiz', offer: '1 day ago' },
    { id: 3, type: 'certificate', title: 'AI Fundamentals Certificate', offer: '3 days ago' },
  ]

  const overallProgress = 65

  /* ---------- Layout ---------- */

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <DashboardSidebar />

      <div className="flex-1 ml-64 px-3">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-800/70 backdrop-blur border-b border-gray-800">
          <div className="container-custom p-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome back, {user?.firstName}</p>
            </div>

            <Link href="/profile" className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded-lg transition">
              <Image
                src={user?.profileImage || '/default-avatar.png'}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
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
                  Keep going 🚀
                </h2>
                <p className="text-gray-400 text-lg">
                  You’re ahead of most learners. No cap.
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

                <div className="space-y-4">
                  {enrolledCourses.map(course => (
                    <Card key={course.id}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              {course.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {course.module}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-white">
                              {course.progress}%
                            </div>
                            <Badge variant={course.status === 'completed' ? 'success' : 'primary'}>
                              {course.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-lime-500 to-emerald-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>

                        <Button size="sm" className="bg-[#EFB14A] hover:bg-[#EFB14A]/90">
                          Continue
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Right */}
            <aside className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Milestones unlocked</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.map(a => (
                    <div
                      key={a.id}
                      className={`p-3 rounded-lg border ${
                        a.earned
                          ? 'border-lime-500/30 bg-lime-500/10'
                          : 'border-gray-700 bg-slate-800/50 opacity-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        <span className="text-2xl">{a.icon}</span>
                        <div>
                          <p className="text-white font-medium">{a.title}</p>
                          <p className="text-xs text-gray-400">{a.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
