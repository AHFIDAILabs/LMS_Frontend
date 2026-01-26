import { Button } from '@/components/ui/Button'

export function CTASection() {
  return (
    <section
      className="py-28 relative overflow-hidden rounded-xl"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/Dr.Kay4.jpeg')" }}
      />
      
      {/* Dark overlay to make text readable */}
      <div className="absolute inset-0 bg-black/80 z-0" />

      {/* Glow orbs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-lime-500/10 blur-[140px] rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full" />

      <div className="container-custom relative z-10">
        <div className="
          max-w-5xl mx-auto
          text-center
          bg-slate-900/70
          rounded-3xl
          p-14
          border
          border-lime-500/20
          shadow-[0_0_80px_rgba(132,204,22,0.12)]
          relative
          overflow-hidden
        ">
          {/* Animated gradient border */}
          <div className="
            absolute inset-0
            bg-linear-to-r
            from-lime-500/10
            via-emerald-500/10
            to-lime-500/10
            opacity-60
          " />

          <div className="relative z-10">
            {/* Small badge */}
            <span className="
              inline-flex items-center gap-2
              bg-lime-500/10
              text-[#EFB14A]
              px-4 py-2
              rounded-full
              text-sm
              border border-lime-500/30
              mb-6
            ">
              🚀 Limited Slots Available
            </span>

            {/* Headline */}
            <h2 className="
              text-4xl md:text-6xl
              font-bold
              text-white
              leading-tight
              mb-6
            ">
              Unlock Your Potential in an
              <br />
              <span className="text-[#EFB14A]">AI-First World</span>
            </h2>

            {/* Subtext */}
            <p className="
              text-lg md:text-xl
              text-gray-300
              max-w-3xl
              mx-auto
              mb-10
            ">
              Join hundreds of ambitious learners mastering Artificial Intelligence
              and building real-world solutions that matter.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="px-10 py-6 text-lg bg-[#EFB14A] text-black shadow-[0_0_30px_rgba(239,177,74,0.4)] hover:bg-[#d8a73f]"
              >
                Enroll Now
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="px-10 py-6 text-lg"
              >
                Download Syllabus
              </Button>
            </div>

            {/* Trust text */}
            <p className="mt-10 text-sm text-gray-300">
              Trusted by learners across Africa & beyond 🌍
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
