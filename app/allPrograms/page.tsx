'use client'

import { useState, useMemo } from 'react'
import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { ProgramsGrid } from '@/components/program/programGrid'
import { usePrograms } from '@/hooks/useProgram'
import { Search, Filter, X } from 'lucide-react'

export default function ProgramsPage() {
  // ------------------------
  // State & Hooks
  // ------------------------
  const { programs, loading, error } = usePrograms({ isPublished: true })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')

  // ------------------------
  // Memoized derived data
  // ------------------------
  const categories = useMemo(() => {
    if (!programs || programs.length === 0) return []
    const cats = programs.map(p => p.category).filter(Boolean)
    return Array.from(new Set(cats))
  }, [programs])

  const tags = useMemo(() => {
    if (!programs || programs.length === 0) return []
    const allTags = programs.flatMap(p => p.tags || [])
    return Array.from(new Set(allTags))
  }, [programs])

  const filteredPrograms = useMemo(() => {
    if (!programs || programs.length === 0) return []

    return programs.filter(program => {
      const matchesSearch =
        !searchQuery ||
        program.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = !selectedCategory || program.category === selectedCategory
      const matchesTag = !selectedTag || program.tags?.includes(selectedTag)

      return matchesSearch && matchesCategory && matchesTag
    })
  }, [programs, searchQuery, selectedCategory, selectedTag])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedTag('')
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedTag

  // ------------------------
  // Render
  // ------------------------
  return (
    <main className="min-h-screen bg-[#2A434E]">
      <Navbar />

      {/* Page Header */}
      <div className="pt-24 pb-12 px-4 bg-linear-to-b from-[#1f3238] to-[#2A434E]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            All Programs
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Browse our complete catalog of professional learning programs
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="sticky top-16 z-40 bg-[#2A434E]/95 backdrop-blur-sm border-b border-white/10 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF6B35] transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#2A434E] text-white">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-[#2A434E] text-white">{cat}</option>
              ))}
            </select>
          )}

          {/* Tag Filter */}
          {tags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF6B35] transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#2A434E] text-white">All Tags</option>
              {tags.map(tag => (
                <option key={tag} value={tag} className="bg-[#2A434E] text-white">{tag}</option>
              ))}
            </select>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 bg-[#FF6B35]/10 border border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/20 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mt-4 text-gray-400 text-sm max-w-7xl mx-auto">
            {hasActiveFilters ? (
              <>Showing <span className="text-[#FF6B35] font-semibold">{filteredPrograms.length}</span> of <span className="text-white font-semibold">{programs.length}</span> programs</>
            ) : (
              <>Showing all <span className="text-white font-semibold">{programs.length}</span> programs</>
            )}
          </div>
        )}
      </div>

      {/* Programs Content */}
      <div className="py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Loading programs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-xl mb-2">Error loading programs</p>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#FF6B35] text-white rounded-full hover:bg-[#f85a28] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white text-xl mb-2">No programs available</p>
            <p className="text-gray-400">Check back soon for new programs!</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">No programs found</p>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search query</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-[#FF6B35] text-white rounded-full hover:bg-[#f85a28] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <ProgramsGrid
            programs={filteredPrograms}
            title=""
            subtitle=""
            showAll={true}
          />
        )}
      </div>

      <Footer />
    </main>
  )
}
