'use client'

import { motion } from 'framer-motion'
import { Clock, Users, BookOpen, ArrowRight, Zap, Briefcase, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { usePrograms } from '@/hooks/useProgram'
import { useEffect, useMemo, useState } from 'react'
import { Program } from '@/types'

interface ProgramsGridProps {
  programs?: Program[]
  title?: string
  subtitle?: string
  showAll?: boolean
  limit?: number
  isPublished?: boolean
  category?: 'bootcamp' | 'fellowship' | 'ai-program' | 'all'
  instructorId?: string
  showFilters?: boolean
}

export const NewProgramGrid = ({ 
  programs: externalPrograms,
  title = "Explore Our Programs",
  subtitle = "Choose the learning path that fits your career goals",
  showAll = false,
  limit = 6,
  isPublished = true,
  category = 'all',
  instructorId,
  showFilters = true,
}: ProgramsGridProps) => {

  const [activeFilter, setActiveFilter] = useState<string>(category)

  console.log('[ProgramsGrid] 🏁 Render triggered with category:', category);

  // Memoize query params
  const queryParams = useMemo(() => {
    if (externalPrograms) return {}
    return {
      isPublished,
      ...(activeFilter !== 'all' && { category: activeFilter }),
      ...(instructorId && { instructorId }),
      ...(!showAll && { limit }),
    }
  }, [externalPrograms, isPublished, activeFilter, instructorId, showAll, limit])

  // Use hook only if no externalPrograms
  const { programs: fetchedPrograms, loading, error } = externalPrograms 
    ? { programs: externalPrograms, loading: false, error: null }
    : usePrograms(queryParams)

  const programs = fetchedPrograms || []
  const shouldShowLoading = !externalPrograms && loading
  const shouldShowError = !externalPrograms && !!error

  useEffect(() => {
    if (programs.length > 0) {
      console.log(`[ProgramsGrid] ✅ Rendering ${programs.length} programs.`)
      console.table(programs.map(p => ({ title: p.title, slug: p.slug, category: p.category })))
    } else if (!loading) {
      console.warn('[ProgramsGrid] ⚠️ No programs found.')
    }
  }, [programs, loading])

  const displayPrograms = showAll ? programs : programs.slice(0, limit)

  // Filter categories
  const filters = [
    { id: 'all', label: 'All Programs', icon: BookOpen, color: 'white' },
    { id: 'bootcamp', label: 'Bootcamps', icon: Zap, color: 'lime' },
    { id: 'fellowship', label: 'Fellowships', icon: Users, color: 'emerald' },
    { id: 'ai-program', label: 'AI Programs', icon: Briefcase, color: 'yellow' },
  ]

  // Get program icon and color based on category
  const getProgramMeta = (programCategory: string) => {
    switch (programCategory?.toLowerCase()) {
      case 'bootcamp':
        return { icon: Zap, color: 'lime', gradient: 'from-lime-400 to-lime-500' }
      case 'fellowship':
        return { icon: Users, color: 'emerald', gradient: 'from-emerald-400 to-emerald-500' }
      case 'ai-program':
        return { icon: Briefcase, color: 'yellow', gradient: 'from-yellow-400 to-yellow-500' }
      default:
        return { icon: BookOpen, color: 'gray', gradient: 'from-gray-400 to-gray-500' }
    }
  }

  // --- LOADING STATE ---
  if (shouldShowLoading) {
    console.log('[ProgramsGrid] ⏳ Rendering Loading UI')
    return (
      <section className="py-24 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="h-12 bg-white/5 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-white/5 rounded-lg w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(limit)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800/50 h-[420px] animate-pulse">
                <div className="h-56 bg-slate-800/50" />
                <div className="p-6 space-y-4">
                  <div className="h-8 bg-slate-800/50 rounded w-3/4" />
                  <div className="h-4 bg-slate-800/50 rounded w-full" />
                  <div className="h-4 bg-slate-800/50 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // --- ERROR STATE ---
  if (shouldShowError) {
    console.error('[ProgramsGrid] ❌ Rendering Error UI:', error)
    return (
      <section className="py-24 px-4 bg-slate-950 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Unable to Load Programs</h2>
            <p className="text-red-400 mb-6">{error || "Something went wrong. Please try again."}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-linear-to-r from-lime-400 to-emerald-500 text-slate-900 font-semibold rounded-lg hover:from-lime-500 hover:to-emerald-600 transition shadow-lg shadow-lime-500/20"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  // --- EMPTY STATE ---
  if (programs.length === 0 && !loading) {
    console.warn('[ProgramsGrid] 🔍 Rendering Empty UI')
    return (
      <section className="py-24 px-4 bg-slate-950 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
            <p className="text-gray-400 mb-6">No programs found matching your criteria.</p>
            <Link 
              href="/allPrograms" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-lime-400 to-emerald-500 text-slate-900 font-semibold rounded-lg hover:from-lime-500 hover:to-emerald-600 transition shadow-lg shadow-lime-500/20"
            >
              Browse All Programs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // --- MAIN GRID ---
  console.log('[ProgramsGrid] 🎨 Rendering Grid View')
  return (
    <section className="py-24 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {filters.map((filter) => {
              const Icon = filter.icon
              const isActive = activeFilter === filter.id
              
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
                    ${isActive 
                      ? 'bg-linear-to-r from-lime-400 to-emerald-500 text-slate-900 shadow-lg shadow-lime-500/20' 
                      : 'bg-slate-900/50 text-gray-400 border border-gray-800/50 hover:border-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                </button>
              )
            })}
          </motion.div>
        )}

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPrograms.map((program, index) => {
            if (!program._id) console.error(`[ProgramsGrid] Item at index ${index} has NO _id!`, program)

            const slug = program.slug || ""
            const priceText = program.price === 0 ? 'Free' : `${program.currency === 'NGN' ? '₦' : '$'}${program.price?.toLocaleString()}`
            const { icon: Icon, color, gradient } = getProgramMeta(program.category ?? "")

            const colorClasses = {
              lime: 'border-lime-500/20 hover:border-lime-500/40 bg-lime-500/5 hover:bg-lime-500/10',
              emerald: 'border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10',
              yellow: 'border-yellow-500/20 hover:border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10',
              gray: 'border-gray-500/20 hover:border-gray-500/40 bg-gray-500/5 hover:bg-gray-500/10',
            }

            return (
              <motion.div
                key={program._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/programs/${slug}`}>
                  <div className={`
                    group relative overflow-hidden rounded-2xl border backdrop-blur-sm
                    ${colorClasses[color as keyof typeof colorClasses]}
                    transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                    cursor-pointer h-full flex flex-col
                  `}>
                    
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-slate-900">
                      {program.coverImage ? (
                        <img 
                          src={program.coverImage} 
                          alt={program.title || 'Program'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-linear-to-br ${gradient}`}>
                          <Icon className="w-20 h-20 text-white/30" />
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg backdrop-blur-sm bg-slate-900/80 border border-white/10`}>
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 text-${color}-400`} />
                          <span className={`text-xs font-semibold text-${color}-400 capitalize`}>
                            {program.category?.replace('-', ' ') || 'Program'}
                          </span>
                        </div>
                      </div>

                      {/* Price Badge */}
                      {/* {program.price !== undefined && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg backdrop-blur-sm bg-slate-900/80 border border-white/10">
                          <span className="text-sm font-bold text-white">{priceText}</span>
                        </div>
                      )} */}
                    </div>

                    {/* Body */}
                    <div className="relative p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-lime-400 transition-colors line-clamp-2">
                        {program.title || 'Untitled Program'}
                      </h3>
                      
                      <p className="text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                        {program.description || 'Discover cutting-edge skills and advance your career with expert-led training.'}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 mt-auto">
                        {program.estimatedHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{program.duration}</span>
                          </div>
                        )}
                        {program.enrollmentCount !== undefined && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{program.enrollmentCount} enrolled</span>
                          </div>
                        )}
                        {program.level && (
                          <div className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            <span className="capitalize">{program.level}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className={`flex items-center gap-2 text-${color}-400 font-semibold text-sm group-hover:gap-3 transition-all`}>
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* View All CTA */}
        {!showAll && programs.length >= limit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link 
              href="/allPrograms"
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-lime-400 to-emerald-500 text-slate-900 font-bold rounded-lg hover:from-lime-500 hover:to-emerald-600 transition shadow-lg shadow-lime-500/20 text-lg"
            >
              View All Programs
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
