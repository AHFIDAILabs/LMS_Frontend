import { Badge } from "../ui/Badge"

export function ProcessSection() {
  const steps = [
    { step: '01', title: 'Enroll', desc: 'Sign up and get instant access to all course materials' },
    { step: '02', title: 'Learn', desc: 'Follow the structured curriculum at your own pace' },
    { step: '03', title: 'Practice', desc: 'Complete quizzes and hands-on projects' },
    { step: '04', title: 'Certify', desc: 'Earn your certificate and showcase your skills' },
  ]

  return (
    <section className="relative p-10 bg-linear-to-b from-slate-700/90 via-slate-600/80 to-slate-500/70 overflow-hidden rounded-xl">

      {/* Ambient glows */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] h-[600px] bg-lime-500/10 blur-[140px] rounded-full" />
      <div className="absolute right-1/4 bottom-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[140px] rounded-full" />

      <div className="container-custom relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge
            variant="primary"
            className="mb-6 bg-white text-[#EFB14A] border border-[#EFB14A]"
          >
            Simple Process
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold text-white">
            How It Works
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">

          {/* Connector line */}
          <div className="
            hidden md:block
            absolute
            top-10 left-0 right-0
            h-[2px]
            bg-linear-to-r from-[#EFB14A] via-lime-500/40 to-[#EFB14A]
          " />

          <div className="grid md:grid-cols-4 gap-12">

            {steps.map((item, idx) => (
              <div key={idx} className="text-center group relative">

                {/* Step bubble */}
                <div className="
                  w-20 h-20
                  mx-auto
                  rounded-2xl
                  bg-slate-900/90
                  border border-lime-500/30
                  text-[#EFB14A]
                  text-3xl font-bold
                  flex items-center justify-center
                  mb-6
                  shadow-[0_0_40px_rgba(132,204,22,0.15)]
                  group-hover:scale-110
                  group-hover:shadow-[0_0_60px_rgba(132,204,22,0.35)]
                  transition
                ">
                  {item.step}
                </div>

                {/* Title */}
                <h3 className="
                  text-xl font-semibold text-white mb-3
                  group-hover:text-[#EFB14A] transition
                ">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed">
                  {item.desc}
                </p>

              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  )
}
