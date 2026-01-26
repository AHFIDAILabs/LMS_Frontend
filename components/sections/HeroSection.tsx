import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

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
      className="relative min-h-screen w-full flex justify-center items-center bg-cover bg-center rounded-xl overflow-hidden transition-all duration-1000"
      style={{ backgroundImage: `url('${images[currentImage]}')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80" /> 

      {/* Ambient glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 container-custom pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Small badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#bc7e1b] bg-[#ffffff] mb-8">
            <span className="w-2 h-2 bg-[#c27e10] rounded-full animate-pulse" />
            <span className="text-[#db9119] text-sm font-medium">
              AI Accelerator Program
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
            Master the Future <br />
            <span className="text-[#EFB14A] drop-shadow-primary-light">
              of Artificial Intelligence
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            Learn cutting-edge AI skills, build real-world projects,
            and become industry-ready in just 12 weeks.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              className="bg-[#EFB14A] text-black hover:bg-lime-300"
            >
              Get Started
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="border border-gray-700 text-white hover:bg-gray-800"
            >
              Watch Demo
            </Button>
          </div>

          {/* Metrics */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard value="275+" label="Students" />
            <StatCard value="87%" label="Completion" />
            <StatCard value="40+" label="Hours" />
            <StatCard value="12" label="Weeks" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* Reusable stat pill */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#c9e5f7] border border-[#EFB14A] shadow-[0_0_20px_rgba(239,177,74,0.3)] rounded-xl p-6 text-center hover:border-lime-400/40 transition">
      <div className="text-3xl font-bold text-[#de8d0b] mb-1">{value}</div>
      <div className="text-sm text-[#af7312]">{label}</div>
    </div>
  )
}
