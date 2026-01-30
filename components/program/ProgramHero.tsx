'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, TrendingUp, Award } from 'lucide-react'
import Link from 'next/link'

export const ProgramHero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden bg-linear-to-br from-[#2A434E] via-[#1f3238] to-[#2A434E]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF6B35]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-sm font-semibold text-white">Professional Learning Programs</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Transform Your Career With
              <span className="text-[#FF6B35]"> Expert-Led Programs</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 mb-8 max-w-xl"
            >
              Master in-demand skills through comprehensive, structured learning paths designed by industry experts. Build real-world projects and earn recognized certifications.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/allPrograms">
                <button className="group px-8 py-4 bg-[#FF6B35] text-white rounded-full font-semibold hover:bg-[#f85a28] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/50">
                  Explore Programs
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/courses">
                <button className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                  View Course Catalog
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10"
            >
              <div>
                <div className="text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-sm text-gray-400">Expert Instructors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-sm text-gray-400">Students Enrolled</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">95%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FF6B35]/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#FF6B35]/20 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Career Growth</h3>
                <p className="text-gray-400 text-sm">Fast-track your career with industry-relevant skills</p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FF6B35]/50 transition-all duration-300 mt-12"
              >
                <div className="w-12 h-12 bg-[#FF6B35]/20 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Certification</h3>
                <p className="text-gray-400 text-sm">Earn recognized certificates to showcase your expertise</p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FF6B35]/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#FF6B35]/20 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Real Projects</h3>
                <p className="text-gray-400 text-sm">Build portfolio-worthy projects with hands-on practice</p>
              </motion.div>

              {/* Card 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-linear-to-br from-[#FF6B35] to-[#f85a28] rounded-2xl p-6 shadow-lg shadow-[#FF6B35]/20 mt-12"
              >
                <div className="text-white/90 text-sm font-semibold mb-2">Popular</div>
                <h3 className="text-white font-bold text-lg mb-2">AI Engineering</h3>
                <p className="text-white/80 text-sm mb-4">Master the future of technology</p>
                <Link href="/programs/ai-engineering">
                  <button className="text-white text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    View Program <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}