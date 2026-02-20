'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Zap, Users, Briefcase, BookOpen, Layers } from 'lucide-react'
import { usePrograms } from '@/hooks/useProgram'
import { Program } from '@/types'
import { useMemo } from 'react'

interface CategoryGridProps {
  title?: string
  subtitle?: string
}

// ── Category config ──────────────────────────────────────────────────────────
const CATEGORY_COVER_IMAGES: Record<string, string> = {
  bootcamp:
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800&h=500',
  fellowship:
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=500',
  'ai-program':
    'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800&h=500',
}

const FALLBACK_COVER =
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800&h=500'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  bootcamp:     Zap,
  fellowship:   Users,
  'ai-program': Briefcase,
}

type Accent = 'lime' | 'emerald' | 'amber'

const CATEGORY_ACCENTS: Record<string, Accent> = {
  bootcamp:     'lime',
  fellowship:   'emerald',
  'ai-program': 'amber',
}

const ACCENTS: Record<Accent, {
  bar: string; text: string; badge: string; badgeText: string;
  iconBg: string; glow: string; ctaHover: string
}> = {
  lime: {
    bar:       'bg-lime-400',
    text:      'text-lime-400',
    badge:     'bg-lime-400/10 border-lime-400/20',
    badgeText: 'text-lime-400',
    iconBg:    'bg-lime-400/10',
    glow:      'group-hover:shadow-lime-500/10',
    ctaHover:  'group-hover:text-lime-400',
  },
  emerald: {
    bar:       'bg-emerald-400',
    text:      'text-emerald-400',
    badge:     'bg-emerald-400/10 border-emerald-400/20',
    badgeText: 'text-emerald-400',
    iconBg:    'bg-emerald-400/10',
    glow:      'group-hover:shadow-emerald-500/10',
    ctaHover:  'group-hover:text-emerald-400',
  },
  amber: {
    bar:       'bg-amber-400',
    text:      'text-amber-400',
    badge:     'bg-amber-400/10 border-amber-400/20',
    badgeText: 'text-amber-400',
    iconBg:    'bg-amber-400/10',
    glow:      'group-hover:shadow-amber-500/10',
    ctaHover:  'group-hover:text-amber-400',
  },
}

// ── Resolvers ────────────────────────────────────────────────────────────────
function categoryKey(program: Program): string {
  return program.category?.toLowerCase().replace(/\s+/g, '-') ?? ''
}
function coverImage(program: Program): string {
  if ((program as any).coverImage) return (program as any).coverImage
  return CATEGORY_COVER_IMAGES[categoryKey(program)] ?? FALLBACK_COVER
}
function accent(program: Program): Accent {
  return CATEGORY_ACCENTS[categoryKey(program)] ?? 'lime'
}
function icon(program: Program): React.ElementType {
  return CATEGORY_ICONS[categoryKey(program)] ?? Briefcase
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/5 bg-slate-900/60 overflow-hidden animate-pulse">
    <div className="h-40 bg-slate-800" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-16 bg-slate-800 rounded-full" />
      <div className="h-5 w-3/4 bg-slate-800 rounded" />
      <div className="h-3 w-full bg-slate-800 rounded" />
      <div className="h-3 w-5/6 bg-slate-800 rounded" />
    </div>
  </div>
)

// ── Program card ─────────────────────────────────────────────────────────────
function ProgramCard({ program, index }: { program: Program; index: number }) {
  const ac    = accent(program)
  const style = ACCENTS[ac]
  const Icon  = icon(program)
  const img   = coverImage(program)

  const coursesCount  = Array.isArray(program.courses) ? program.courses.length : 0
  const level         = Array.isArray(program.level) ? program.level[0] : program.level

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href={`/programs/${program.slug ?? program._id}`} className="block h-full">
        <div className={`
          group relative overflow-hidden rounded-2xl border border-white/8
          bg-slate-900/70 backdrop-blur-sm
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:border-white/14
          hover:shadow-2xl ${style.glow}
          flex flex-col h-full
        `}>

          {/* Accent bar — top edge */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] ${style.bar} opacity-60 group-hover:opacity-100 transition-opacity`} />

          {/* Image — compact height */}
          <div className="relative h-40 overflow-hidden shrink-0">
            <img
              src={img}
              alt={program.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

            {/* Category badge — bottom left of image */}
            {program.category && (
              <div className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${style.badge} ${style.badgeText} backdrop-blur-md`}>
                <Icon className="w-3 h-3" />
                {program.category}
              </div>
            )}

            {/* Ext link icon top-right */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">

            {/* Title */}
            <h3 className={`text-base font-bold text-white leading-snug mb-2 transition-colors duration-200 ${style.ctaHover}`}>
              {program.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4">
              {program.description}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/6">
              {coursesCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <BookOpen className="w-3 h-3" />
                  <span>{coursesCount} course{coursesCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {level && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Layers className="w-3 h-3" />
                  <span className="capitalize">{level}</span>
                </div>
              )}
              <div className={`ml-auto flex items-center gap-1 text-xs font-semibold ${style.text} transition-transform duration-200 group-hover:translate-x-0.5`}>
                Explore
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export const CategoryGrid = ({
  title = 'Explore Our Programs',
  subtitle = 'Choose the learning path that fits your career goals',
}: CategoryGridProps) => {
  const params   = useMemo(() => ({ isPublished: true }), [])
  const { programs, loading, error } = usePrograms(params)

  return (
    <section className="relative py-24 px-4 bg-slate-950 overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-500/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/4 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-14">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5 text-lime-400 text-xs font-semibold uppercase tracking-widest mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            Learning Paths
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base text-gray-400 max-w-xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="text-center py-10">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* ── Grid ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : programs.map((program, index) => (
                <ProgramCard key={program._id} program={program} index={index} />
              ))}
        </div>

        {/* ── Empty ──────────────────────────────────────────────────────── */}
        {!loading && !error && programs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">No programs available at the moment.</p>
          </div>
        )}

        {/* ── Footer CTA ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <p className="text-gray-500 text-sm">Not sure which path to take?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-900 text-sm font-bold rounded-xl hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-lime-500/20 hover:shadow-lime-500/30 hover:-translate-y-0.5"
          >
            Talk to an Advisor
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}