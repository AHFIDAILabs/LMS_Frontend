'use client'

import { Navbar } from '@/components/layout/NavBar'
import { HeroSection } from '@/components/sections/HeroSection'
import { CurriculumSection } from '@/components/sections/CurriculumSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { CTASection } from '@/components/sections/CTASection'
import { Footer } from "@/components/layout/Footer"
import { InstructorsSection } from '@/components/sections/ourInstructor'

export default function HomePage() {
  const curriculum = [
    {
      week: 'Week 1-2',
      title: 'AI Foundations',
      description: 'Python programming, ML fundamentals, and data structures for AI applications',
      duration: '10h',
      lessons: 12,
    },
    {
      week: 'Week 3-4',
      title: 'Machine Learning',
      description: 'Supervised and unsupervised learning, model training and evaluation',
      duration: '12h',
      lessons: 15,
    },
    {
      week: 'Week 5-6',
      title: 'Deep Learning',
      description: 'Neural networks, CNNs, RNNs with TensorFlow and PyTorch',
      duration: '12h',
      lessons: 14,
    },
    {
      week: 'Week 7-8',
      title: 'NLP & Vision',
      description: 'Natural language processing and computer vision applications',
      duration: '10h',
      lessons: 12,
    },
    {
      week: 'Week 9-10',
      title: 'Production AI',
      description: 'Deployment, MLOps, scaling, and best practices',
      duration: '10h',
      lessons: 10,
    },
    {
      week: 'Week 11-12',
      title: 'Capstone Project',
      description: 'Build and deploy your production-ready AI application',
      duration: '20h',
      lessons: 1,
    },
  ]

  const features = [
    {
      icon: '📚',
      title: 'Comprehensive Materials',
      description: 'Access course content, code samples, and documentation',
    },
    {
      icon: '👨‍🏫',
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with real experience',
    },
    {
      icon: '🎓',
      title: 'Certification',
      description: 'Earn a recognized certificate upon completion',
    },
    {
      icon: '💻',
      title: 'Hands-on Projects',
      description: 'Build real AI applications throughout the program',
    },
    {
      icon: '🤝',
      title: 'Community Support',
      description: 'Connect with peers and get help when needed',
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with analytics',
    },
  ]

  return (
    <main className="min-h-screen bg-[#2A434E]">
      <Navbar />
      
      <div className="pt-2 flex content-center items-center justify-center bg-[#2A434E]">
        <HeroSection />
      </div>

      <CurriculumSection modules={curriculum} />
      <FeaturesSection features={features} />
      <ProcessSection />
      <StatsSection />
      <InstructorsSection instructors={[]} />
      <CTASection />
      <Footer />
    </main>
  )
}