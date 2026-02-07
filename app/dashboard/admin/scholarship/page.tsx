'use client'

import React, { useState, useEffect } from 'react'
import { scholarshipService } from '@/services/scholarshipService'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import {
  Award,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Download,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import CreateScholarshipModal from '@/components/modals/scholarshipModal'
import BulkCreateModal from '@/components/modals/BulkCreateModal'
import { toast } from 'react-hot-toast'

interface Scholarship {
  _id: string
  code: string
  programId: {
    _id: string
    title: string
    price: number
    currency: string
  }
  studentEmail?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  status: 'active' | 'used' | 'expired' | 'revoked'
  expiresAt?: string
  usedBy?: {
    firstName: string
    lastName: string
    email: string
  }
  createdBy: {
    firstName: string
    lastName: string
  }
  createdAt: string
  notes?: string
}

const ScholarshipsPage = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null)
  const [stats, setStats] = useState<any>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 20

  useEffect(() => {
    fetchScholarships()
    fetchStats()
  }, [page, statusFilter])

  const fetchScholarships = async () => {
    setLoading(true)
    const params: any = { page, limit }
    if (statusFilter !== 'all') params.status = statusFilter

    const result = await scholarshipService.getAllScholarships(params)
    if (result.success) {
      setScholarships(result.data || [])
      setTotalPages(result.pages || 1)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const result = await scholarshipService.getScholarshipStats()
    if (result.success) {
      setStats(result.data)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return

    const result = await scholarshipService.deleteScholarship(id)
    if (result.success) {
      toast.success('Scholarship deleted successfully')
      fetchScholarships()
      fetchStats()
    } else {
      toast.error(result.error || 'Failed to delete scholarship')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Code copied to clipboard!')
  }

  const filteredScholarships = scholarships.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.programId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      used: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      expired: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      revoked: 'bg-red-500/10 text-red-400 border-red-500/20',
    }

    const icons = {
      active: CheckCircle,
      used: Users,
      expired: Clock,
      revoked: Ban,
    }

    const Icon = icons[status as keyof typeof icons]

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border N{
          styles[status as keyof typeof styles]
        }`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur border-b border-gray-800">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Scholarship Management
                </h1>
                <p className="text-gray-400">
                  Create, manage, and track scholarship codes
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all border border-gray-700"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Bulk Create
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 bg-linear-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-slate-900 rounded-lg font-semibold transition-all shadow-lg shadow-lime-500/20"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create Scholarship
                </button>
              </div>
            </div>

            {/* Stats Row */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatCard
                  label="Total"
                  value={stats.total}
                  icon={Award}
                  color="text-gray-400"
                />
                <StatCard
                  label="Active"
                  value={stats.active}
                  icon={CheckCircle}
                  color="text-emerald-400"
                />
                <StatCard
                  label="Used"
                  value={stats.used}
                  icon={Users}
                  color="text-blue-400"
                />
                <StatCard
                  label="Utilization"
                  value={`${stats.utilizationRate}%`}
                  icon={Award}
                  color="text-lime-400"
                />
                <StatCard
                  label="Total Discount"
                  value={`$${stats.totalDiscountValue}`}
                  icon={Award}
                  color="text-yellow-400"
                />
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="px-8 py-6">
          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by code, program, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:outline-none transition-colors"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-900 border border-gray-800 rounded-lg text-white focus:border-lime-500 focus:outline-none transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="used">Used</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          {/* Scholarships Table */}
          <div className="bg-slate-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredScholarships.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No scholarships found
                      </td>
                    </tr>
                  ) : (
                    filteredScholarships.map((scholarship) => (
                      <tr
                        key={scholarship._id}
                        className="hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="px-3 py-1.5 bg-slate-800 text-lime-400 rounded-lg font-mono text-sm font-semibold">
                              {scholarship.code}
                            </code>
                            <button
                              onClick={() => copyToClipboard(scholarship.code)}
                              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Copy code"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">
                              {scholarship.programId.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${scholarship.programId.price}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-semibold">
                            {scholarship.discountType === 'percentage'
                              ? `${scholarship.discountValue}%`
                              : `$${scholarship.discountValue}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {scholarship.studentEmail ? (
                            <div>
                              <p className="text-white text-sm">
                                {scholarship.studentEmail}
                              </p>
                              {scholarship.usedBy && (
                                <p className="text-xs text-gray-500">
                                  Used by {scholarship.usedBy.firstName}{' '}
                                  {scholarship.usedBy.lastName}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              General use
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(scholarship.status)}
                        </td>
                        <td className="px-6 py-4">
                          {scholarship.expiresAt ? (
                            <p className="text-sm text-gray-400">
                              {new Date(scholarship.expiresAt).toLocaleDateString()}
                            </p>
                          ) : (
                            <span className="text-gray-600 text-sm">
                              No expiration
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {scholarship.status !== 'used' && (
                              <button
                                onClick={() => handleDelete(scholarship._id)}
                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateScholarshipModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchScholarships()
            fetchStats()
          }}
        />
      )}

      {showBulkModal && (
        <BulkCreateModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            fetchScholarships()
            fetchStats()
          }}
        />
      )}
    </div>
  )
}

// Stat Card Component
const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  icon: any
  color: string
}) => (
  <div className="bg-slate-900 border border-gray-800 rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-500">{label}</span>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
)

export default ScholarshipsPage