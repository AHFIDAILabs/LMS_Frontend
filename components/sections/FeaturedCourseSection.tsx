'use client'

import { motion } from 'framer-motion'
import { Clock, BarChart3, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCourses } from '@/hooks/useCourses'
import { useEffect, useState } from 'react'
import { Course } from '@/types'

interface FeaturedCoursesProps {
  title?: string
  subtitle?: string
}

export const FeaturedCourses = ({
  title = "Featured Courses",
  subtitle = "Hand-picked courses to accelerate your learning journey"
}: FeaturedCoursesProps) => {
  const { getAllCourses, loading, error } = useCourses()
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses()
        if (response?.data) {
          const mapped = response.data.map((c: any) => ({
            _id: c._id,
            title: c.title || "Untitled Course",
            description: c.description || "No description available",
            slug: c.slug,
            level: c.level,
            totalDuration: c.totalDuration,
            thumbnail: c.thumbnail
          }))
          setCourses(mapped)
        }
      } catch (err) {
        console.error('❌ Error fetching featured courses:', err)
      }
    }

    fetchCourses()
  }, [getAllCourses])

  return (
    <section className="py-20 px-4 bg-[#2A434E]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Courses Grid */}
        {loading && <p className="text-center text-white mb-6">Loading courses...</p>}
        {error && <p className="text-center text-red-400 mb-6">{error}</p>}
        {!loading && courses.length === 0 && <p className="text-center text-gray-300 mb-6">No courses available.</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.slice(0, 4).map((course, index) => (
            <motion.div
              key={course._id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/courses/${course.slug || course._id}`}>
                <div className="group bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-[#FF6B35]/50 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  {/* Course Image */}
                  <div className="relative h-40 overflow-hidden bg-linear-to-br from-[#FF6B35]/20 to-[#2A434E]">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-[#FF6B35]/20 flex items-center justify-center">
                          <Star className="w-8 h-8 text-[#FF6B35]" />
                        </div>
                      </div>
                    )}
                    {course.level && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-[#2A434E]">
                        {course.level}
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FF6B35] transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">{course.description}</p>

                    {/* Course Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t border-white/10">
                      {course.totalDuration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.totalDuration}h</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        <span>{course.level || 'All Levels'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/courses">
            <button className="px-6 py-3 border-2 border-[#FF6B35] text-[#FF6B35] rounded-full font-semibold hover:bg-[#FF6B35] hover:text-white transition-all duration-300 flex items-center gap-2 mx-auto">
              Browse All Courses
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
