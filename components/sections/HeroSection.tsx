import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Zap, Users, Briefcase } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  const images = [
    '/images/Dr.Kay3.jpeg',
    '/images/Dr.Kay1.jpeg',
    '/images/Dr.Kay2.jpeg',
  ]

  const [currentImage, setCurrentImage] = useState(0)

  // Change image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      className="relative min-h-screen w-full flex items-center bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: `url('${images[currentImage]}')` }}
    >
      {/* Overlay - Darker for better text contrast */}
      <div className="absolute inset-0 bg-linear-to-br from-black/90 via-black/85 to-slate-900/90" /> 

      {/* Subtle ambient glow - reduced intensity */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-lime-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 container-custom py-32">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Headline */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6">
              Build Future-Ready Skills in
              <br />
              <span className="bg-linear-to-r from-lime-400 via-emerald-400 to-lime-500 bg-clip-text text-transparent">
                AI, Data & Digital Policy
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto">
              Choose your path: Bootcamps, Fellowships, or AI Programs.
            </p>
          </div>

          {/* Program Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            
            {/* Bootcamps Card */}
            <ProgramCard
              icon={<Zap className="w-8 h-8" />}
              title="Bootcamps"
              description="Intensive hands-on training in AI & data skills"
              features={["12-16 weeks", "Project-based", "Job-ready"]}
              href="/bootcamps"
              accentColor="lime"
            />

            {/* Fellowships Card */}
            <ProgramCard
              icon={<Users className="w-8 h-8" />}
              title="Fellowships"
              description="Advanced learning with mentorship & networking"
              features={["6-12 months", "Expert guidance", "Industry network"]}
              href="/fellowships"
              accentColor="emerald"
            />

            {/* AI Programs Card */}
            <ProgramCard
              icon={<Briefcase className="w-8 h-8" />}
              title="AI Programs"
              description="Specialized courses in cutting-edge AI technologies"
              features={["Flexible pace", "Certifications", "Real projects"]}
              href="/ai-programs"
              accentColor="yellow"
            />
          </div>

          {/* Quick Stats - Simplified */}
          <div className="mt-20 flex flex-wrap justify-center gap-8 text-center">
            <StatBadge number="275+" label="Students Trained" />
            <StatBadge number="87%" label="Success Rate" />
            <StatBadge number="40+" label="Industry Partners" />
            <StatBadge number="12" label="Countries" />
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImage(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentImage === idx 
                ? 'bg-lime-400 w-6' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

/* Program Card Component */
function ProgramCard({
  icon,
  title,
  description,
  features,
  href,
  accentColor,
}: {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  href: string
  accentColor: 'lime' | 'emerald' | 'yellow'
}) {
  const colorClasses = {
    lime: {
      border: 'border-lime-500/20 hover:border-lime-500/40',
      bg: 'bg-lime-500/5 hover:bg-lime-500/10',
      text: 'text-lime-400',
      icon: 'bg-lime-500/10 text-lime-400',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
      text: 'text-emerald-400',
      icon: 'bg-emerald-500/10 text-emerald-400',
    },
    yellow: {
      border: 'border-yellow-500/20 hover:border-yellow-500/40',
      bg: 'bg-yellow-500/5 hover:bg-yellow-500/10',
      text: 'text-yellow-400',
      icon: 'bg-yellow-500/10 text-yellow-400',
    },
  }

  const colors = colorClasses[accentColor]

  return (
    <Link href={href}>
      <div
        className={`
          group relative overflow-hidden rounded-2xl border backdrop-blur-sm
          ${colors.border} ${colors.bg}
          transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
          cursor-pointer h-full
        `}
      >
        {/* Subtle linear overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative p-8">
          {/* Icon */}
          <div className={`inline-flex p-3 rounded-xl ${colors.icon} mb-4`}>
            {icon}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>

          {/* Description */}
          <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>

          {/* Features */}
          <ul className="space-y-2 mb-6">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                <div className={`w-1.5 h-1.5 rounded-full ${colors.text}`} />
                {feature}
              </li>
            ))}
          </ul>

          {/* Learn More Link */}
          <div className={`flex items-center gap-2 ${colors.text} font-semibold group-hover:gap-3 transition-all`}>
            <span>Learn more</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* Simplified Stat Badge */
function StatBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent mb-1">
        {number}
      </div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
    </div>
  )
}