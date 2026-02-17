'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { 
  Loader2, Users, BookOpen, Target, CheckCircle2, Award, 
  GraduationCap, ArrowRight, Play, Lock, ChevronDown, ChevronUp,
  Clock, FileText, Video
} from 'lucide-react'
import { programService } from '@/services/programService'
import { enrollmentService } from '@/services/enrollmentService'
import { Program } from '@/types'
import Link from 'next/link'
import { EnrollmentModal } from '@/components/modals/EnrollmentModal'

interface CourseWithModules {
  _id: string
  title: string
  description: string
  order: number
  estimatedHours?: number
  modules?: Module[]
}

interface Module {
  _id: string
  title: string
  description?: string
  order: number
  lessons?: Lesson[]
}

interface Lesson {
  _id: string
  title: string
  description?: string
  order: number
  duration?: number
  type?: string
}

export default function ProgramDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [program, setProgram] = useState<Program | null>(null)
  const [courses, setCourses] = useState<CourseWithModules[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(true)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Check if user is enrolled in this program
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!program) return
      
      setCheckingEnrollment(true)
      const enrollmentsRes = await enrollmentService.getMyEnrollments()
      
      if (enrollmentsRes.success && enrollmentsRes.data) {
        const enrolled = enrollmentsRes.data.some(
          (enrollment: any) => enrollment.program._id === program._id
        )
        setIsEnrolled(enrolled)
      }
      setCheckingEnrollment(false)
    }

    checkEnrollment()
  }, [program])

  // Fetch program and its courses
  useEffect(() => {
    const fetchProgramData = async () => {
      if (!slug) return
      
      setLoading(true)
      setError(null)

      try {
        // Fetch program details
        const programRes = await programService.getProgramBySlug(slug)
        
        if (!programRes.success || !programRes.data) {
          setError(programRes.error || 'Program not found')
          setLoading(false)
          return
        }

        setProgram(programRes.data)

        // Fetch courses for this program
        // You might need to adjust this based on your API
        // Option 1: If program data includes course IDs
        if (programRes.data.courses && programRes.data.courses.length > 0) {
          // If courses are populated objects
          if (typeof programRes.data.courses[0] === 'object') {
            // Transform courses to match CourseWithModules type
            const transformedCourses: CourseWithModules[] = programRes.data.courses.map((course: any) => ({
              _id: course._id,
              title: course.title,
              description: course.description || '',
              order: course.order || 0,
              estimatedHours: course.estimatedHours,
              modules: Array.isArray(course.modules) && typeof course.modules[0] === 'object' 
                ? course.modules 
                : []
            }))
            setCourses(transformedCourses)
          } else {
            // If courses are just IDs, fetch each course
            // This is where you'd call an API to get full course details
            console.log('Courses are IDs, need to fetch full details')
          }
        }

        // Option 2: If there's a separate endpoint to get program courses
        // Uncomment and adjust if you have this endpoint:
        /*
        if (programRes.data._id) {
          const coursesRes = await programService.getProgramCourses(programRes.data._id)
          if (coursesRes.success && coursesRes.data) {
            setCourses(coursesRes.data)
          }
        }
        */

      } catch (err) {
        console.error('Error fetching program data:', err)
        setError('Failed to load program details')
      } finally {
        setLoading(false)
      }
    }

    fetchProgramData()
  }, [slug])

  const handleEnrollClick = () => {
    setShowEnrollmentModal(true)
  }

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
  }

  // Calculate total lessons and duration
  const totalLessons = courses.reduce((total, course) => {
    return total + (course.modules?.reduce((moduleTotal, module) => {
      return moduleTotal + (module.lessons?.length || 0)
    }, 0) || 0)
  }, 0)

  const totalDuration = courses.reduce((total, course) => {
    return total + (course.modules?.reduce((moduleTotal, module) => {
      return moduleTotal + (module.lessons?.reduce((lessonTotal, lesson) => {
        return lessonTotal + (lesson.duration || 0)
      }, 0) || 0)
    }, 0) || 0)
  }, 0)

  if (loading) {
    return (
      <main className="min-h-screen bg-[#2A434E] text-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF6B35]" />
      </main>
    )
  }

  if (error || !program) {
    return (
      <main className="min-h-screen bg-[#2A434E] text-white flex flex-col items-center justify-center px-4">
        <h2 className="text-3xl font-bold mb-4">Program Not Found</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link href="/allPrograms" className="px-6 py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-lg transition">
          Back to Programs
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#2A434E] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#FF6B35]/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-bold mb-6">{program.title}</h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">{program.description}</p>

              {/* Enrollment Status Badge */}
              {checkingEnrollment ? (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Checking enrollment status...</span>
                </div>
              ) : isEnrolled ? (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-500 font-semibold">You're enrolled in this program</span>
                </div>
              ) : (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <Lock className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-yellow-500 font-semibold">Not enrolled yet</span>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                {isEnrolled && (
                  <Link
                    href={`/dashboard/students/myProgram/${program._id}`}
                    className="px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group"
                  >
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Continue Learning
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                
                {!isEnrolled && (
                  <>
                    <button
                      onClick={handleEnrollClick}
                      className="px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group"
                    >
                      <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Enroll Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <Link
                      href="/allPrograms"
                      className="px-8 py-4 border border-white/20 hover:bg-white/5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                    >
                      Browse Other Programs
                    </Link>
                  </>
                )}
              </div>
            </motion.div>

            {/* Right */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                {program.coverImage ? (
                  <img
                    src={program.coverImage}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-[#FF6B35]/20 to-[#2A434E] flex items-center justify-center">
                    <GraduationCap className="w-32 h-32 text-white/20" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Program Content */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Objectives */}
            {program.objectives && program.objectives.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {program.objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#FF6B35] mt-1 shrink-0" />
                      <p className="text-gray-300">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
              
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No courses available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.sort((a, b) => a.order - b.order).map((course, courseIdx) => (
                    <div key={course._id} className="border border-white/10 rounded-xl overflow-hidden">
                      {/* Course Header */}
                      <button
                        onClick={() => toggleCourse(course._id)}
                        className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] font-bold">
                            {courseIdx + 1}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                            <p className="text-sm text-gray-400">
                              {course.modules?.length || 0} modules • {course.estimatedHours || 0} hours
                            </p>
                          </div>
                        </div>
                        {expandedCourses.has(course._id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {/* Course Content */}
                      {expandedCourses.has(course._id) && (
                        <div className="px-6 py-4 space-y-3">
                          {course.description && (
                            <p className="text-gray-300 text-sm mb-4">{course.description}</p>
                          )}

                          {/* Modules */}
                          {course.modules && course.modules.length > 0 ? (
                            <div className="space-y-2">
                              {course.modules.sort((a, b) => a.order - b.order).map((module, moduleIdx) => (
                                <div key={module._id} className="border border-white/5 rounded-lg overflow-hidden">
                                  {/* Module Header */}
                                  <button
                                    onClick={() => toggleModule(module._id)}
                                    className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-semibold text-[#FF6B35]">
                                        Module {moduleIdx + 1}
                                      </span>
                                      <span className="text-sm font-medium">{module.title}</span>
                                      <span className="text-xs text-gray-400">
                                        ({module.lessons?.length || 0} lessons)
                                      </span>
                                    </div>
                                    {expandedModules.has(module._id) ? (
                                      <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>

                                  {/* Lessons */}
                                  {expandedModules.has(module._id) && module.lessons && (
                                    <div className="px-4 py-2 space-y-1">
                                      {module.lessons.sort((a, b) => a.order - b.order).map((lesson, lessonIdx) => (
                                        <div
                                          key={lesson._id}
                                          className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded transition-all"
                                        >
                                          <div className="flex items-center gap-2 flex-1">
                                            {lesson.type === 'video' ? (
                                              <Video className="w-4 h-4 text-blue-400" />
                                            ) : (
                                              <FileText className="w-4 h-4 text-green-400" />
                                            )}
                                            <span className="text-sm text-gray-300">{lesson.title}</span>
                                          </div>
                                          {lesson.duration && (
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                              <Clock className="w-3 h-3" />
                                              <span>{lesson.duration} min</span>
                                            </div>
                                          )}
                                          {!isEnrolled && <Lock className="w-4 h-4 text-gray-500" />}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No modules available</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Target Audience */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-[#FF6B35]" />
                <h3 className="text-xl font-bold">Target Audience</h3>
              </div>
              <p className="text-gray-300">{program.targetAudience || 'Not specified'}</p>
            </div>

            {/* Program Stats */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Program Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duration</span>
                  <span className="font-semibold">
                    {totalDuration > 0 ? `${Math.ceil(totalDuration / 60)} hours` : (program.estimatedHours || 'Self-paced')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Courses</span>
                  <span className="font-semibold">{courses.length} Courses</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Lessons</span>
                  <span className="font-semibold">{totalLessons} Lessons</span>
                </div>
              </div>
            </div>

            {/* Scholarship Notice */}
            {!isEnrolled && (
              <div className="bg-linear-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-purple-300">Scholarship Available</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Have a scholarship code? You can get 100% free access to this program during enrollment.
                </p>
                <button
                  onClick={handleEnrollClick}
                  className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-300 font-semibold transition-all duration-300"
                >
                  Apply Scholarship Code
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isEnrolled && (
        <section className="px-4 py-16 bg-linear-to-br from-[#FF6B35]/10 to-transparent text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
            <p className="text-gray-300 mb-8 text-lg">
              Join thousands of students and start your learning journey today
            </p>
            <button
              onClick={handleEnrollClick}
              disabled={checkingEnrollment}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold text-lg transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Start Learning Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      )}

      <Footer />

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        program={{
          _id: program._id,
          title: program.title,
          price: program.price || 0,
          currency: program.currency || 'USD'
        }}
      />
    </main>
  )
}