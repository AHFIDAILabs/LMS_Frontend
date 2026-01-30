'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCourses } from '@/hooks/useCourses'
import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { Clock, ArrowRight } from 'lucide-react'

interface Course {
  _id: string
  title: string
  description: string
  level?: string
  totalDuration?: number
  slug?: string
}

export default function CoursesPage() {
  const { getAllCourses, loading, error } = useCourses()
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses()
        if (response?.data) {
          const mapped = response.data.map((c: any) => ({
            _id: c._id,
            title: c.title || 'Untitled Course',
            description: c.description || 'No description available',
            level: c.level,
            totalDuration: c.totalDuration,
            slug: c.slug,
          }))
          setCourses(mapped)
        }
      } catch (err) {
        console.error('❌ Error fetching courses:', err)
      }
    }

    fetchCourses()
  }, [getAllCourses])

  return (
    <main className="min-h-screen pt-8 bg-[#2A434E] text-white">
      <Navbar />

      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-center">Course Catalogue</h1>
          <p className="text-center text-gray-300 mb-12">
            Explore all courses and start your learning journey today.
          </p>

          {loading && <p className="text-center">Loading courses...</p>}
          {error && <p className="text-red-400 text-center">{error}</p>}
          {!loading && !error && courses.length === 0 && (
            <p className="text-center text-gray-400">No courses available at the moment.</p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <Link key={course._id} href={`/courses/${course.slug || course._id}`}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-2">Course {idx + 1}</div>
                      <h2 className="text-xl font-bold mb-2 group-hover:text-[#FF6B35] transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-gray-300 mb-4 line-clamp-3">{course.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {course.totalDuration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.totalDuration}h</span>
                          </div>
                        )}
                        {course.level && (
                          <div className="px-2 py-1 bg-white/5 rounded text-xs">{course.level}</div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
