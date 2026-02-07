'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { Loader2, Users, BookOpen, Target, CheckCircle2, Award, GraduationCap, ArrowRight, Play, Lock } from 'lucide-react'
import { programService } from '@/services/programService'
import { enrollmentService } from '@/services/enrollmentService'
import { Program } from '@/types'
import Link from 'next/link'
import { EnrollmentModal } from '@/components/modals/EnrollmentModal'

export default function ProgramDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(true)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)

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

  useEffect(() => {
    const fetchProgram = async () => {
      if (!slug) return
      setLoading(true)
      const res = await programService.getProgramBySlug(slug)
      if (res.success && res.data) {
        setProgram(res.data)
        setError(null)
      } else {
        setProgram(null)
        setError(res.error || 'Program not found')
      }
      setLoading(false)
    }
    fetchProgram()
  }, [slug])

  const handleEnrollClick = () => {
    setShowEnrollmentModal(true)
  }

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
                {(
                  <Link
                    href={`/students/myProgram/${program._id}/learn`}
                    className="px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group"
                  >
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Continue Learning
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) }
                
                {!isEnrolled && (
                  <Link
                    href="/allPrograms"
                    className="px-8 py-4 border border-white/20 hover:bg-white/5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    Browse Other Programs
                  </Link>
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

      {/* Program Details */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {program.objectives && program.objectives.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-[#FF6B35]" />
                <h3 className="text-xl font-bold">Target Audience</h3>
              </div>
              <p className="text-gray-300">{program.targetAudience || 'Not specified'}</p>
            </div>

            {/* Course Stats */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Program Details</h3>
              <div className="space-y-3">
                {/* <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price</span>
                  <span className="font-semibold text-[#FF6B35]">
                    {program.price === 0 ? 'Free' : `${program.currency === 'NGN' ? '₦' : '$'}${program.price?.toLocaleString()}`}
                  </span>
                </div> */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duration</span>
                  <span className="font-semibold">{program.estimatedHours || 'Self-paced'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Courses</span>
                  <span className="font-semibold">{program.courses?.length || 0} Courses</span>
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