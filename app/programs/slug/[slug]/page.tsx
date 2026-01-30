'use client'

import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { useParams } from 'next/navigation'
import { useProgramBySlug } from '@/hooks/useProgram'
import { motion } from 'framer-motion'
import { Clock, BookOpen, Users, Award, CheckCircle, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ProgramDetailPage() {
  const params = useParams()
  const [slug, setSlug] = useState<string | null>(null)

  useEffect(() => {
    console.log('===== PROGRAM DETAIL PAGE =====')
    console.log('Full params:', params)
    console.log('params.slug:', params?.slug)
    
    if (params?.slug) {
      const extractedSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug
      console.log('Extracted slug:', extractedSlug)
      setSlug(extractedSlug)
    }
    console.log('================================')
  }, [params])

  // Use the slug hook to fetch program data
  const { program, loading, error } = useProgramBySlug(slug || "")
  
  useEffect(() => {
    if (program) {
      console.log('✅ Program loaded:', program.title)
    }
    if (error) {
      console.error('❌ Error loading program:', error)
    }
  }, [program, error])

  // Early return if no slug yet
  if (!slug) {
    console.log('⏳ Waiting for slug...')
    return null
  }

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#2A434E]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Loading program...</p>
          </div>
        </div>
      </main>
    )
  }

  // Error or not found state
  if (error || !program) {
    return (
      <main className="min-h-screen bg-[#2A434E]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md px-4">
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 text-xl mb-2">Program Not Found</p>
            <p className="text-gray-400 mb-6">{error || `No program found with slug: ${slug}`}</p>
            <Link href="/allPrograms">
              <button className="px-6 py-3 bg-[#FF6B35] text-white rounded-full hover:bg-[#f85a28] transition-colors">
                Back to Programs
              </button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#2A434E]">
      <Navbar />

      {/* Hero Section - ✅ FIXED: bg-linear-to-b → bg-gradient-to-b */}
      <section className="relative pt-24 pb-12 px-4 bg-gradient-to-b from-[#1f3238] to-[#2A434E]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {program.category && (
                <div className="inline-block bg-[#FF6B35]/20 text-[#FF6B35] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  {program.category}
                </div>
              )}
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {program.title}
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                {program.description}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {program.estimatedHours && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <Clock className="w-5 h-5 text-[#FF6B35] mb-2" />
                    <div className="text-2xl font-bold text-white">{program.estimatedHours}h</div>
                    <div className="text-xs text-gray-400">Total Duration</div>
                  </div>
                )}
                
                {program.courses && Array.isArray(program.courses) && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <BookOpen className="w-5 h-5 text-[#FF6B35] mb-2" />
                    <div className="text-2xl font-bold text-white">{program.courses.length}</div>
                    <div className="text-xs text-gray-400">Courses</div>
                  </div>
                )}
                
                {program.instructors && Array.isArray(program.instructors) && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <Users className="w-5 h-5 text-[#FF6B35] mb-2" />
                    <div className="text-2xl font-bold text-white">{program.instructors.length}</div>
                    <div className="text-xs text-gray-400">Instructors</div>
                  </div>
                )}
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <Award className="w-5 h-5 text-[#FF6B35] mb-2" />
                  <div className="text-2xl font-bold text-white">✓</div>
                  <div className="text-xs text-gray-400">Certificate</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-[#FF6B35] text-white rounded-full font-semibold hover:bg-[#f85a28] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/50">
                  Enroll Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
                  Download Syllabus
                </button>
              </div>
            </motion.div>

            {/* Right Content - Image/Card - ✅ FIXED: bg-linear-to-br → bg-gradient-to-br */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                {program.bannerImage || program.coverImage ? (
                  <img 
                    src={program.bannerImage || program.coverImage} 
                    alt={program.title}
                    className="w-full h-64 object-cover rounded-xl mb-6"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-[#FF6B35]/20 to-[#2A434E] rounded-xl mb-6 flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-[#FF6B35]/50" />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-gray-400">Program Fee</span>
                    <span className="text-3xl font-bold text-white">
                      {program.price && program.price > 0 
                        ? `${program.currency === 'NGN' ? '₦' : '$'}${program.price.toLocaleString()}`
                        : 'Free'
                      }
                    </span>
                  </div>

                  {program.isSelfPaced && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#FF6B35]" />
                      <span>Self-paced learning</span>
                    </div>
                  )}

                  {program.startDate && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-5 h-5 text-[#FF6B35]" />
                      <span>Starts {new Date(program.startDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {program.certificateTemplate && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Award className="w-5 h-5 text-[#FF6B35]" />
                      <span>Certificate upon completion</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Target Audience */}
              {program.targetAudience && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Who This Program Is For</h2>
                  <p className="text-gray-300">{program.targetAudience}</p>
                </div>
              )}

              {/* Prerequisites */}
              {program.prerequisites && program.prerequisites.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Prerequisites</h2>
                  <ul className="space-y-2">
                    {program.prerequisites.map((prereq, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Courses in Program */}
              {program.courses && Array.isArray(program.courses) && program.courses.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-6">Courses in This Program</h2>
                  <div className="space-y-4">
                    {program.courses.map((course: any, idx: number) => (
                      <Link key={course._id || idx} href={`/courses/${course.slug || course._id}`}>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#FF6B35]/50 transition-all duration-300 group">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="text-sm text-gray-400 mb-2">Course {idx + 1}</div>
                              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF6B35] transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-gray-300 mb-4">{course.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                {course.totalDuration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{course.totalDuration}h</span>
                                  </div>
                                )}
                                {course.level && (
                                  <div className="px-2 py-1 bg-white/5 rounded text-xs">
                                    {course.level}
                                  </div>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Instructors */}
              {program.instructors && Array.isArray(program.instructors) && program.instructors.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Your Instructors</h3>
                  <div className="space-y-4">
                    {program.instructors.map((instructor: any) => (
                      <div key={instructor._id || instructor.id} className="flex items-center gap-3">
                        {instructor.avatar ? (
                          <img 
                            src={instructor.avatar} 
                            alt={instructor.name || `${instructor.firstName} ${instructor.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] font-bold">
                            {(instructor.name || instructor.firstName || 'I')[0]}
                          </div>
                        )}
                        <div>
                          <div className="text-white font-semibold">
                            {instructor.name || `${instructor.firstName} ${instructor.lastName}`}
                          </div>
                          <div className="text-sm text-gray-400">Instructor</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {program.tags && program.tags.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Skills You'll Gain</h3>
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enroll CTA - ✅ FIXED: bg-linear-to-br → bg-gradient-to-br */}
              <div className="bg-gradient-to-br from-[#FF6B35] to-[#f85a28] rounded-2xl p-6 shadow-lg shadow-[#FF6B35]/20">
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Start?</h3>
                <p className="text-white/90 mb-4">Enroll now and begin your learning journey</p>
                <button className="w-full px-6 py-3 bg-white text-[#FF6B35] rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}