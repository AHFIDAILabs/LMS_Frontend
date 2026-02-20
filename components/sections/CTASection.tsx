import Link from 'next/link'

export function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#0a0a0a]">

      {/* Background image with parallax feel */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/images/Dr.Kay4.jpeg')" }}
      />

      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Diagonal gold slash accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -left-32 top-0 w-[600px] h-full opacity-[0.07]"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, #EFB14A 40%, #EFB14A 41%, transparent 41%)',
          }}
        />
        <div
          className="absolute -right-32 bottom-0 w-[600px] h-full opacity-[0.07]"
          style={{
            background: 'linear-gradient(105deg, transparent 59%, #EFB14A 59%, #EFB14A 60%, transparent 60%)',
          }}
        />
      </div>

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#EFB14A]/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Top label */}
        <div className="flex justify-center mb-10">
          <span className="inline-flex items-center gap-2.5 border border-[#EFB14A]/30 bg-[#EFB14A]/5 text-[#EFB14A] text-xs font-bold uppercase tracking-[0.2em] px-5 py-2.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EFB14A] animate-pulse" />
            Limited Slots Available
          </span>
        </div>

        {/* Main content — split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text */}
          <div>
            <h2
              className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Shape the
              <br />
              <em className="not-italic text-[#EFB14A]">AI-First</em>
              <br />
              Future.
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
              Join hundreds of ambitious learners across Africa mastering
              Artificial Intelligence — building real solutions that matter,
              with instructors who've done it themselves.
            </p>

            {/* Stats row */}
            <div className="flex gap-8 mb-10">
              {[
                { value: '500+', label: 'Graduates' },
                { value: '12+', label: 'Countries' },
                { value: '95%', label: 'Job Rate' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-[#EFB14A]">{value}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="
                  inline-flex items-center justify-center gap-2
                  bg-[#EFB14A] hover:bg-[#d8a73f]
                  text-black font-bold
                  px-8 py-4 rounded-xl
                  text-base
                  transition-all duration-200
                  shadow-[0_0_40px_rgba(239,177,74,0.35)]
                  hover:shadow-[0_0_60px_rgba(239,177,74,0.5)]
                  hover:-translate-y-0.5
                "
              >
                Enrol Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <Link
              href="/contact"
                className="
                  inline-flex items-center justify-center gap-2
                  border border-gray-700 hover:border-gray-500
                  text-gray-300 hover:text-white
                  font-semibold
                  px-8 py-4 rounded-xl
                  text-base
                  transition-all duration-200
                  bg-white/5 hover:bg-white/10
                "
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Speak to Us
              </Link>
            </div>
          </div>

          {/* Right: Card stack */}
          <div className="relative h-[420px] hidden lg:block">

            {/* Back card */}
            <div className="absolute top-8 right-8 left-8 bottom-0 bg-[#EFB14A]/5 border border-[#EFB14A]/10 rounded-2xl" />

            {/* Mid card */}
            <div className="absolute top-4 right-4 left-4 bottom-0 bg-[#EFB14A]/8 border border-[#EFB14A]/15 rounded-2xl" />

            {/* Front card */}
            <div className="absolute inset-0 bg-[#111]/90 border border-[#EFB14A]/25 rounded-2xl p-8 flex flex-col justify-between backdrop-blur-sm">

              <div>
                <p className="text-[#EFB14A] text-xs font-bold uppercase tracking-[0.15em] mb-4">
                  What you'll get
                </p>
                <div className="space-y-3">
                  {[
                    'Hands-on AI & ML projects',
                    'Industry-recognized certification',
                    'Mentorship from working professionals',
                    'Career placement support',
                    'Lifetime community access',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#EFB14A]/15 border border-[#EFB14A]/30 flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5 text-[#EFB14A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom trust strip */}
              <div className="border-t border-white/5 pt-5 flex items-center justify-between">
                <p className="text-gray-500 text-xs">Trusted across Africa & beyond</p>
                <div className="flex -space-x-2">
                  {['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500'].map((c, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-[#111]`} />
                  ))}
                  <div className="w-7 h-7 rounded-full bg-[#EFB14A]/20 border-2 border-[#111] flex items-center justify-center">
                    <span className="text-[8px] text-[#EFB14A] font-bold">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}