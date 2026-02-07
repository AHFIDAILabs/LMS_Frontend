'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { programService } from '@/services/programService'
import { Award, Eye, Edit, Trash2, Globe, Lock, Plus, BookOpen, Users } from 'lucide-react'
import Link from 'next/link'

interface Program {
  _id: string
  name: string
  description: string
  category?: string
  isPublished: boolean
  courses?: any[]
  enrollmentCount?: number
  createdAt: string
}

export default function AdminProgramsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [programs, setPrograms] = useState<Program[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch programs
  const fetchPrograms = useCallback(async () => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== 'admin') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const params: any = {}
      if (filterStatus !== 'all') {
        params.isPublished = filterStatus === 'published'
      }

      const response = await programService.getPrograms(params)
      
      if (response.success && Array.isArray(response.data)) {
        setPrograms(response.data)
      } else {
        setPrograms([])
        setError(response.error || 'Failed to fetch programs')
      }
    } catch (err: any) {
      setPrograms([])
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [authLoading, isAuthenticated, user, filterStatus])

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  // Client-side filtered programs
  const filteredPrograms = useMemo(() => {
  const term = search.toLowerCase()
  return programs.filter(
    p =>
      (p.name ?? '').toLowerCase().includes(term) ||
      (p.description ?? '').toLowerCase().includes(term) ||
      (p.category ?? '').toLowerCase().includes(term)
  )
}, [programs, search])


  // Toggle publish status
  const handleTogglePublish = async (programId: string) => {
    try {
      setActionLoading(programId)
      const response = await programService.togglePublish(programId)
      
      if (response.success) {
        setPrograms(prev =>
          prev.map(p =>
            p._id === programId ? { ...p, isPublished: !p.isPublished } : p
          )
        )
      } else {
        setError(response.error || 'Failed to toggle publish status')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle publish status')
    } finally {
      setActionLoading(null)
    }
  }

  // Delete program
  const handleDeleteProgram = async (programId: string, programName: string) => {
    if (!confirm(`Are you sure you want to delete "${programName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setActionLoading(programId)
      const response = await programService.deleteProgram(programId)
      
      if (response.success) {
        setPrograms(prev => prev.filter(p => p._id !== programId))
      } else {
        setError(response.error || 'Failed to delete program')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete program')
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Program Management</h1>
            <p className="text-gray-400 mt-1">Manage all programs across the platform</p>
          </div>
          
          <Link
            href="/dashboard/admin/programes/create"
            className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-slate-900 px-4 py-2 rounded-xl font-semibold transition-colors"
          >
            <Plus size={20} />
            Create Program
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programs..."
            className="flex-1 bg-slate-800 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-800 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
          >
            <option value="all">All Programs</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Programs</p>
            <p className="text-2xl font-bold text-white mt-1">{programs.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Published</p>
            <p className="text-2xl font-bold text-lime-400 mt-1">
              {programs.filter(p => p.isPublished).length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Draft</p>
            <p className="text-2xl font-bold text-gray-400 mt-1">
              {programs.filter(p => !p.isPublished).length}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-300 text-sm underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Program List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPrograms.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPrograms.map(program => {
              const isActionLoading = actionLoading === program._id
              const courseCount = program.courses?.length || 0
              
              return (
                <div
                  key={program._id}
                  className={`bg-slate-800/50 backdrop-blur rounded-xl shadow-lg border border-gray-700 hover:border-gray-600 transition-all overflow-hidden ${
                    isActionLoading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {/* Header with gradient */}
                  <div className="relative h-32 bg-linear-to-br from-lime-500/20 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
                    <Award size={48} className="text-lime-400" />
                    
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        program.isPublished 
                          ? 'bg-lime-500/20 text-lime-400 border-lime-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {program.isPublished ? (
                          <span className="flex items-center gap-1">
                            <Globe size={12} /> Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Lock size={12} /> Draft
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {program.name}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {program.description || 'No description available'}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 pb-4 border-b border-gray-700">
                      <span className="flex items-center gap-2">
                        <BookOpen size={16} className="text-lime-400" />
                        {courseCount} {courseCount === 1 ? 'course' : 'courses'}
                      </span>
                      
                      {program.enrollmentCount !== undefined && (
                        <span className="flex items-center gap-2">
                          <Users size={16} className="text-blue-400" />
                          {program.enrollmentCount} enrolled
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/dashboard/admin/programes/${program._id}`}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                      
                      <Link
                        href={`/dashboard/admin/programs/${program._id}/edit`}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                      >
                        <Edit size={16} />
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleTogglePublish(program._id)}
                        disabled={isActionLoading}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          program.isPublished
                            ? 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400'
                            : 'bg-lime-500/20 hover:bg-lime-500/30 text-lime-400'
                        }`}
                      >
                        {program.isPublished ? (
                          <>
                            <Lock size={16} />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Globe size={16} />
                            Publish
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProgram(program._id, program.name)}
                        disabled={isActionLoading}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No programs found.</p>
            {search && (
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}