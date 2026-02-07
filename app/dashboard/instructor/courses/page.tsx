'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import InstructorSidebar from '@/components/dashboard/InstructorSide'
import { instructorService } from '@/services/instructorService'
import {
  BookOpen,
  Users,
  Globe,
  Lock,
  Plus,
  Eye,
  LayoutList,
} from 'lucide-react'

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await instructorService.getCourses()
         console.log('📦 Courses response:', res.data)
        if (res.success) setCourses(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const stats = useMemo(() => {
    return {
      total: courses.length,
      published: courses.filter(c => c.isPublished).length,
      draft: courses.filter(c => !c.isPublished).length,
    }
  }, [courses])

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <InstructorSidebar />

      <div className="flex-1 ml-64 px-6 py-8 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">My Courses</h1>
            <p className="text-gray-400 mt-1">
              Manage your teaching content and curriculum
            </p>
          </div>

          <Link
            href="/dashboard/instructor/courses/create"
            className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 px-4 py-2 rounded-xl font-semibold transition-colors"
          >
            <Plus size={18} />
            Create Course
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat title="Total Courses" value={stats.total} icon={LayoutList} />
          <Stat title="Published" value={stats.published} icon={Globe} color="text-emerald-400" />
          <Stat title="Draft" value={stats.draft} icon={Lock} color="text-yellow-400" />
        </div>

        {/* COURSE GRID */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ title, value, icon: Icon, color = 'text-white' }: any) {
  return (
    <div className="bg-slate-900/50 border border-gray-800 rounded-xl p-5">
      <Icon className={`w-6 h-6 mb-3 ${color}`} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <p className="text-sm text-gray-400">{title}</p>
    </div>
  )
}

function CourseCard({ course }: any) {
  return (
    <div className="group bg-slate-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-400/30 transition">
      {/* Cover */}
      <div className="h-36 bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        {course.coverImage ? (
          <img src={course.coverImage} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-12 h-12 text-gray-600" />
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <h2 className="text-lg font-bold text-white line-clamp-1">{course.title}</h2>
        <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>

        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center gap-1 text-gray-400">
            <Users className="w-3 h-3" />
            {course.studentsCount || 0}
          </span>

          <span
            className={`px-2 py-1 rounded-full border text-xs font-semibold ${
              course.isPublished
                ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
            }`}
          >
            {course.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 pt-2">
          <Link
            href={`/dashboard/instructor/courses/${course._id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded-lg"
          >
            <Eye size={14} /> Manage
          </Link>

          <Link
            href={`/dashboard/instructor/courses/${course._id}/curriculum`}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 text-xs py-2 rounded-lg"
          >
            Curriculum
          </Link>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-slate-900/40 border border-gray-800 rounded-2xl">
      <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">No Courses Yet</h3>
      <p className="text-gray-400 mb-6">
        Start building your first course and share your knowledge.
      </p>
      <Link
        href="/dashboard/instructor/courses/create"
        className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 px-5 py-2 rounded-xl font-semibold"
      >
        <Plus size={18} /> Create Course
      </Link>
    </div>
  )
}
