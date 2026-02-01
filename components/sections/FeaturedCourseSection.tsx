'use client'

import { motion } from 'framer-motion'
import { Clock, BookOpen, GraduationCap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCourses } from '@/hooks/useCourses'
import { useEffect, useState } from 'react'

interface Course {
  _id: string
  title: string
  description: string
  slug: string
  coverImage?: string
  estimatedHours?: number
  program?: {
    _id: string
    title: string
    slug: string
  }
  objectives?: string[]
  targetAudience?: string
  isPublished: boolean
}

interface FeaturedCoursesProps {
 
  title?: string
  subtitle?: string
  limit?: number
}

export const FeaturedCourses = ({

  title = "Featured Courses",
  subtitle = "Hand-picked courses to accelerate your learning journey",
  limit = 4
}: FeaturedCoursesProps) => {
  const { getAllCourses, loading, error } = useCourses()
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses({ limit: limit })
        if (response?.data) {
          // Map the backend response to our frontend structure
          const mapped = response.data.map((c: any) => ({
            _id: c._id,
            title: c.title || "Untitled Course",
            description: c.description || "No description available",
            slug: c.slug || c._id,
            coverImage: c.coverImage,
            estimatedHours: c.estimatedHours,
            program: c.program ? {
              _id: c.program._id,
              title: c.program.title,
              slug: c.program.slug
            } : undefined,
            objectives: c.objectives || [],
            targetAudience: c.targetAudience || 'All Learners',
            isPublished: c.isPublished
          }))
          setCourses(mapped)
        }
      } catch (err) {
        console.error('❌ Error fetching featured courses:', err)
      }
    }

    fetchCourses()
  }, [getAllCourses, limit])

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

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 animate-pulse">
                <div className="h-40 bg-white/10"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No courses available at the moment.</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && courses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/courses/${course.slug}`}>
                    <div className="group bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-[#FF6B35]/50 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                      {/* Course Image */}
                      <div className="relative h-40 overflow-hidden bg-linear-to-br from-[#FF6B35]/20 to-[#2A434E]">
                        {course.coverImage ? (
                          <img
                            src={course.coverImage}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-[#FF6B35]/20 flex items-center justify-center">
                              <GraduationCap className="w-8 h-8 text-[#FF6B35]" />
                            </div>
                          </div>
                        )}
                        
                        {/* Program Badge */}
                        {course.program && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-[#2A434E]">
                            {course.program.title}
                          </div>
                        )}
                      </div>

                      {/* Course Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FF6B35] transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                          {course.description}
                        </p>

                        {/* Course Meta */}
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-3">
                            {course.estimatedHours && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{course.estimatedHours}h</span>
                              </div>
                            )}
                            {course.objectives && course.objectives.length > 0 && (
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                <span>{course.objectives.length} objectives</span>
                              </div>
                            )}
                          </div>
                          
                          <ArrowRight className="w-4 h-4 text-[#FF6B35] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View All Courses Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link href="/courses">
                <button className="px-8 py-4 border-2 border-[#FF6B35] text-[#FF6B35] rounded-full font-semibold hover:bg-[#FF6B35] hover:text-white transition-all duration-300 flex items-center gap-2 mx-auto group">
                  Browse All Courses
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}