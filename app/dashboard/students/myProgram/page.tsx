'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { studentService } from '@/services/studentService'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CircularProgress } from '@/components/ui/ProgressBar'
import StudentSidebar from '@/components/dashboard/StudentSidebar'
import { Award, BookOpen, Clock, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyProgramsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated || user?.role !== 'student') {
      router.replace('/auth/login')
      return
    }

    loadPrograms()
  }, [authLoading, isAuthenticated, user, router])

  const loadPrograms = async () => {
    try {
      setLoading(true)
      const response = await studentService.getEnrolledPrograms()
      
      if (response.success) {
        setPrograms(response.data || [])
      } else {
        toast.error(response.error || 'Failed to load programs')
      }
    } catch (err) {
      console.error('Failed to load programs:', err)
      toast.error('Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <StudentSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <StudentSidebar />

      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Programs</h1>
          <p className="text-gray-400">Track your progress across all enrolled programs</p>
        </div>

        {/* Programs List */}
        {programs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No programs yet</h3>
              <p className="text-gray-400 mb-4">Enroll in a program to start learning</p>
              <Link href="/allPrograms">
                <Button className="bg-[#EFB14A] hover:bg-[#EFB14A]/90">
                  Browse Programs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((item: any) => {
              const program = item.enrollment?.program
              const stats = item.stats
              
              if (!program) return null

              return (
                <Card key={program._id} className="hover:border-lime-500/50 transition-all">
                  <CardContent className="p-6">
                    {/* Program Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-linear-to-br from-lime-500 to-emerald-500 flex items-center justify-center shrink-0">
                        <Award size={32} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {program.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {program.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Overall Progress</span>
                        <span className="text-sm font-semibold text-lime-400">
                          {stats?.overallProgress || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-lime-500 to-emerald-500 transition-all"
                          style={{ width: `${stats?.overallProgress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen size={16} className="text-lime-400" />
                        <span className="text-gray-400">
                          {stats?.completedCourses || 0}/{stats?.totalCourses || 0} Courses
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-blue-400" />
                        <span className="text-gray-400">
                          {program.estimatedHours || 0} hours
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        stats?.status === 'completed' ? 'bg-lime-500/20 text-lime-400' :
                        stats?.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {stats?.status || 'pending'}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Link href={`/student/programs/${program._id}`}>
                      <Button 
                        className="w-full bg-[#EFB14A] hover:bg-[#EFB14A]/90"
                        size="sm"
                      >
                        {stats?.status === 'completed' ? 'Review Program' : 'Continue Learning'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}