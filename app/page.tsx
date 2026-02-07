'use client'

import { Navbar } from '@/components/layout/NavBar'
import { ProgramHero } from '@/components/program/ProgramHero'
import {NewProgramGrid} from "@/components/program/NewProgramGrid"
import { CategoryGrid } from '@/components/program/categoryGrid'
import { FeaturedCourses } from '@/components/sections/FeaturedCourseSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { InstructorsSection } from '@/components/sections/ourInstructor'
import { CTASection } from '@/components/sections/CTASection'
import { Footer } from '@/components/layout/Footer'
import { usePrograms } from '../hooks/useProgram'
import { Course } from '@/types'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { programs, loading, error } = usePrograms({ isPublished: true })
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])

  // Extract featured courses from all programs
  useEffect(() => {
    if (programs.length > 0) {
      const allCourses: Course[] = []
      
      programs.forEach(program => {
        if (program.courses && Array.isArray(program.courses)) {
          allCourses.push(...program.courses)
        }
      })

      // Get unique courses and shuffle them, then take first 4
      const uniqueCourses = allCourses.filter((course, index, self) =>
        index === self.findIndex((c) => c._id === course._id)
      )
      
      const shuffled = uniqueCourses.sort(() => 0.5 - Math.random())
      setFeaturedCourses(shuffled.slice(0, 4))
    }
  }, [programs])

  return (
    <main className="min-h-screen bg-[#2A434E]">
      <Navbar />
      
      {/* Hero Section */}
      <ProgramHero />

      {/* Programs Section */}
      <div id="programs">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Loading programs...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-400">Error loading programs: {error}</p>
          </div>
        ) : (
          <CategoryGrid 

            title="Explore Our Programs"
            subtitle="Comprehensive learning paths designed to take you from beginner to expert"
          />
        )}
      </div>

     {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
      <FeaturedCourses 
  title="Featured Courses"
  subtitle="Popular courses across all our programs to jumpstart your learning"
/> 
      )}

      {/* How It Works */}
      <ProcessSection />

      {/* Platform Statistics */}
      <StatsSection />

      {/* Featured Instructors */}
      <InstructorsSection instructors={[]} />

      {/* Call to Action */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  )
}