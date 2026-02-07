'use client'

import { motion } from 'framer-motion'
import { 
  ArrowRight, Zap, Users, Briefcase, BookOpen, 
  Clock, Award, TrendingUp, CheckCircle, Star
} from 'lucide-react'
import Link from 'next/link'
import { usePrograms } from '@/hooks/useProgram'
import { Program } from '@/types'

interface CategoryLandingPageProps {
  category: 'bootcamps' | 'fellowships' | 'ai-programs'
}

export const CategoryLandingPage = ({ category }: CategoryLandingPageProps) => {
  
  // Map category to API format
  const categoryMap = {
    'bootcamps': 'bootcamp',
    'fellowships': 'fellowship',
    'ai-programs': 'ai-program'
  }

  const apiCategory = categoryMap[category]
  
  // Fetch programs for this category
  const { programs, loading, error } = usePrograms({ 
    isPublished: true,
    category: apiCategory 
  })

  // Category metadata
  const categoryMeta = {
    bootcamps: {
      title: 'Bootcamps',
      subtitle: 'Intensive hands-on training to transform you into a job-ready professional',
      description: 'Our bootcamps are designed to give you practical, industry-relevant skills in AI and Data Science. Through project-based learning and mentorship, you\'ll build a portfolio that stands out to employers.',
      icon: Zap,
      gradient: 'from-lime-400 to-lime-500',
      accentColor: 'lime-400',
      coverImage: '/images/bootcamp-hero.jpg',
      benefits: [
        'Hands-on projects with real datasets',
        'Personalized mentorship from industry experts',
        'Job placement assistance and career coaching',
        'Build a professional portfolio',
        'Network with peers and alumni',
        'Certificate of completion'
      ]
    },
    fellowships: {
      title: 'Fellowships',
      subtitle: 'Advanced learning with expert mentorship and networking opportunities',
      description: 'Join our fellowship programs to work on cutting-edge research, collaborate with industry leaders, and advance your expertise in specialized areas of AI and Data Science.',
      icon: Users,
      gradient: 'from-emerald-400 to-emerald-500',
      accentColor: 'emerald-400',
      coverImage: '/images/fellowship-hero.jpg',
      benefits: [
        'Work on real-world research projects',
        'One-on-one mentorship from leading experts',
        'Exclusive networking events and workshops',
        'Publication and presentation opportunities',
        'Stipend and funding support',
        'Professional certificate'
      ]
    },
    'ai-programs': {
      title: 'AI Programs',
      subtitle: 'Specialized courses in cutting-edge AI technologies',
      description: 'Explore our comprehensive AI programs covering machine learning, deep learning, NLP, computer vision, and more. Learn at your own pace with lifetime access to course materials.',
      icon: Briefcase,
      gradient: 'from-yellow-400 to-yellow-500',
      accentColor: 'yellow-400',
      coverImage: '/images/ai-program-hero.jpg',
      benefits: [
        'Self-paced learning with flexible deadlines',
        'Comprehensive curriculum from basics to advanced',
        'Real-world projects and case studies',
        'Industry-recognized certifications',
        'Lifetime access to course materials',
        'Active community support'
      ]
    }
  }

  const meta = categoryMeta[category]
  const Icon = meta.icon

  // Color classes for program cards
  const getProgramColorClasses = () => {
    switch (category) {
      case 'bootcamps':
        return {
          border: 'border-lime-500/20 hover:border-lime-500/40',
          bg: 'bg-lime-500/5 hover:bg-lime-500/10',
          text: 'text-lime-400',
          icon: 'bg-lime-500/10 text-lime-400'
        }
      case 'fellowships':
        return {
          border: 'border-emerald-500/20 hover:border-emerald-500/40',
          bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
          text: 'text-emerald-400',
          icon: 'bg-emerald-500/10 text-emerald-400'
        }
      case 'ai-programs':
        return {
          border: 'border-yellow-500/20 hover:border-yellow-500/40',
          bg: 'bg-yellow-500/5 hover:bg-yellow-500/10',
          text: 'text-yellow-400',
          icon: 'bg-yellow-500/10 text-yellow-400'
        }
    }
  }

  const colors = getProgramColorClasses()

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="h-[400px] bg-slate-900 animate-pulse" />
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900/50 rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={`px-6 py-3 bg-gradient-to-r ${meta.gradient} text-slate-900 font-semibold rounded-lg`}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0">
          {meta.coverImage ? (
            <img 
              src={meta.coverImage} 
              alt={meta.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${meta.gradient}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-slate-900/90" />
        </div>

        {/* Ambient Glow */}
        <div className={`absolute top-1/4 -left-20 w-96 h-96 bg-${meta.accentColor}/10 rounded-full blur-[120px]`} />
        <div className={`absolute bottom-1/4 -right-20 w-96 h-96 bg-${meta.accentColor}/10 rounded-full blur-[120px]`} />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 max-w-7xl">
          <div className="max-w-4xl">
            
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-gray-400 mb-6"
            >
              <Link href="/" className="hover:text-white transition">Home</Link>
              <span>/</span>
              <Link href="/#programs" className="hover:text-white transition">Programs</Link>
              <span>/</span>
              <span className="text-white">{meta.title}</span>
            </motion.div>

            {/* Icon Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm bg-slate-900/80 border border-white/10 mb-6"
            >
              <Icon className={`w-5 h-5 text-${meta.accentColor}`} />
              <span className={`text-sm font-semibold text-${meta.accentColor}`}>{meta.title}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              {meta.subtitle}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-300 mb-8 leading-relaxed"
            >
              {meta.description}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-8"
            >
              <div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}>
                  {programs.length}+
                </div>
                <div className="text-sm text-gray-400">Programs Available</div>
              </div>
              <div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}>
                  275+
                </div>
                <div className="text-sm text-gray-400">Students Enrolled</div>
              </div>
              <div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}>
                  4.8/5
                </div>
                <div className="text-sm text-gray-400">Average Rating</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-slate-900/30">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            What You'll Get
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meta.benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-slate-900/50 border border-gray-800/50 rounded-lg p-6"
              >
                <CheckCircle className={`w-6 h-6 text-${meta.accentColor} flex-shrink-0 mt-0.5`} />
                <span className="text-gray-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Available Programs
            </h2>
            <p className="text-gray-400">
              Choose from {programs.length} carefully designed programs
            </p>
          </div>

          {programs.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                No programs available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program: Program, index: number) => {
                const priceText = program.price === 0 ? 'Free' : `${program.currency === 'NGN' ? '₦' : '$'}${program.price?.toLocaleString()}`

                return (
                  <motion.div
                    key={program._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/programs/${program.slug}`}>
                      <div className={`
                        group relative overflow-hidden rounded-2xl border backdrop-blur-sm
                        ${colors.border} ${colors.bg}
                        transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                        cursor-pointer h-full flex flex-col
                      `}>
                        
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Image */}
                        <div className="relative h-56 overflow-hidden bg-slate-900">
                          {program.coverImage ? (
                            <img 
                              src={program.coverImage} 
                              alt={program.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${meta.gradient}`}>
                              <Icon className="w-20 h-20 text-white/30" />
                            </div>
                          )}
                          
                          {/* Price Badge */}
                          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg backdrop-blur-sm bg-slate-900/80 border border-white/10">
                            <span className="text-sm font-bold text-white">{priceText}</span>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="relative p-6 flex-1 flex flex-col">
                          <h3 className={`text-xl font-bold text-white mb-2 group-hover:${colors.text} transition-colors line-clamp-2`}>
                            {program.title}
                          </h3>
                          
                          <p className="text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                            {program.description || 'Discover cutting-edge skills and advance your career.'}
                          </p>

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 mt-auto">
                            {program.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{program.duration}</span>
                              </div>
                            )}
                            {program.enrollmentCount !== undefined && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                <span>{program.enrollmentCount} enrolled</span>
                              </div>
                            )}
                            {program.level && (
                              <div className="flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                <span className="capitalize">{program.level}</span>
                              </div>
                            )}
                          </div>

                          {/* CTA */}
                          <div className={`flex items-center gap-2 ${colors.text} font-semibold text-sm group-hover:gap-3 transition-all`}>
                            <span>Learn more</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-slate-900/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join hundreds of students transforming their careers with our {meta.title.toLowerCase()}
          </p>
          <Link 
            href="/contact"
            className={`inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r ${meta.gradient} text-slate-900 font-bold rounded-lg hover:opacity-90 transition shadow-lg shadow-${meta.accentColor}/20 text-lg`}
          >
            Talk to an Advisor
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}