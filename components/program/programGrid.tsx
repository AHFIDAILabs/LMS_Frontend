'use client'

import { motion } from 'framer-motion'
import { Clock, Users, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { usePrograms } from '@/hooks/useProgram'
import { useEffect, useMemo } from 'react'
import { Program } from '@/types'

interface ProgramsGridProps {
  programs?: Program[]
  title?: string
  subtitle?: string
  showAll?: boolean
  limit?: number
  isPublished?: boolean
  category?: string
  instructorId?: string
}

export const ProgramsGrid = ({ 
  programs: externalPrograms,
  title = "Explore Our Programs",
  subtitle = "Choose the learning path that fits your career goals",
  showAll = false,
  limit = 6,
  isPublished = true,
  category,
  instructorId,
}: ProgramsGridProps) => {

  console.log('[ProgramsGrid] 🏁 Render triggered');

  // Memoize query params only if we need to fetch
  const queryParams = useMemo(() => {
    if (externalPrograms) return {}; // skip hook if external data exists
    return {
      isPublished,
      ...(category && { category }),
      ...(instructorId && { instructorId }),
      ...(!showAll && { limit }),
    }
  }, [externalPrograms, isPublished, category, instructorId, showAll, limit])

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
      console.table(programs.map(p => ({ title: p.title, slug: p.slug, id: p._id })))
    } else if (!loading) {
      console.warn('[ProgramsGrid] ⚠️ No programs found.')
    }
  }, [programs, loading])

  const displayPrograms = showAll ? programs : programs.slice(0, limit)

  // --- LOADING STATE ---
  if (shouldShowLoading) {
    console.log('[ProgramsGrid] ⏳ Rendering Loading UI')
    return (
      <section className="py-20 px-4 bg-linear-to-b from-[#2A434E] to-[#1f3238]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-pulse">Loading Programs...</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(limit)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 h-96 animate-pulse">
                <div className="h-48 bg-white/10" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-full" />
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
      <section className="py-20 px-4 bg-linear-to-b from-[#2A434E] to-[#1f3238] text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-red-400 mb-8">{error || "Could not load programs."}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#f85a28] transition"
          >
            Retry Request
          </button>
        </div>
      </section>
    )
  }

  // --- EMPTY STATE ---
  if (programs.length === 0 && !loading) {
    console.warn('[ProgramsGrid] 🔍 Rendering Empty UI')
    return (
      <section className="py-20 px-4 bg-linear-to-b from-[#2A434E] to-[#1f3238] text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
          <p className="text-gray-300 mb-8">No programs found matching your criteria.</p>
          <Link href="/" className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#f85a28] transition">
            Browse All
          </Link>
        </div>
      </section>
    )
  }

  // --- MAIN GRID ---
  console.log('[ProgramsGrid] 🎨 Rendering Grid View')
  return (
    <section className="py-20 px-4 bg-linear-to-b from-[#2A434E] to-[#1f3238]">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPrograms.map((program, index) => {
            if (!program._id) console.error(`[ProgramsGrid] Item at index ${index} has NO _id!`, program)

            const slug = program.slug || ""
            const priceText = program.price === 0 ? 'Free' : `${program.currency === 'NGN' ? '₦' : '$'}${program.price?.toLocaleString()}`

            return (
              <motion.div
                key={program._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/programs/slug/[slug]`.replace('[slug]', slug)}>
                  <div className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#FF6B35]/50 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                    
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-800">
                      {program.coverImage ? (
                        <img 
                          src={program.coverImage} 
                          alt={program.title || 'Program'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#FF6B35] to-[#f85a28]">
                          <BookOpen className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FF6B35] transition-colors line-clamp-1">
                        {program.title || 'Untitled Program'}
                      </h3>
                      <p className="text-gray-300 mb-4 line-clamp-2 text-sm">
                        {program.description || 'No description available.'}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-bold text-white">{priceText}</span>
                        <div className="flex items-center gap-1 text-[#FF6B35] font-semibold text-sm">
                          Details <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
