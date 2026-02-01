// app/courses/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCourses } from '@/hooks/useCourses'
import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { 
  Clock, 
  ArrowRight, 
  BookOpen, 
  FileText, 
  Search,
  Filter,
  Loader2,
  GraduationCap
} from 'lucide-react'

interface Course {
  _id: string
  title: string
  description: string
  slug: string
  estimatedHours?: number
  coverImage?: string
  program: {
    _id: string
    title: string
    slug: string
  }
  objectives?: string[]
}

export default function CoursesPage() {
  const { getAllCourses, loading, error } = useCourses()
  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [programs, setPrograms] = useState<Array<{ _id: string; title: string }>>([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const params: any = {}
        if (selectedProgram) params.programId = selectedProgram
        if (searchQuery) params.search = searchQuery

        const response = await getAllCourses(params)
        if (response?.data) {
          setCourses(response.data)
          
          // Extract unique programs
          const uniquePrograms = response.data.reduce((acc: any[], course: Course) => {
            if (course.program && !acc.find(p => p._id === course.program._id)) {
              acc.push(course.program)
            }
            return acc
          }, [])
          setPrograms(uniquePrograms)
        }
      } catch (err) {
        console.error('Error fetching courses:', err)
      }
    }

    fetchCourses()
  }, [getAllCourses, selectedProgram, searchQuery])

  return (
    <main className="min-h-screen bg-[#2A434E] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#FF6B35]/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Explore Our Courses
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover comprehensive courses designed to transform your career in tech
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all"
              />
            </div>

            {/* Program Filter */}
            <div className="relative md:w-64">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all appearance-none cursor-pointer"
              >
                <option value="">All Programs</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-[#FF6B35]" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No Courses Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || selectedProgram
                  ? 'Try adjusting your search or filters'
                  : 'No courses are currently available'}
              </p>
              {(searchQuery || selectedProgram) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedProgram('')
                  }}
                  className="px-6 py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <>
              <div className="mb-6 text-gray-400">
                Showing {courses.length} {courses.length === 1 ? 'course' : 'courses'}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, idx) => (
                  <Link 
                    key={course._id} 
                    href={`/courses/${course.slug || course._id}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-[#FF6B35]/50 transition-all duration-300 group cursor-pointer"
                    >
                      {/* Course Image */}
                      <div className="relative aspect-video bg-linear-to-br from-[#FF6B35]/20 to-[#2A434E] overflow-hidden">
                        {course.coverImage ? (
                          <img 
                            src={course.coverImage} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <GraduationCap className="w-20 h-20 text-white/20" />
                          </div>
                        )}
                        
                        {/* Program Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-[#FF6B35] text-white text-xs font-semibold rounded-full">
                            {course.program.title}
                          </span>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-[#FF6B35] transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        
                        <p className="text-gray-300 mb-4 line-clamp-3 text-sm">
                          {course.description}
                        </p>

                        {/* Course Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          {course.estimatedHours && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{course.estimatedHours}h</span>
                            </div>
                          )}
                          {course.objectives && course.objectives.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{course.objectives.length} objectives</span>
                            </div>
                          )}
                        </div>

                        {/* View Course Button */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <span className="text-sm font-semibold text-[#FF6B35]">
                            View Course
                          </span>
                          <ArrowRight className="w-5 h-5 text-[#FF6B35] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!loading && !error && courses.length > 0 && (
        <section className="px-4 py-16 bg-linear-to-br from-[#FF6B35]/10 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students learning cutting-edge tech skills
            </p>
            <Link
              href="/programs"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold text-lg transition-all duration-300 group"
            >
              Explore All Programs
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}