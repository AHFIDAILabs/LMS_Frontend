'use client'

import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { 
  Target, 
  Eye, 
  Heart, 
  Award, 
  Users, 
  Globe, 
  Zap, 
  TrendingUp,
  BookOpen,
  Lightbulb,
  Shield,
  Rocket
} from 'lucide-react'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-lime-500/5 via-transparent to-emerald-500/5" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Building Africa's
              <br />
              <span className="bg-linear-to-r from-lime-400 via-emerald-400 to-lime-500 bg-clip-text text-transparent">
                AI-Powered Future
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              AI4SID Academy empowers African innovators with cutting-edge skills in AI, 
              data science, and digital policy to drive sustainable development across the continent.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-slate-900/50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ValueCard
              icon={<Target className="w-8 h-8" />}
              title="Our Mission"
              description="To democratize AI education across Africa, equipping the next generation with skills to solve local challenges and compete globally."
              color="lime"
            />
            <ValueCard
              icon={<Eye className="w-8 h-8" />}
              title="Our Vision"
              description="A future where African innovators lead in AI development, creating solutions that transform communities and drive sustainable growth."
              color="emerald"
            />
            <ValueCard
              icon={<Heart className="w-8 h-8" />}
              title="Our Values"
              description="Excellence, inclusivity, innovation, and impact. We believe in empowering every learner to achieve their full potential."
              color="yellow"
            />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Story</h2>
              <div className="w-20 h-1 bg-linear-to-r from-lime-400 to-emerald-500 mx-auto" />
            </div>

            <div className="space-y-8 text-gray-400 leading-relaxed">
              <p className="text-lg">
                Founded in 2023, AI4SID Academy was born from a simple observation: Africa has 
                immense talent, but lacks access to world-class AI and data science education. 
                We set out to change that.
              </p>
              <p className="text-lg">
                Our journey began with a small cohort of 20 students in Lagos, Nigeria. Today, 
                we've trained over 275 students across 12 African countries, with an 87% completion 
                rate and countless success stories of career transformations and innovative projects.
              </p>
              <p className="text-lg">
                We partner with industry leaders, government agencies, and international organizations 
                to provide not just education, but pathways to meaningful careers and entrepreneurial 
                opportunities in the AI sector.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-slate-900/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-gray-400 text-lg">Making a difference across Africa</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <StatCard number="275+" label="Students Trained" icon={<Users />} />
            <StatCard number="87%" label="Completion Rate" icon={<Award />} />
            <StatCard number="12" label="Countries" icon={<Globe />} />
            <StatCard number="40+" label="Industry Partners" icon={<Zap />} />
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">What We Offer</h2>
            <div className="w-20 h-1 bg-linear-to-r from-lime-400 to-emerald-500 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <OfferingCard
              icon={<Rocket className="w-8 h-8" />}
              title="Bootcamps"
              description="Intensive programs designed to take you from beginner to job-ready in AI, machine learning, and data science."
              features={[
                'Hands-on projects',
                'Industry mentorship',
                'Career support',
                'Certification'
              ]}
              color="lime"
            />
            <OfferingCard
              icon={<Users className="w-8 h-8" />}
              title="Fellowships"
              description="Advanced programs with research opportunities, expert guidance, and direct industry connections."
              features={[
                'Research projects',
                'Expert mentorship',
                'Networking events',
                'Publication support'
              ]}
              color="emerald"
            />
            <OfferingCard
              icon={<BookOpen className="w-8 h-8" />}
              title="AI Programs"
              description="Specialized courses in cutting-edge AI technologies with flexible learning schedules and real-world applications."
              features={[
                'Flexible pace',
                'Expert instructors',
                'Practical projects',
                'Industry credentials'
              ]}
              color="yellow"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-slate-900/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose AI4SID Academy</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We're not just another online course. We're your partner in building a successful AI career.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="African Context"
              description="Curriculum designed specifically for African challenges and opportunities"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Expert Instructors"
              description="Learn from AI practitioners with real-world experience in Africa and globally"
            />
            <FeatureCard
              icon={<Lightbulb className="w-6 h-6" />}
              title="Project-Based Learning"
              description="Build real solutions to actual problems facing African communities"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Career Support"
              description="Job placement assistance, portfolio building, and interview preparation"
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Global Network"
              description="Connect with alumni, industry partners, and innovators across Africa"
            />
            <FeatureCard
              icon={<Award className="w-6 h-6" />}
              title="Recognized Credentials"
              description="Industry-recognized certifications that employers trust and value"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join hundreds of African innovators building the future with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="px-8 py-4 bg-linear-to-r from-lime-400 to-emerald-500 text-slate-900 rounded-xl font-semibold hover:from-lime-500 hover:to-emerald-600 transition-all shadow-lg shadow-lime-500/20"
              >
                Get Started Today
              </a>
              <a
                href="/allPrograms"
                className="px-8 py-4 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all border border-gray-700"
              >
                Explore Programs
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Components
function ValueCard({ icon, title, description, color }: any) {
  const colors = {
    lime: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-linear-to-br from-lime-500/5 to-emerald-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
      <div className="relative bg-slate-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all">
        <div className={`inline-flex p-4 rounded-xl ${colors[color as keyof typeof colors]} mb-4`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function StatCard({ number, label, icon }: any) {
  return (
    <div className="text-center group">
      <div className="inline-flex p-4 rounded-2xl bg-slate-900 border border-gray-800 mb-4 group-hover:border-lime-500/30 transition-all">
        <div className="text-lime-400">{icon}</div>
      </div>
      <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-400 font-medium">{label}</div>
    </div>
  )
}

function OfferingCard({ icon, title, description, features, color }: any) {
  const colors = {
    lime: {
      bg: 'bg-lime-500/10',
      text: 'text-lime-400',
      border: 'border-lime-500/20',
      dot: 'bg-lime-400'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-400'
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
      dot: 'bg-yellow-400'
    },
  }

  const c = colors[color as keyof typeof colors]

  return (
    <div className={`bg-slate-900 border ${c.border} rounded-2xl p-8 hover:border-opacity-40 transition-all`}>
      <div className={`inline-flex p-4 rounded-xl ${c.bg} ${c.text} mb-4`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-3">
        {features.map((feature: string, idx: number) => (
          <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
            <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-slate-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all group">
      <div className="inline-flex p-3 rounded-lg bg-lime-500/10 text-lime-400 mb-4 group-hover:bg-lime-500/20 transition-all">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}