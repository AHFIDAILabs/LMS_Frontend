import { motion } from 'framer-motion'
import { ArrowRight, Zap, Users, Briefcase, Clock } from 'lucide-react'

interface CategoryCardData {
  id: string
  title: string
  description: string
  icon: React.ElementType
  gradient: string
  accentColor: 'lime' | 'emerald' | 'yellow'
  coverImage?: string
  stats: {
    programs: number
    students: number
    duration: string
  }
  features: string[]
  href: string
}

interface CategoryGridProps {
  title?: string
  subtitle?: string
}

const accentStyles = {
  lime: {
    border: 'border-lime-500/20 hover:border-lime-500/40',
    bg: 'bg-lime-500/5 hover:bg-lime-500/10',
    text: 'text-lime-400',
    gradient: 'from-lime-400 to-lime-500',
    dot: 'bg-lime-400',
    ctaBg: 'bg-lime-500/10 group-hover:bg-lime-500/20'
  },
  emerald: {
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
    text: 'text-emerald-400',
    gradient: 'from-emerald-400 to-emerald-500',
    dot: 'bg-emerald-400',
    ctaBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20'
  },
  yellow: {
    border: 'border-yellow-500/20 hover:border-yellow-500/40',
    bg: 'bg-yellow-500/5 hover:bg-yellow-500/10',
    text: 'text-yellow-400',
    gradient: 'from-yellow-400 to-yellow-500',
    dot: 'bg-yellow-400',
    ctaBg: 'bg-yellow-500/10 group-hover:bg-yellow-500/20'
  }
}

export const CategoryGrid = ({
  title = "Explore Our Programs",
  subtitle = "Choose the learning path that fits your career goals"
}: CategoryGridProps) => {

  const categories: CategoryCardData[] = [
    {
      id: 'bootcamps',
      title: 'Bootcamps',
      description: 'Intensive hands-on training designed to transform you into a job-ready professional in AI & Data Science',
      icon: Zap,
      gradient: 'from-lime-400 to-lime-500',
      accentColor: 'lime',
      coverImage: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      stats: {
        programs: 8,
        students: 150,
        duration: '12-16 weeks'
      },
      features: [
        'Project-based learning',
        'Industry mentorship',
        'Job placement support',
        'Portfolio building'
      ],
      href: '#bootcamps'
    },
    {
      id: 'fellowships',
      title: 'Fellowships',
      description: 'Advanced learning programs with expert mentorship, networking opportunities, and real-world project experience',
      icon: Users,
      gradient: 'from-emerald-400 to-emerald-500',
      accentColor: 'emerald',
      coverImage: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      stats: {
        programs: 5,
        students: 85,
        duration: '6-12 months'
      },
      features: [
        'Expert guidance',
        'Industry networking',
        'Research opportunities',
        'Certificate of completion'
      ],
      href: '#fellowships'
    },
    {
      id: 'ai-programs',
      title: 'AI Programs',
      description: 'Specialized courses in cutting-edge AI technologies, machine learning, and emerging tech innovations',
      icon: Briefcase,
      gradient: 'from-yellow-400 to-yellow-500',
      accentColor: 'yellow',
      coverImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      stats: {
        programs: 12,
        students: 200,
        duration: '4-8 weeks'
      },
      features: [
        'Flexible learning pace',
        'Real-world projects',
        'Industry certifications',
        'Lifetime access'
      ],
      href: '/programs/[category]'
    }
  ]

  return (
    <section className="py-24 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon
            const styles = accentStyles[category.accentColor]

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <a href={category.href}>
                  <div className={`
                    group relative overflow-hidden rounded-2xl border backdrop-blur-sm
                    ${styles.border} ${styles.bg}
                    transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-${category.accentColor}-500/10
                    cursor-pointer h-full flex flex-col min-h-[600px]
                  `}>

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative h-64 overflow-hidden bg-slate-900">
                      {category.coverImage ? (
                        <img
                          src={category.coverImage}
                          alt={category.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${category.gradient}`}>
                          <Icon className="w-24 h-24 text-white/30" />
                        </div>
                      )}

                      <div className="absolute top-6 left-6 p-4 rounded-xl backdrop-blur-sm bg-slate-900/80 border border-white/10">
                        <Icon className={`w-8 h-8 ${styles.text}`} />
                      </div>
                    </div>

                    <div className="relative p-8 flex-1 flex flex-col">

                      <h3 className={`text-3xl font-bold text-white mb-3 group-hover:${styles.text} transition-colors`}>
                        {category.title}
                      </h3>

                      <p className="text-gray-400 mb-6 leading-relaxed">
                        {category.description}
                      </p>

                      {/* <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-800/50">
                        <div className="text-center">
                          <div className={`text-2xl font-bold bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent mb-1`}>
                            {category.stats.programs}+
                          </div>
                          <div className="text-xs text-gray-500">Programs</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent mb-1`}>
                            {category.stats.students}+
                          </div>
                          <div className="text-xs text-gray-500">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400 font-semibold mb-1 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Duration</span>
                          </div>
                          <div className="text-xs text-gray-500">{category.stats.duration}</div>
                        </div>
                      </div> */}

                      <div className="space-y-2 mb-6">
                        {category.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                            <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                            {feature}
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto">
                        <div  className={`flex items-center justify-between p-4 rounded-lg ${styles.ctaBg} transition-all duration-300`}>
                          <span className={`font-bold ${styles.text}`}>
                            Explore Programs
                          </span>
                          <ArrowRight className={`w-5 h-5 ${styles.text} group-hover:translate-x-1 transition-transform duration-300`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </motion.div>
            )
          })}
        </div>

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
