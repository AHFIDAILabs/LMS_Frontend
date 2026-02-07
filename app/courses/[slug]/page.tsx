// app/courses/[slug]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCourses } from '@/hooks/useCourses'
import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Users, 
  Award,
  Play,
  FileText,
  Target,
  GraduationCap,
  ArrowRight,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Module {
  _id: string
  title: string
  description: string
  order: number
  isPublished: boolean
  lessons?: any[]
}

interface CourseData {
  course: {
    _id: string
    title: string
    slug: string
    description: string
    coverImage?: string
    estimatedHours: number
    objectives: string[]
    prerequisites: string[]
    targetAudience: string
    isPublished: boolean
    program: {
      _id: string
      title: string
      slug: string
    }
    createdBy: {
      firstName: string
      lastName: string
      email: string
    }
  }
  modules: Module[]
  stats: {
    totalModules: number
    totalLessons: number
    totalAssessments: number
  }
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getCourseById, loading, error } = useCourses()
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor'>('overview')

  

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const slug = params.slug as string
        const data = await getCourseById(slug)
        setCourseData(data)
      } catch (err) {
        console.error('Error fetching course:', err)
      }
    }

    if (params.slug) {
      fetchCourse()
    }
  }, [params.slug, getCourseById])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#2A434E] text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF6B35]" />
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !courseData) {
    return (
      <main className="min-h-screen bg-[#2A434E] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'This course does not exist or is unavailable.'}</p>
          <Link 
            href="/courses"
            className="px-6 py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-lg transition-colors"
          >
            Back to Courses
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const { course, modules, stats } = courseData
  const instructor = course.createdBy


  return (
    <main className="min-h-screen bg-[#2A434E] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#FF6B35]/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block px-4 py-2 bg-[#FF6B35]/20 rounded-full mb-4">
                <span className="text-[#FF6B35] font-semibold">{course.program.title}</span>
              </div>
              
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {course.description}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-sm text-gray-400">Duration</span>
                  </div>
                  <p className="text-2xl font-bold">{course.estimatedHours}h</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-sm text-gray-400">Modules</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalModules}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-sm text-gray-400">Lessons</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalLessons}</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/student/courses/${course._id}/learn`}
                  className="px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group"
                >
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Start Learning
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl font-semibold transition-all duration-300">
                  Preview Course
                </button>
              </div>
            </motion.div>

            {/* Right Content - Course Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                {course.coverImage ? (
                  <img 
                    src={course.coverImage} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-[#FF6B35]/20 to-[#2A434E] flex items-center justify-center">
                    <GraduationCap className="w-32 h-32 text-white/20" />
                  </div>
                )}
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <Award className="w-10 h-10 text-[#FF6B35]" />
                  <div>
                    <p className="text-sm text-gray-400">Get Certified</p>
                    <p className="font-bold">Upon Completion</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'curriculum', label: 'Curriculum' },
              { id: 'instructor', label: 'Instructor' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 font-semibold transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[#FF6B35]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* What You'll Learn */}
                {course.objectives && course.objectives.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Target className="w-6 h-6 text-[#FF6B35]" />
                      <h2 className="text-2xl font-bold">What You'll Learn</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.objectives.map((objective, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#FF6B35] mt-1 shrink-0" />
                          <p className="text-gray-300">{objective}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Description */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                  <p className="text-gray-300 leading-relaxed">{course.description}</p>
                </div>

                {/* Prerequisites */}
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prereq, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <span className="text-[#FF6B35] mt-1">•</span>
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Target Audience */}
                {course.targetAudience && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6 text-[#FF6B35]" />
                      <h3 className="text-xl font-bold">Who This Is For</h3>
                    </div>
                    <p className="text-gray-300">{course.targetAudience}</p>
                  </div>
                )}

          {/* Instructor */}
<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
  <h3 className="text-xl font-bold mb-4">Instructor</h3>
  <div className="flex items-center gap-4">
    <div className="w-16 h-16 bg-linear-to-br from-[#FF6B35] to-[#FF8C35] rounded-full flex items-center justify-center text-2xl font-bold">
      {course.createdBy?.firstName?.[0] || '?'}
      {course.createdBy?.lastName?.[0] || '?'}
    </div>
    <div>
      <p className="font-semibold text-lg">
        {course.createdBy?.firstName || 'Unknown'} {course.createdBy?.lastName || ''}
      </p>
      <p className="text-sm text-gray-400">Course Instructor</p>
      {course.createdBy?.email && (
        <p className="text-sm text-gray-500">{course.createdBy.email}</p>
      )}
    </div>
  </div>
</div>


                {/* Course Stats */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4">Course Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Modules</span>
                      <span className="font-semibold">{stats.totalModules}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Lessons</span>
                      <span className="font-semibold">{stats.totalLessons}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Assessments</span>
                      <span className="font-semibold">{stats.totalAssessments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-semibold">{course.estimatedHours} hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'curriculum' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-bold mb-8">Course Curriculum</h2>
              
              {modules.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No modules available yet.</p>
                </div>
              ) : (
                modules
                  .sort((a, b) => a.order - b.order)
                  .map((module, idx) => (
                    <motion.div
                      key={module._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#FF6B35]/20 rounded-xl flex items-center justify-center">
                          <span className="text-[#FF6B35] font-bold">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                          <p className="text-gray-300 mb-4">{module.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            {module.lessons && (
                              <span className="flex items-center gap-1">
                                <Play className="w-4 h-4" />
                                {module.lessons.length} lessons
                              </span>
                            )}
                            {module.isPublished ? (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                Published
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                Coming Soon
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
              )}
            </motion.div>
          )}

          {activeTab === 'instructor' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 bg-linear-to-br from-[#FF6B35] to-[#FF8C35] rounded-full flex items-center justify-center text-3xl font-bold">
                    {course.createdBy?.firstName?.[0] || '?'}
                    {course.createdBy?.lastName?.[0] || '?'}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {course.createdBy?.firstName || 'Unknown'} {course.createdBy?.lastName || ''}
                    </h2>
                    <p className="text-gray-400">Course Instructor</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Contact</h3>
                    <p className="text-gray-300">
                      {course.createdBy?.email || 'No contact information available'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">About</h3>
                    <p className="text-gray-300">
                      Experienced instructor dedicated to delivering high-quality educational content.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-linear-to-br from-[#FF6B35]/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of students already learning with {course.title}
          </p>
          <Link
            href={`/student/courses/${course._id}/learn`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold text-lg transition-all duration-300 group"
          >
            <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Contact Us Now
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}