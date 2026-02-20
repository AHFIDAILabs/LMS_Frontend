'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import {
  Loader2, Users, BookOpen, Target, CheckCircle2, Award,
  GraduationCap, ArrowRight, Play, Lock, ChevronDown, ChevronUp,
  Clock, Layers, Video, FileText, BarChart2
} from 'lucide-react'
import { programService } from '@/services/programService'
import { enrollmentService } from '@/services/enrollmentService'
import { Program, Course, CourseModule, Lesson, Enrollment } from '@/types'
import Link from 'next/link'
import { EnrollmentModal } from '@/components/modals/EnrollmentModal'

interface PopulatedLesson extends Lesson {}

interface PopulatedModule extends Omit<CourseModule, 'lessons'> {
  lessons: PopulatedLesson[]
}

interface PopulatedCourse extends Omit<Course, 'modules'> {
  modules: PopulatedModule[]
}

export default function ProgramDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [program, setProgram]   = useState<Program | null>(null)
  const [courses, setCourses]   = useState<PopulatedCourse[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  const [isEnrolled, setIsEnrolled]                   = useState(false)
  const [checkingEnrollment, setCheckingEnrollment]   = useState(true)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)

  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // ── Fetch everything 
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return
      setLoading(true)
      setError(null)
      setDebugInfo('')

      try {
        // Step 1: Get program by slug
        console.log('[ProgramDetail] Fetching program by slug:', slug)
        const slugRes = await programService.getProgramBySlug(slug)
        console.log('[ProgramDetail] Slug response:', slugRes)

        if (!slugRes.success || !slugRes.data) {
          setError(slugRes.error || 'Program not found')
          setDebugInfo(`Slug lookup failed. Slug: "${slug}". Error: ${slugRes.error}`)
          return
        }

        const prog = slugRes.data
        setProgram(prog)
        console.log('[ProgramDetail] Program found:', prog._id, prog.title)
        console.log('[ProgramDetail] Courses on basic program:', prog.courses)

        // Step 2: Get full nested details
        console.log('[ProgramDetail] Fetching full details for:', prog._id)
        const fullRes = await programService.getProgramWithAllDetails(prog._id, 'full')
        console.log('[ProgramDetail] Full details response:', fullRes)

        const source: Program = fullRes.success && fullRes.data ? fullRes.data : prog
        console.log('[ProgramDetail] Source courses:', source.courses)

        let debugMsg = `Program: ${prog.title} (${prog._id})\n`
        debugMsg += `Courses in response: ${JSON.stringify(source.courses?.length ?? 0)}\n`

        if (!Array.isArray(source.courses) || source.courses.length === 0) {
          debugMsg += 'No courses array found in API response.\n'
          setDebugInfo(debugMsg)
          setLoading(false)
          return
        }

        // Step 3: Normalise — courses may be string[] or Course[]
        const rawCourses = source.courses as Array<string | Course>
        const objectCourses = rawCourses.filter((c): c is Course => typeof c === 'object')

        debugMsg += `Object courses (populated): ${objectCourses.length}\n`
        debugMsg += `String course IDs (not populated): ${rawCourses.length - objectCourses.length}\n`

        if (objectCourses.length === 0) {
          debugMsg += 'API returned course IDs only — backend needs to populate courses.modules.lessons.\n'
          setDebugInfo(debugMsg)
          setLoading(false)
          return
        }

        const populated: PopulatedCourse[] = objectCourses.map((course) => {
          const rawModules = Array.isArray(course.modules)
            ? course.modules as Array<string | CourseModule>
            : []
          const objectModules = rawModules.filter((m): m is CourseModule => typeof m === 'object')

          return {
            ...course,
            modules: objectModules.map((mod) => {
              const rawLessons = Array.isArray(mod.lessons)
                ? mod.lessons as Array<string | Lesson>
                : []
              return {
                ...mod,
                lessons: rawLessons.filter((l): l is Lesson => typeof l === 'object'),
              }
            }),
          }
        })

        debugMsg += `Populated courses: ${populated.length}\n`
        populated.forEach((c, i) => {
          debugMsg += `  Course ${i + 1}: "${c.title}" — ${c.modules.length} modules\n`
          c.modules.forEach((m, j) => {
            debugMsg += `    Module ${j + 1}: "${m.title}" — ${m.lessons.length} lessons\n`
          })
        })

        setDebugInfo(debugMsg)
        setCourses(populated)

      } catch (err: any) {
        console.error('[ProgramDetail] Error:', err)
        setError('Failed to load program details')
        setDebugInfo(`Exception: ${err?.message || String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  // ── Enrollment check
useEffect(() => {
  if (!program) return;

  const check = async () => {
    setCheckingEnrollment(true);

    try {
      const res = await enrollmentService.getMyEnrollments();

      if (res.success && res.data) {
        const isUserEnrolled = (res.data as any[]).some((e) => {
          // check ANY possible backend shape
          return (
            e.programId === program._id ||
            e.programId?._id === program._id ||
            e.program?._id === program._id
          );
        });

        setIsEnrolled(isUserEnrolled);
      }
    } catch (err) {
      console.error("Failed checking enrollment:", err);
    }

    setCheckingEnrollment(false);
  };

  check();
}, [program]);

  // ── Toggles
  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void, id: string) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setFn(next)
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const sortedCourses = [...courses].sort((a, b) => a.order - b.order)
  const totalModules  = courses.reduce((t, c) => t + c.modules.length, 0)
  const totalLessons  = courses.reduce((t, c) => t + c.modules.reduce((mt, m) => mt + m.lessons.length, 0), 0)
  const totalHours    = courses.reduce((t, c) => t + (c.estimatedHours ?? 0), 0)

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF6B35]" />
          <p className="text-gray-400 text-sm animate-pulse">Loading program...</p>
        </div>
      </main>
    )
  }

  if (error || !program) {
    return (
      <main className="min-h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center px-4 gap-4">
        <GraduationCap className="w-20 h-20 text-gray-600" />
        <h2 className="text-3xl font-bold">Program Not Found</h2>
        <p className="text-red-400">{error}</p>
        {/* Debug panel — remove in production */}
        {debugInfo && (
          <pre className="mt-4 p-4 bg-gray-900 rounded-xl text-xs text-gray-400 max-w-2xl w-full overflow-auto whitespace-pre-wrap">
            {debugInfo}
          </pre>
        )}
        <Link href="/allPrograms" className="mt-4 px-6 py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition">
          Browse All Programs
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0D1117] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative px-4 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#FF6B35]/8 via-transparent to-[#1a2a35]/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF6B35]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
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
            <span className="text-gray-300 truncate max-w-xs">{program.title}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              {program.category && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-[#FF6B35] text-xs font-semibold uppercase tracking-wider mb-6">
                  <Layers className="w-3 h-3" />
                  {program.category}
                </span>
              )}
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
                {program.title}
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl">
                {program.description}
              </p>

              <div className="flex flex-wrap gap-6 mb-8">
                {[
                  { icon: BookOpen,  label: `${sortedCourses.length} Course${sortedCourses.length !== 1 ? 's' : ''}` },
                  { icon: Layers,    label: `${totalModules} Module${totalModules !== 1 ? 's' : ''}` },
                  { icon: FileText,  label: `${totalLessons} Lesson${totalLessons !== 1 ? 's' : ''}` },
                  { icon: Clock,     label: totalHours ? `${totalHours}h total` : 'Self-paced' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icon className="w-4 h-4 text-[#FF6B35]" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Enrollment status */}
              {checkingEnrollment ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg mb-6">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Checking enrollment...</span>
                </div>
              ) : isEnrolled ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-6">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-semibold">You're enrolled — full access unlocked</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-6">
                  <Lock className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-semibold">Not enrolled yet</span>
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                {isEnrolled ? (
                  <Link
                    href={`/dashboard/students/myProgram/${program._id}`}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all group shadow-lg shadow-[#FF6B35]/20"
                  >
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Continue Learning
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => setShowEnrollmentModal(true)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all group shadow-lg shadow-[#FF6B35]/20"
                    >
                      <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Enroll Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <Link href="/allPrograms" className="inline-flex items-center gap-2 px-8 py-4 border border-white/15 hover:bg-white/5 rounded-xl font-semibold transition-all">
                      Browse Programs
                    </Link>
                  </>
                )}
              </div>
            </motion.div>

            {/* Right — cover card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#161B22]">
                <div className="aspect-video relative">
                  {program.coverImage ? (
                    <img src={program.coverImage} alt={program.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-[#FF6B35]/20 to-[#1a2a35] flex items-center justify-center">
                      <GraduationCap className="w-24 h-24 text-white/10" />
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-1">
                  {[
                    { label: 'Courses',  value: sortedCourses.length },
                    { label: 'Modules',  value: totalModules },
                    { label: 'Lessons',  value: totalLessons },
                    { label: 'Duration', value: totalHours ? `${totalHours}h` : 'Self-paced' },
                    { label: 'Level',    value: Array.isArray(program.level) ? program.level.join(', ') : (program.level || 'All Levels') },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-gray-400 text-sm">{label}</span>
                      <span className="font-bold text-white capitalize">{value}</span>
                    </div>
                  ))}
               {!isEnrolled ? (
    <button
      onClick={() => setShowEnrollmentModal(true)}
      className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all group shadow-lg shadow-[#FF6B35]/20"
    >
      <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
      Enroll Now
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </button>
) : (
    <Link
      href="/contact"
      className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all group shadow-lg shadow-blue-600/20"
    >
      Contact Us
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </Link>
)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ BODY*/}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-10">

            {/* Objectives */}
            {program.objectives && program.objectives.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-[#161B22] border border-white/8 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Target className="w-6 h-6 text-[#FF6B35]" />
                  What You'll Learn
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {program.objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#FF6B35] mt-0.5 shrink-0" />
                      <p className="text-gray-300 text-sm leading-relaxed">{obj}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── FULL CURRICULUM */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-[#161B22] border border-white/8 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-[#FF6B35]" />
                Full Curriculum
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''} · {totalModules} module{totalModules !== 1 ? 's' : ''} · {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
                {totalHours ? ` · ${totalHours}h` : ''}
              </p>

              {sortedCourses.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="mb-2">No course content available yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedCourses.map((course, cIdx) => {
                    const courseOpen    = expandedCourses.has(course._id)
                    const sortedMods    = [...course.modules].sort((a, b) => a.order - b.order)
                    const courseLessons = course.modules.reduce((t, m) => t + m.lessons.length, 0)

                    return (
                      /* ── COURSE*/
                      <div key={course._id} className="border border-white/8 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggle(expandedCourses, setExpandedCourses, course._id)}
                          className="w-full flex items-center text-left hover:bg-white/4 transition-all"
                        >
                          <div className="shrink-0 w-14 flex items-center justify-center bg-[#FF6B35]/10 self-stretch py-5">
                            <span className="text-[#FF6B35] font-bold text-lg">
                              {String(cIdx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="flex-1 flex items-center justify-between px-5 py-4">
                            <div>
                              <h3 className="font-bold text-base text-white leading-snug">{course.title}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {sortedMods.length} module{sortedMods.length !== 1 ? 's' : ''} · {courseLessons} lesson{courseLessons !== 1 ? 's' : ''}
                                {course.estimatedHours ? ` · ${course.estimatedHours}h` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {Array.isArray(course.level) && course.level.length > 0 && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500 border border-white/10 rounded-full px-2 py-0.5 capitalize">
                                  <BarChart2 className="w-3 h-3" />
                                  {course.level[0]}
                                </span>
                              )}
                              {courseOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </div>
                          </div>
                        </button>

                        {courseOpen && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                            className="border-t border-white/5 bg-[#0D1117]/50">
                            {course.description && (
                              <p className="text-gray-400 text-sm px-6 pt-4 pb-2 leading-relaxed">{course.description}</p>
                            )}
                            <div className="px-4 py-4 space-y-2">
                              {sortedMods.length === 0 ? (
                                <p className="text-sm text-gray-600 italic px-2">No modules published yet</p>
                              ) : sortedMods.map((mod, mIdx) => {
                                const modOpen       = expandedModules.has(mod._id)
                                const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order)
                                const modMins       = sortedLessons.reduce((t, l) => t + (l.duration ?? 0), 0) || mod.duration

                                return (
                                  /* ── MODULE  */
                                  <div key={mod._id} className="border border-white/6 rounded-lg overflow-hidden">
                                    <button
                                      onClick={() => toggle(expandedModules, setExpandedModules, mod._id)}
                                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-all text-left"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded-full shrink-0">
                                          M{mIdx + 1}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-200">{mod.title}</span>
                                      </div>
                                      <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-xs text-gray-500 hidden sm:block">
                                          {sortedLessons.length} lesson{sortedLessons.length !== 1 ? 's' : ''}
                                          {modMins > 0 && ` · ${modMins >= 60 ? `${Math.floor(modMins / 60)}h ${modMins % 60}m` : `${modMins}m`}`}
                                        </span>
                                        {modOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                      </div>
                                    </button>

                                    {modOpen && (
                                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
                                        className="border-t border-white/5 bg-[#0D1117]/70">
                                        {mod.description && (
                                          <p className="text-xs text-gray-500 px-5 pt-3 pb-1 leading-relaxed">{mod.description}</p>
                                        )}
                                        {sortedLessons.length === 0 ? (
                                          <p className="text-xs text-gray-600 italic px-5 py-3">No lessons published yet</p>
                                        ) : (
                                          /* ── LESSONS  */
                                          <ul className="divide-y divide-white/4">
                                            {sortedLessons.map((lesson, lIdx) => (
                                              <li key={lesson._id}
                                                className="flex items-center gap-3 px-5 py-3 hover:bg-white/4 transition-all">
                                                <span className="text-xs text-gray-600 w-5 shrink-0 text-right">{lIdx + 1}</span>
                                                <div className="shrink-0">
                                                  {lesson.type === 'video'
                                                    ? <Video className="w-3.5 h-3.5 text-blue-400" />
                                                    : <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                                                </div>
                                                <span className="flex-1 text-sm text-gray-300 truncate">{lesson.title}</span>
                                                {lesson.duration && (
                                                  <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                                                    <Clock className="w-3 h-3" />{lesson.duration}m
                                                  </span>
                                                )}
                                                {isEnrolled
                                                  ? <Play className="w-3.5 h-3.5 text-[#FF6B35]/60 shrink-0" />
                                                  : <Lock className="w-3.5 h-3.5 text-gray-600 shrink-0" />}
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </motion.div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-[#161B22] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#FF6B35]" />
                <h3 className="font-bold text-lg">Who It's For</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {program.targetAudience || 'This program is open to everyone.'}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#161B22] border border-white/8 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Program Details</h3>
              <div className="space-y-1">
                {[
                  { label: 'Courses',    value: `${sortedCourses.length}` },
                  { label: 'Modules',    value: `${totalModules}` },
                  { label: 'Lessons',    value: `${totalLessons}` },
                  { label: 'Duration',   value: totalHours ? `${totalHours} hrs` : 'Self-paced' },
                  { label: 'Level',      value: Array.isArray(program.level) ? program.level.join(', ') : (program.level || 'All Levels') },
                  { label: 'Self-paced', value: program.isSelfPaced ? 'Yes' : 'No' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-gray-400 text-sm">{label}</span>
                    <span className="font-semibold text-sm capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {program.prerequisites && program.prerequisites.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="bg-[#161B22] border border-white/8 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Prerequisites</h3>
                <ul className="space-y-2">
                  {program.prerequisites.map((pre, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#FF6B35] mt-0.5 shrink-0" />
                      {pre}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {!isEnrolled && (
              <>
                {/* <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-linear-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-purple-300">Scholarship Available</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Have a scholarship code? Get full access to this program for free.
                  </p>
                  <button
                    onClick={() => setShowEnrollmentModal(true)}
                    className="w-full py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 font-semibold transition-all text-sm">
                    Apply Scholarship Code
                  </button>
                </motion.div> */}

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.25 }}
                  className="sticky top-6 bg-[#161B22] border border-[#FF6B35]/20 rounded-2xl p-6">
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    Enroll today to unlock all {totalLessons} lesson{totalLessons !== 1 ? 's' : ''} across {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''}.
                  </p>
                  <button
                    onClick={() => setShowEnrollmentModal(true)}
                    className="w-full py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-semibold transition-all shadow-lg shadow-[#FF6B35]/20">
                    Enroll Now
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      {!isEnrolled && (
        <section className="px-4 py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-t from-[#FF6B35]/8 to-transparent pointer-events-none" />
          <div className="max-w-2xl mx-auto relative">
            <h2 className="text-4xl font-extrabold mb-4">Ready to Start?</h2>
            <p className="text-gray-400 mb-8">Join thousands of learners and begin your journey today.</p>
            <button
              onClick={() => setShowEnrollmentModal(true)}
              disabled={checkingEnrollment}
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-xl font-bold text-lg transition-all shadow-xl shadow-[#FF6B35]/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Enroll Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      )}

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