'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { programService } from '@/services/programService'
import { Program } from '@/types';
import {
  Award,
  ArrowLeft,
  Edit,
  Globe,
  Lock,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Tag,
  Calendar,
  Book,
} from 'lucide-react'
import Link from 'next/link'

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  thumbnail?: string
  duration?: number
  enrollmentCount?: number
}

interface ProgramDetail {
  _id: string
  name: string
  description: string
  category?: string
  duration?: number
  price?: number
  coverImage?: string
  isPublished: boolean
  courses?: Course[]
  tags?: string[]
  enrollmentCount?: number
  createdAt: string
  updatedAt: string
}

export default function AdminProgramDetailPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params?.id as string
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    fetchProgramDetails()
  }, [authLoading, isAuthenticated, user, programId])

  const fetchProgramDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await programService.getProgramById(programId)
      
      if (response.success && response.data) {
        setProgram(response.data as unknown as ProgramDetail)
      } else {
        setError(response.error || 'Failed to fetch program details')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Program Not Found</h1>
            <p className="text-gray-400 mb-4">{error || 'Unable to load program details'}</p>
            <Link
              href="/dashboard/admin/programs"
              className="text-lime-400 hover:text-lime-300 underline"
            >
              Back to Programs
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalCourses = program.courses?.length || 0
  const totalDuration = program.courses?.reduce((acc, course) => acc + (course.duration || 0), 0) || 0

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Back Button */}
        <Link
          href="/dashboard/admin/programes"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Programs
        </Link>

        <div className="space-y-6">
          {/* Program Header */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
            {/* Hero Section */}
            <div className="relative h-48 bg-linear-to-br from-lime-500/20 via-slate-800 to-slate-900 p-8 flex items-center">
              <div className="absolute inset-0 overflow-hidden">
                <Award size={200} className="absolute -right-12 -top-12 text-lime-500/10" />
              </div>
              
              <div className="relative flex items-center gap-6 flex-1">
                <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-lime-500 to-lime-600 flex items-center justify-center shrink-0">
                  <Award size={48} className="text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{program.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                      program.isPublished 
                        ? 'bg-lime-500/20 text-lime-400 border-lime-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {program.isPublished ? (
                        <span className="flex items-center gap-1">
                          <Globe size={14} /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Lock size={14} /> Draft
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-gray-300 text-lg">{program.description}</p>
                </div>

                <Link
                  href={`/dashboard/admin/programs/${program._id}/edit`}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                >
                  <Edit size={18} />
                  Edit Program
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-t border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <BookOpen className="text-lime-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Courses</p>
                  <p className="text-white font-semibold text-lg">{totalCourses}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Enrolled</p>
                  <p className="text-white font-semibold text-lg">{program.enrollmentCount || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Clock className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Total Duration</p>
                  <p className="text-white font-semibold text-lg">{formatDuration(totalDuration)}</p>
                </div>
              </div>

              {program.price !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <DollarSign className="text-yellow-400" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Price</p>
                    <p className="text-white font-semibold text-lg">${program.price}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - Courses */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={24} className="text-lime-400" />
                  Program Courses
                </h2>

                {program.courses && program.courses.length > 0 ? (
                  <div className="space-y-4">
                    {program.courses.map((course, index) => (
                      <Link
                        key={course._id}
                        href={`/dashboard/admin/courses/${course._id}`}
                        className="block group"
                      >
                        <div className="flex gap-4 p-4 rounded-lg border border-gray-700 hover:border-lime-500/50 bg-slate-700/30 hover:bg-slate-700/50 transition-all">
                          {/* Thumbnail */}
                          <div className="w-24 h-24 bg-linear-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-cente shrink-0 overflow-hidden">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail.startsWith('http') ? course.thumbnail : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${course.thumbnail}`}
                                alt={course.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <Book size={32} className="text-gray-600" />
                            )}
                          </div>

                          {/* Course Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lime-400 font-semibold text-sm">
                                    Course {index + 1}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                                    course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}>
                                    {course.level}
                                  </span>
                                </div>
                                <h3 className="text-white font-semibold group-hover:text-lime-400 transition-colors">
                                  {course.title}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                                  {course.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              {course.category && (
                                <span className="flex items-center gap-1">
                                  <Tag size={12} />
                                  {course.category}
                                </span>
                              )}
                              {course.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {formatDuration(course.duration)}
                                </span>
                              )}
                              {course.enrollmentCount !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Users size={12} />
                                  {course.enrollmentCount} enrolled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No courses in this program yet</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Edit this program to add courses
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Program Details */}
            <div className="space-y-6">
              {/* Tags */}
              {program.tags && program.tags.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Tag size={20} className="text-lime-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-lime-500/10 text-lime-400 rounded-full text-sm border border-lime-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                <div className="space-y-3">
                  {program.category && (
                    <div className="flex items-center gap-3 text-sm">
                      <Tag className="text-gray-500" size={18} />
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="text-white">{program.category}</p>
                      </div>
                    </div>
                  )}

                  {program.duration && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="text-gray-500" size={18} />
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="text-white">{program.duration} weeks</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="text-gray-500" size={18} />
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="text-white">{formatDate(program.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="text-gray-500" size={18} />
                    <div>
                      <p className="text-gray-500">Last Updated</p>
                      <p className="text-white">{formatDate(program.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Total Courses</span>
                    <span className="text-xl font-bold text-lime-400">{totalCourses}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Students Enrolled</span>
                    <span className="text-xl font-bold text-blue-400">{program.enrollmentCount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Total Duration</span>
                    <span className="text-xl font-bold text-purple-400">{formatDuration(totalDuration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}