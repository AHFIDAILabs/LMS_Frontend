'use client'

import { motion } from 'framer-motion'
import { UserPlus, BookOpenCheck, FlaskConical, BadgeCheck } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Enroll',
    desc: 'Sign up and get instant access to all course materials and community resources.',
    color: 'lime',
  },
  {
    num: '02',
    icon: BookOpenCheck,
    title: 'Learn',
    desc: 'Follow a structured curriculum crafted by industry experts — at your own pace.',
    color: 'emerald',
  },
  {
    num: '03',
    icon: FlaskConical,
    title: 'Practice',
    desc: 'Cement your knowledge through quizzes, challenges, and real-world projects.',
    color: 'amber',
  },
  {
    num: '04',
    icon: BadgeCheck,
    title: 'Certify',
    desc: 'Earn a verifiable certificate and showcase your skills to the world.',
    color: 'lime',
  },
]

const colorMap: Record<string, {
  text: string; border: string; bg: string; glow: string; dot: string; line: string
}> = {
  lime: {
    text:   'text-lime-400',
    border: 'border-lime-500/30',
    bg:     'bg-lime-500/8',
    glow:   'shadow-lime-500/20',
    dot:    'bg-lime-400',
    line:   'from-lime-500/60',
  },
  emerald: {
    text:   'text-emerald-400',
    border: 'border-emerald-500/30',
    bg:     'bg-emerald-500/8',
    glow:   'shadow-emerald-500/20',
    dot:    'bg-emerald-400',
    line:   'from-emerald-500/60',
  },
  amber: {
    text:   'text-amber-400',
    border: 'border-amber-500/30',
    bg:     'bg-amber-500/8',
    glow:   'shadow-amber-500/20',
    dot:    'bg-amber-400',
    line:   'from-amber-500/60',
  },
}

export function ProcessSection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden" style={{ backgroundColor: '#0e1a14' }}>

      {/* ── Background atmosphere ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep green tint wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/60 via-transparent to-slate-950/80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-lime-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-[280px] h-[280px] bg-teal-500/5 rounded-full blur-3xl" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/25 bg-lime-500/8 text-lime-400 text-xs font-semibold uppercase tracking-widest mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            Simple Process
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
          >
            How It{' '}
            <span className="relative inline-block">
              Works
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 opacity-80" />
            </span>
          </motion.h2>
        </div>

        {/* ── Steps ────────────────────────────────────────────────────────── */}
        <div className="relative">

          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {/* Animated shimmer */}
            <motion.div
              className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-lime-400/40 to-transparent"
              initial={{ x: '-100%' }}
              whileInView={{ x: '200%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, delay: 0.4, ease: 'easeInOut' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const c   = colorMap[step.color]
              const Icon = step.icon

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex flex-col items-center text-center"
                >
                  {/* Icon bubble */}
                  <div className="relative mb-6">
                    {/* Step number — top-right chip */}
                    <div className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center">
                      <span className={`text-[10px] font-bold ${c.text}`}>{step.num}</span>
                    </div>

                    <div className={`
                      w-[72px] h-[72px] rounded-2xl
                      ${c.bg} border ${c.border}
                      flex items-center justify-center
                      shadow-lg ${c.glow}
                      transition-all duration-300 ease-out
                      group-hover:-translate-y-1.5
                      group-hover:shadow-xl
                    `}>
                      <Icon className={`w-7 h-7 ${c.text} transition-transform duration-300 group-hover:scale-110`} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`text-lg font-bold text-white mb-2.5 transition-colors duration-200 group-hover:${c.text}`}>
                    {step.title}
                  </h3>

                  {/* Desc */}
                  <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
                    {step.desc}
                  </p>

                  {/* Bottom accent dot */}
                  <div className={`mt-5 w-1.5 h-1.5 rounded-full ${c.dot} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Bottom CTA strip ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/15 hidden sm:block" />
          <p className="text-sm text-gray-500 text-center">
            Ready to start your learning journey?
          </p>
          <a
            href="/allPrograms"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-900 text-sm font-bold shadow-lg shadow-lime-500/20 hover:shadow-lime-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Browse Programs
          </a>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/15 hidden sm:block" />
        </motion.div>
      </div>
    </section>
  )
}