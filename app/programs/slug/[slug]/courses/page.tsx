'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import {
  Loader2, BookOpen, CheckCircle2, ArrowRight, Play, Lock,
  ChevronDown, ChevronUp, Clock, FileText, Video,
  GraduationCap, Layers, ArrowLeft, BarChart2, Target
} from 'lucide-react'
import { programService } from '@/services/programService'
import { enrollmentService } from '@/services/enrollmentService'
import { Program, Course, CourseModule, Lesson, Enrollment } from '@/types'
import Link from 'next/link'
import { EnrollmentModal } from '@/components/modals/EnrollmentModal'

/** CourseModule with lessons always as full Lesson objects */
interface PopulatedModule extends Omit<CourseModule, 'lessons'> {
  lessons: Lesson[]
}

/** Course with all modules fully populated */
interface PopulatedCourse extends Omit<Course, 'modules'> {
  modules: PopulatedModule[]
}

export default function CourseDetailPage() {
  const params   = useParams()
  const slug     = params.slug as string
  const courseId = params.courseId as string

  const [program, setProgram]                     = useState<Program | null>(null)
  const [course, setCourse]                       = useState<PopulatedCourse | null>(null)
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled]               = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(true)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [expandedModules, setExpandedModules]     = useState<Set<string>>(new Set())
  const [allExpanded, setAllExpanded]             = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!slug || !courseId) return
      setLoading(true)
      setError(null)

      try {
        // 1. Fetch program (for breadcrumb + EnrollmentModal)
        const programRes = await programService.getProgramBySlug(slug)
        if (!programRes.success || !programRes.data) {
          setError('Program not found')
          return
        }
        const prog = programRes.data
        setProgram(prog)

        // 2. Fetch full nested data
        const detailsRes = await programService.getProgramWithAllDetails(prog._id, 'full')
        const source: Program = detailsRes.success && detailsRes.data ? detailsRes.data : prog

        // 3. Find this course inside the program
        const rawCourse = (source.courses as Array<string | Course>).find(
          (c): c is Course => typeof c === 'object' && c._id === courseId
        )

        if (!rawCourse) {
          setError('Course not found in this program')
          return
        }

        // 4. Transform modules + lessons
        const populatedCourse: PopulatedCourse = {
          ...rawCourse,
          modules: Array.isArray(rawCourse.modules)
            ? (rawCourse.modules as Array<string | CourseModule>)
                .filter((m): m is CourseModule => typeof m === 'object')
                .map((mod) => ({
                  ...mod,
                  lessons: Array.isArray(mod.lessons)
                    ? (mod.lessons as Array<string | Lesson>).filter(
                        (l): l is Lesson => typeof l === 'object'
                      )
                    : [],
                }))
            : [],
        }

        setCourse(populatedCourse)

        // 5. Check enrollment
        const enrollRes = await enrollmentService.getMyEnrollments()
        if (enrollRes.success && enrollRes.data) {
          setIsEnrolled(
            (enrollRes.data as Enrollment[]).some(
              (e) => (e as any).program?._id === prog._id
            )
          )
        }
        setCheckingEnrollment(false)

      } catch (err) {
        console.error(err)
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, courseId])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId)
      return next
    })
  }

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedModules(new Set())
    } else {
      setExpandedModules(new Set(course?.modules.map((m) => m._id) ?? []))
    }
    setAllExpanded(!allExpanded)
  }

  // ── Derived stats ──────────────────────────────────────────────
  const sortedModules = course ? [...course.modules].sort((a, b) => a.order - b.order) : []

  const totalLessons  = sortedModules.reduce((t, m) => t + m.lessons.length, 0)

  // duration is stored in minutes per CourseModule type
  const totalMinutes  = sortedModules.reduce((t, m) => {
    const moduleMin = m.lessons.reduce((lt, l) => lt + (l.duration ?? 0), 0)
    return t + (moduleMin || m.duration || 0)
  }, 0)
  const durationHours = Math.floor(totalMinutes / 60)
  const durationMins  = totalMinutes % 60

  // ── Loading / error ────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF6B35]" />
          <p className="text-gray-400 text-sm animate-pulse">Loading course...</p>
        </div>
      </main>
    )
  }

  if (error || !course || !program) {
    return (
      <main className="min-h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center px-4">
        <BookOpen className="w-20 h-20 text-gray-600 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Course Not Found</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <Link href={`/programs/${slug}`} className="px-6 py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition">
          Back to Program
        </Link>
      </main>
    )
  }

  const durationLabel = totalMinutes
    ? durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`
    : course.estimatedHours ? `${course.estimatedHours}h` : 'Self-paced'

  return (
    <main className="min-h-screen bg-[#0D1117] text-white">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative px-4 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/6 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF6B35]/4 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-gray-500 mb-10 flex-wrap"
          >
            <Link href="/" className="hover:text-gray-300 transition">Home</Link>
            <span>/</span>
            <Link href="/allPrograms" className="hover:text-gray-300 transition">Programs</Link>
            <span>/</span>
            <Link href={`/programs/${slug}`} className="hover:text-gray-300 transition truncate max-w-[160px]">
              {program.title}
            </Link>
            <span>/</span>
            <span className="text-gray-300 truncate max-w-xs">{course.title}</span>
          </motion.nav>

          {/* Back link */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <Link
              href={`/programs/${slug}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FF6B35] transition text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {program.title}
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left — title + meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-[#FF6B35] text-xs font-semibold uppercase tracking-wider mb-5">
                <Layers className="w-3 h-3" />
                Course {course.order || ''}
              </span>

              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-5 leading-tight">
                {course.title}
              </h1>
              <p className="text-gray-300 leading-relaxed mb-8 max-w-2xl">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                {[
                  { icon: Layers,    label: `${sortedModules.length} Modules` },
                  { icon: BookOpen,  label: `${totalLessons} Lessons` },
                  { icon: Clock,     label: durationLabel },
                  {
                    icon: BarChart2,
                    label: Array.isArray(course.level)
                      ? course.level.join(', ')
                      : (course.level || 'All Levels'),
                  },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icon className="w-4 h-4 text-[#FF6B35]" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Enrollment badge */}
              {!checkingEnrollment && (
                isEnrolled ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-6">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-semibold">
                      You're enrolled — full access unlocked
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-6">
                    <Lock className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400 font-semibold">
                      Enroll to unlock all lessons
                    </span>
                  </div>
                )
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                {isEnrolled ? (
                  <Link
                    href={`/dashboard/students/myProgram/${program._id}`}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[#FF6B35]/20 group"
                  >
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Continue Learning
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowEnrollmentModal(true)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[#FF6B35]/20 group"
                  >
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Enroll to Access This Course
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Right — sticky overview card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="bg-[#161B22] border border-white/8 rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Course Overview</h3>
                <div className="space-y-1 mb-6">
                  {[
                    { label: 'Modules',  value: sortedModules.length },
                    { label: 'Lessons',  value: totalLessons },
                    { label: 'Duration', value: durationLabel },
                    {
                      label: 'Level',
                      value: Array.isArray(course.level)
                        ? course.level.join(', ')
                        : (course.level || 'All Levels'),
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between py-2.5 border-b border-white/5 last:border-0"
                    >
                      <span className="text-gray-400 text-sm">{label}</span>
                      <span className="font-semibold text-sm capitalize">{value}</span>
                    </div>
                  ))}
                </div>
                {!isEnrolled && (
                  <button
                    onClick={() => setShowEnrollmentModal(true)}
                    className="w-full py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all"
                  >
                    Enroll Now
                  </button>
                )}
                <Link
                  href={`/programs/${slug}`}
                  className="block w-full text-center mt-3 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium transition-all"
                >
                  View Full Program
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── OBJECTIVES ────────────────────────────────────────── */}
      {course.objectives && course.objectives.length > 0 && (
        <section className="px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#161B22] border border-white/8 rounded-2xl p-8"
            >
              <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                <Target className="w-5 h-5 text-[#FF6B35]" />
                What You'll Learn in This Course
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B35] mt-0.5 shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── MODULE LIST ───────────────────────────────────────── */}
      <section className="px-4 py-8 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#161B22] border border-white/8 rounded-2xl p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Layers className="w-5 h-5 text-[#FF6B35]" />
                  Course Modules
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {sortedModules.length} modules · {totalLessons} lessons
                </p>
              </div>
              <button onClick={toggleAll} className="text-sm text-[#FF6B35] hover:underline font-medium">
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </button>
            </div>

            {sortedModules.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Layers className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No modules available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedModules.map((module, mIdx) => {
                  const isOpen        = expandedModules.has(module._id)
                  const sortedLessons = [...module.lessons].sort((a, b) => a.order - b.order)
                  const moduleMins    = sortedLessons.reduce((t, l) => t + (l.duration ?? 0), 0) || module.duration

                  return (
                    <div key={module._id} className="border border-white/8 rounded-xl overflow-hidden">
                      {/* Module header */}
                      <button
                        onClick={() => toggleModule(module._id)}
                        className="w-full flex items-center text-left hover:bg-white/4 transition-all"
                      >
                        <div className="flex-shrink-0 w-14 flex items-center justify-center bg-[#FF6B35]/10 self-stretch py-5">
                          <span className="text-[#FF6B35] font-bold">
                            {String(mIdx + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex-1 px-5 py-5 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-base text-white">{module.title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {sortedLessons.length} lessons
                              {moduleMins > 0 && ` · ${moduleMins >= 60
                                ? `${Math.floor(moduleMins / 60)}h ${moduleMins % 60}m`
                                : `${moduleMins}m`}`}
                            </p>
                          </div>
                          {isOpen
                            ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                            : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
                        </div>
                      </button>

                      {/* Lessons */}
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-white/5 bg-[#0D1117]/60"
                        >
                          {module.description && (
                            <p className="text-gray-400 text-sm px-6 pt-4 pb-2 leading-relaxed">
                              {module.description}
                            </p>
                          )}

                          {sortedLessons.length > 0 ? (
                            <ul className="divide-y divide-white/5">
                              {sortedLessons.map((lesson, lIdx) => {
                                // Lessons with no auth gate — show as accessible
                                const canAccess = isEnrolled
                                return (
                                  <li
                                    key={lesson._id}
                                    className={`flex items-center gap-4 px-6 py-4 transition-all ${
                                      canAccess ? 'hover:bg-white/4' : 'opacity-60'
                                    }`}
                                  >
                                    <span className="text-xs text-gray-600 w-6 shrink-0 text-right">
                                      {lIdx + 1}
                                    </span>

                                    <div className="shrink-0">
                                      {lesson.type === 'video'
                                        ? <Video className="w-4 h-4 text-blue-400" />
                                        : <FileText className="w-4 h-4 text-emerald-400" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-200 truncate">{lesson.title}</p>
                                      {lesson.content && (
                                        <p className="text-xs text-gray-500 truncate mt-0.5 line-clamp-1">
                                          {lesson.content.replace(/<[^>]*>/g, '').slice(0, 80)}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                      {lesson.duration && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <Clock className="w-3 h-3" />
                                          <span>{lesson.duration} min</span>
                                        </div>
                                      )}
                                      {!canAccess
                                        ? <Lock className="w-4 h-4 text-gray-600" />
                                        : <Play className="w-4 h-4 text-[#FF6B35] opacity-70" />}
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic px-6 py-4">
                              No lessons in this module yet.
                            </p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Bottom CTA for unenrolled */}
          {!isEnrolled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 p-8 bg-gradient-to-br from-[#FF6B35]/10 to-transparent border border-[#FF6B35]/15 rounded-2xl text-center"
            >
              <h3 className="text-2xl font-bold mb-3">Want full access?</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Enroll in{' '}
                <strong className="text-white">{program.title}</strong> to unlock all modules and
                lessons in this course.
              </p>
              <button
                onClick={() => setShowEnrollmentModal(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-bold transition-all shadow-lg shadow-[#FF6B35]/20 group"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Enroll Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />

      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        program={{
          _id: program._id,
          title: program.title,
          price: program.price ?? 0,
          currency: program.currency ?? 'USD',
        }}
      />
    </main>
  )
}