'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight, Zap, Users, Briefcase, BookOpen,
  Clock, Award, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { Program } from '@/types'
import { useEffect, useState } from 'react'
import { programService } from '@/services/programService'

interface CategoryLandingPageProps {
  category: 'bootcamps' | 'fellowships' | 'ai-programs'
}

export const CategoryLandingPage = ({ category }: CategoryLandingPageProps) => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  // Map URL category slug → API category string
  const categoryMap: Record<CategoryLandingPageProps['category'], string> = {
    bootcamps:     'Technology and Computing',
    fellowships:   'Professional Development',
    'ai-programs': 'Data Science and Artificial Intelligence',
  }
  const apiCategory = categoryMap[category]

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true)
      setError(null)

      const response = await programService.getPrograms({
        isPublished: true,
        category: apiCategory,
      })

      if (response.success && response.data) {
        setPrograms(response.data)
      } else {
        setError(response.error || 'Failed to fetch programs')
      }

      setLoading(false)
    }

    fetchPrograms()
  }, [])

  // ── Category metadata 
  const categoryMeta = {
    bootcamps: {
      title:       'Bootcamps',
      subtitle:    'Intensive hands-on training to transform you into a job-ready professional',
      description: "Our bootcamps are designed to give you practical, industry-relevant skills in AI and Data Science. Through project-based learning and mentorship, you'll build a portfolio that stands out to employers.",
      icon:        Zap,
      gradient:    'from-lime-400 to-lime-500',
      accentText:  'text-lime-400',
      shadowColor: 'shadow-lime-500/20',
      coverImage:  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      benefits: [
        'Hands-on projects with real datasets',
        'Personalized mentorship from industry experts',
        'Job placement assistance and career coaching',
        'Build a professional portfolio',
        'Network with peers and alumni',
        'Certificate of completion',
      ],
      card: {
        border: 'border-lime-500/20 hover:border-lime-500/40',
        bg:     'bg-lime-500/5 hover:bg-lime-500/10',
        text:   'text-lime-400',
      },
    },
    fellowships: {
      title:       'Fellowships',
      subtitle:    'Advanced learning with expert mentorship and networking opportunities',
      description: 'Join our fellowship programs to work on cutting-edge research, collaborate with industry leaders, and advance your expertise in specialized areas of AI and Data Science.',
      icon:        Users,
      gradient:    'from-emerald-400 to-emerald-500',
      accentText:  'text-emerald-400',
      shadowColor: 'shadow-emerald-500/20',
      coverImage:  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      benefits: [
        'Work on real-world research projects',
        'One-on-one mentorship from leading experts',
        'Exclusive networking events and workshops',
        'Publication and presentation opportunities',
        'Stipend and funding support',
        'Professional certificate',
      ],
      card: {
        border: 'border-emerald-500/20 hover:border-emerald-500/40',
        bg:     'bg-emerald-500/5 hover:bg-emerald-500/10',
        text:   'text-emerald-400',
      },
    },
    'ai-programs': {
      title:       'AI Programs',
      subtitle:    'Specialized courses in cutting-edge AI technologies',
      description: 'Explore our comprehensive AI programs covering machine learning, deep learning, NLP, computer vision, and more. Learn at your own pace with lifetime access to course materials.',
      icon:        Briefcase,
      gradient:    'from-yellow-400 to-yellow-500',
      accentText:  'text-yellow-400',
      shadowColor: 'shadow-yellow-500/20',
      coverImage:  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      benefits: [
        'Self-paced learning with flexible deadlines',
        'Comprehensive curriculum from basics to advanced',
        'Real-world projects and case studies',
        'Industry-recognized certifications',
        'Lifetime access to course materials',
        'Active community support',
      ],
      card: {
        border: 'border-yellow-500/20 hover:border-yellow-500/40',
        bg:     'bg-yellow-500/5 hover:bg-yellow-500/10',
        text:   'text-yellow-400',
      },
    },
  } as const

  const meta  = categoryMeta[category]
  const Icon  = meta.icon
  const colors = meta.card

  // ── Loading 
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="h-[400px] bg-slate-900 animate-pulse" />
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900/50 rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Error 
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-3 bg-gradient-to-r ${meta.gradient} text-slate-900 font-semibold rounded-lg`}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── HERO */}
      <section className="relative min-h-[60vh] flex items-center">
        {/* Background image + overlay */}
        <div className="absolute inset-0">
          <img
            src={meta.coverImage}
            alt={meta.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-slate-900/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 max-w-7xl">
          <div className="max-w-4xl">

            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-gray-400 mb-6"
            >
              <Link href="/" className="hover:text-white transition">Home</Link>
              <span>/</span>
              <Link href="/#programs" className="hover:text-white transition">Programs</Link>
              <span>/</span>
              <span className="text-white">{meta.title}</span>
            </motion.nav>

            {/* Icon badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm bg-slate-900/80 border border-white/10 mb-6"
            >
              <Icon className={`w-5 h-5 ${meta.accentText}`} />
              <span className={`text-sm font-semibold ${meta.accentText}`}>{meta.title}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              {meta.subtitle}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-300 mb-8 leading-relaxed"
            >
              {meta.description}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-8"
            >
              {[
                { value: `${programs.length}+`, label: 'Programs Available' },
                { value: '275+',                label: 'Students Enrolled'  },
                { value: '4.8/5',               label: 'Average Rating'     },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}>
                    {value}
                  </div>
                  <div className="text-sm text-gray-400">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS */}
      <section className="py-16 px-4 bg-slate-900/30">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What You'll Get</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meta.benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-slate-900/50 border border-gray-800/50 rounded-lg p-6"
              >
                <CheckCircle className={`w-6 h-6 ${meta.accentText} shrink-0 mt-0.5`} />
                <span className="text-gray-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS GRID */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Available Programs</h2>
            <p className="text-gray-400">
              Choose from {programs.length} carefully designed program{programs.length !== 1 ? 's' : ''}
            </p>
          </div>

          {programs.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No programs available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program: Program, index: number) => (
                <motion.div
                  key={program._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* ✅ Aligned with /programs/[slug] routing */}
                  <Link href={`/programs/slug/${program.slug}`} className="block h-full">
                    <div className={`
                      group relative overflow-hidden rounded-2xl border backdrop-blur-sm
                      ${colors.border} ${colors.bg}
                      transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                      cursor-pointer h-full flex flex-col
                    `}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Cover image */}
                      <div className="relative h-56 overflow-hidden bg-slate-900 shrink-0">
                        {program.coverImage ? (
                          <img
                            src={categoryMeta[category].coverImage}
                            alt={program.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${meta.gradient}`}>
                            <Icon className="w-20 h-20 text-white/30" />
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="relative p-6 flex-1 flex flex-col">
                        <h3 className={`text-xl font-bold text-white mb-2 group-hover:${colors.text} transition-colors line-clamp-2`}>
                          {program.title}
                        </h3>

                        <p className="text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed flex-1">
                          {program.description || 'Discover cutting-edge skills and advance your career.'}
                        </p>

                        {/* Meta info */}
                        <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500 mb-4">
                          {program.estimatedHours && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{program.estimatedHours}h</span>
                            </div>
                          )}
                          {program.enrollmentCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>{program.enrollmentCount} enrolled</span>
                            </div>
                          )}
                          {program.level && program.level.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              <span className="capitalize">
                                {Array.isArray(program.level) ? program.level.join(', ') : program.level}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* CTA row */}
                        <div className={`flex items-center gap-2 ${colors.text} font-semibold text-sm group-hover:gap-3 transition-all`}>
                          <span>Learn more</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA FOOTER */}
      <section className="py-16 px-4 bg-slate-900/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join hundreds of students transforming their careers with our {meta.title.toLowerCase()}
          </p>
          <Link
            href="/contact"
            className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${meta.gradient} text-slate-900 font-bold rounded-lg hover:opacity-90 transition shadow-lg ${meta.shadowColor} text-lg`}
          >
            Talk to an Advisor
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}