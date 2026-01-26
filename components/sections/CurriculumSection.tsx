import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function CurriculumSection({ modules }: { modules: any[] }) {
  return (
    <section className="relative p-10 bg-linear-to-b from-slate-800/90 via-slate-700/80 to-slate-600/80 overflow-hidden rounded-xl">

      {/* Ambient glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-lime-500/10 blur-[140px] rounded-full" />
      <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full" />

      <div className="container-custom relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge
            variant="primary"
            className="mb-6 bg-white text-[#EFB14A] border-[#EFB14A]"
          >
            Cutting-edge Program
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Program Curriculum
          </h2>

          <p className="text-gray-300 text-lg">
            A carefully designed roadmap from beginner to production-ready AI engineer.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {modules.map((module, idx) => (
            <Card
              key={idx}
              className="
                bg-slate-900/90
                border border-gray-700
                rounded-2xl
                p-6
                hover:border-lime-400/40
                transition
                group
                shadow-[0_0_20px_rgba(239,177,74,0.2)]
              "
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-[#EFB14A] font-medium">
                  {module.week}
                </span>

                <span className="text-xs text-gray-400">
                  ⏱ {module.duration}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#EFB14A] transition">
                {module.title}
              </h3>

              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {module.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  📘 {module.lessons} lessons
                </span>

                <Button
                  size="sm"
                  className="
                    bg-[#EFB14A] text-black
                    hover:bg-lime-300
                    transition
                  "
                >
                  View
                </Button>
              </div>
            </Card>
          ))}

        </div>
      </div>
    </section>
  )
}
