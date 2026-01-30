'use client'

import { Navbar } from '@/components/layout/NavBar'
import { ProgramHero } from '@/components/program/ProgramHero'
import { ProgramsGrid } from '@/components/program/programGrid'
import { FeaturedCourses } from '@/components/sections/FeaturedCourseSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { InstructorsSection } from '@/components/sections/ourInstructor'
import { CTASection } from '@/components/sections/CTASection'
import { Footer } from '@/components/layout/Footer'
import { usePrograms } from '../hooks/useProgram'
import { Course } from '@/types'
import { useEffect, useState, useMemo } from 'react'

export default function HomePage() {
  // ✅ Memoize the params to prevent infinite loop
  const params = useMemo(() => ({ isPublished: true }), []);
  const { programs, loading, error } = usePrograms(params);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])

  console.log('[HomePage] Render. Loading:', loading, 'Programs found:', programs.length);

  // Extract featured courses from all programs
  useEffect(() => {
    if (programs.length > 0) {
      console.log('[HomePage] Processing programs for featured courses...');
      const allCourses: Course[] = []
      
      programs.forEach(program => {
        if (program.courses && Array.isArray(program.courses)) {
          allCourses.push(...program.courses);
        }
      });

      // Get unique courses
      const uniqueCourses = allCourses.filter((course, index, self) =>
        index === self.findIndex((c) => c._id === course._id)
      );
      
      const shuffled = uniqueCourses.sort(() => 0.5 - Math.random());
      console.log('[HomePage] Featured courses identified:', shuffled.length);
      setFeaturedCourses(shuffled.slice(0, 4));
    }
  }, [programs]);

  return (
    <main className="min-h-screen bg-[#2A434E]">
      <Navbar />
      <ProgramHero />

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
          <ProgramsGrid 
            programs={programs} // ✅ Passing fetched data here
            title="Explore Our Programs"
            subtitle="Comprehensive learning paths designed to take you from beginner to expert"
          />
        )}
      </div>

      {featuredCourses.length > 0 && (
        <FeaturedCourses 
          courses={featuredCourses}
          title="Featured Courses"
          subtitle="Popular courses across all our programs to jumpstart your learning"
        />
      )}

      <ProcessSection />
      <StatsSection />
      <InstructorsSection instructors={[]} />
      <CTASection />
      <Footer />
    </main>
  )
}