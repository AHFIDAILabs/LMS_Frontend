import { motion } from 'framer-motion'
import { ArrowRight, Zap, Users, Briefcase, Clock } from 'lucide-react'
import { usePrograms } from '@/hooks/useProgram'
import { Program } from '@/types'

interface CategoryGridProps {
  title?: string
  subtitle?: string
}

// ⚠️  All three maps MUST use the exact same keys.
// Keys are derived from program.category via: .toLowerCase().replace(/\s+/g, '-')
// e.g. "Bootcamp" → "bootcamp" | "Fellowship" → "fellowship" | "AI Program" → "ai-program"
// To debug: console.log(programs.map(p => p.category)) and align the keys below.
const CATEGORY_COVER_IMAGES: Record<string, string> = {
  bootcamp:
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  fellowship:
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'ai-program':
    'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
}

const FALLBACK_COVER =
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'

// ✅ All three maps now share identical keys
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  bootcamp: Zap,
  fellowship: Users,
  'ai-program': Briefcase,
}

const CATEGORY_ACCENTS: Record<string, 'lime' | 'emerald' | 'yellow'> = {
  bootcamp: 'lime',
  fellowship: 'emerald',
  'ai-program': 'yellow',
}

const accentStyles = {
  lime: {
    border: 'border-lime-500/20 hover:border-lime-500/40',
    bg: 'bg-lime-500/5 hover:bg-lime-500/10',
    text: 'text-lime-400',
    gradient: 'from-lime-400 to-lime-500',
    dot: 'bg-lime-400',
    ctaBg: 'bg-lime-500/10 group-hover:bg-lime-500/20',
  },
  emerald: {
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
    text: 'text-emerald-400',
    gradient: 'from-emerald-400 to-emerald-500',
    dot: 'bg-emerald-400',
    ctaBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
  },
  yellow: {
    border: 'border-yellow-500/20 hover:border-yellow-500/40',
    bg: 'bg-yellow-500/5 hover:bg-yellow-500/10',
    text: 'text-yellow-400',
    gradient: 'from-yellow-400 to-yellow-500',
    dot: 'bg-yellow-400',
    ctaBg: 'bg-yellow-500/10 group-hover:bg-yellow-500/20',
  },
}

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden min-h-[600px] animate-pulse">
    <div className="h-64 bg-slate-800" />
    <div className="p-8 space-y-4">
      <div className="h-8 w-1/2 bg-slate-800 rounded" />
      <div className="h-4 w-full bg-slate-800 rounded" />
      <div className="h-4 w-5/6 bg-slate-800 rounded" />
      <div className="space-y-2 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 w-3/4 bg-slate-800 rounded" />
        ))}
      </div>
    </div>
  </div>
)

// Single source of truth for key derivation — used by all three resolvers
function resolveCategoryKey(program: Program): string {
  return program.category?.toLowerCase().replace(/\s+/g, '-') ?? ''
}

function resolveCoverImage(program: Program): string {
  if ((program as any).coverImage) return (program as any).coverImage
  const key = resolveCategoryKey(program)
  return CATEGORY_COVER_IMAGES[key] ?? FALLBACK_COVER
}

function resolveAccent(program: Program): 'lime' | 'emerald' | 'yellow' {
  const key = resolveCategoryKey(program)
  return CATEGORY_ACCENTS[key] ?? 'lime'
}

function resolveIcon(program: Program): React.ElementType {
  const key = resolveCategoryKey(program)
  return CATEGORY_ICONS[key] ?? Briefcase
}

export const CategoryGrid = ({
  title = 'Explore Our Programs',
  subtitle = 'Choose the learning path that fits your career goals',
}: CategoryGridProps) => {
  const { programs, loading, error } = usePrograms({ isPublished: true })

  return (
    <section className="py-24 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
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

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : programs.map((program, index) => {
                const coverImage = resolveCoverImage(program)
                const accentColor = resolveAccent(program)
                const Icon = resolveIcon(program)
                const styles = accentStyles[accentColor]

                const features: string[] =
                  (program as any).features ??
                  (program as any).highlights ??
                  []

                return (
                  <motion.div
                    key={program._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <a href={`/programs/${program.slug ?? program._id}`} className="block h-full">
                      <div
                        className={`
                          group relative overflow-hidden rounded-2xl border backdrop-blur-sm
                          ${styles.border} ${styles.bg}
                          transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                          cursor-pointer h-full flex flex-col min-h-[600px]
                        `}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative h-64 overflow-hidden bg-slate-900">
                          <img
                            src={coverImage}
                            alt={program.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-6 left-6 p-4 rounded-xl backdrop-blur-sm bg-slate-900/80 border border-white/10">
                            <Icon className={`w-8 h-8 ${styles.text}`} />
                          </div>
                        </div>

                        <div className="relative p-8 flex-1 flex flex-col">
                          <h3
                            className={`text-3xl font-bold text-white mb-3 group-hover:${styles.text} transition-colors`}
                          >
                            {program.title}
                          </h3>

                          <p className="text-gray-400 mb-6 leading-relaxed line-clamp-3">
                            {program.description}
                          </p>

                          {features.length > 0 && (
                            <div className="space-y-2 mb-6">
                              {features.slice(0, 4).map((feature: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-sm text-gray-300"
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          )}

                          {(program as any).duration && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                              <Clock className="w-3 h-3" />
                              <span>{(program as any).duration}</span>
                            </div>
                          )}

                          <div className="mt-auto">
                            <div
                              className={`flex items-center justify-between p-4 rounded-lg ${styles.ctaBg} transition-all duration-300`}
                            >
                              <span className={`font-bold ${styles.text}`}>
                                Explore Programs
                              </span>
                              <ArrowRight
                                className={`w-5 h-5 ${styles.text} group-hover:translate-x-1 transition-transform duration-300`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                )
              })}
        </div>

        {!loading && !error && programs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No programs available at the moment.</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">
            Not sure which path to take? We can help you decide.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-900 font-bold rounded-lg hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-lime-500/20 text-lg hover:shadow-xl hover:shadow-lime-500/30"
          >
            Talk to an Advisor
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}