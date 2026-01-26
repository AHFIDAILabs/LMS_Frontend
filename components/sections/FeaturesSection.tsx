import { Badge } from "../ui/Badge";

export function FeaturesSection({ features }: { features: any[] }) {
  return (
    <section className="relative p-10 bg-linear-to-b from-slate-700/90 via-slate-600/80 to-slate-500/70 overflow-hidden rounded-xl">

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-lime-400/10 blur-[140px] rounded-full" />

      <div className="container-custom relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge
            variant="success"
            className="mb-6 bg-white text-[#EFB14A] border border-[#EFB14A]"
          >
            Platform Features
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Succeed
          </h2>

          <p className="text-gray-300 text-lg">
            Powerful tools designed to accelerate your AI journey.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, idx) => (
            <div
              key={idx}
              className="
                bg-slate-900/90
                border border-gray-700
                rounded-2xl
                p-8
                transition
                group
                hover:-translate-y-1.5
                hover:shadow-[0_10px_30px_rgba(132,204,22,0.2)]
                hover:border-lime-400/40
              "
            >

              {/* Icon */}
              <div className="
                w-14 h-14
                rounded-xl
                bg-lime-500/10
                border border-lime-500/20
                flex items-center justify-center
                text-2xl
                mb-6
                group-hover:scale-110
                transition
              ">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="
                text-xl font-semibold text-white mb-3
                group-hover:text-[#] transition
              ">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed text-sm">
                {feature.description}
              </p>

            </div>
          ))}

        </div>
      </div>
    </section>
  )
}
