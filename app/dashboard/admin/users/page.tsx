'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { adminService } from '@/services/adminService'
import { User } from '@/types'

// Badge styles
const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-purple-500/20 text-purple-400',
  instructor: 'bg-blue-500/20 text-blue-400',
  student: 'bg-green-500/20 text-green-400',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  suspended: 'bg-red-500/20 text-red-400',
  graduated: 'bg-yellow-500/20 text-yellow-400',
}

function initials(first?: string, last?: string) {
  return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase()
}

export default function AdminUsersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch users once
  const fetchUsers = useCallback(async () => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== 'admin') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await adminService.getAllUsers()
      if (response.success && Array.isArray(response.data)) {
        setAllUsers(response.data)
      } else {
        setAllUsers([])
        setError(response.error || 'Failed to fetch users')
      }
    } catch (err: any) {
      setAllUsers([])
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [authLoading, isAuthenticated, user])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Client-side filtered users
  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase()
    return allUsers.filter(
      u =>
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    )
  }, [allUsers, search])

  // Handle role update
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId)
      const response = await adminService.updateUserRole(userId, newRole)
      
      if (response.success) {
        // Update local state
        setAllUsers(prev =>
          prev.map(usr =>
            usr._id === userId ? { ...usr, role: newRole as User['role'] } : usr
          )
        )
      } else {
        setError(response.error || 'Failed to update role')
        // Revert to original value by refetching
        await fetchUsers()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update role')
      await fetchUsers()
    } finally {
      setActionLoading(null)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      setActionLoading(userId)
      const response = await adminService.updateUserStatus(userId, newStatus)
      
      if (response.success) {
        // Update local state
        setAllUsers(prev =>
          prev.map(usr =>
            usr._id === userId ? { ...usr, status: newStatus as User['status'] } : usr
          )
        )
      } else {
        setError(response.error || 'Failed to update status')
        await fetchUsers()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
      await fetchUsers()
    } finally {
      setActionLoading(null)
    }
  }

  // Handle user deletion
  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(userId)
      const response = await adminService.deleteUser(userId)
      
      if (response.success) {
        // Remove from local state
        setAllUsers(prev => prev.filter(u => u._id !== userId))
      } else {
        setError(response.error || 'Failed to delete user')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="bg-slate-800 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
          />
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

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(u => {
              const isActionLoading = actionLoading === u._id
              
              return (
                <div
                  key={u._id}
                  className={`bg-slate-800/50 backdrop-blur rounded-xl shadow-lg p-4 flex flex-col gap-3 hover:scale-[1.02] transition-transform ${
                    isActionLoading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-lg">
                      {initials(u.firstName, u.lastName)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-gray-400 text-sm truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                      disabled={isActionLoading}
                      className={`${ROLE_STYLES[u.role]} px-2 py-1 rounded-xl text-sm bg-opacity-30 border border-gray-700 transition cursor-pointer hover:bg-opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>

                    <select
                      value={u.status}
                      onChange={(e) => handleStatusUpdate(u._id, e.target.value)}
                      disabled={isActionLoading}
                      className={`${STATUS_STYLES[u.status]} px-2 py-1 rounded-xl text-sm bg-opacity-30 border border-gray-700 transition cursor-pointer hover:bg-opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="graduated">Graduated</option>
                    </select>

                    <button
                      onClick={() => handleDelete(u._id)}
                      disabled={isActionLoading}
                      className="ml-auto text-red-400 hover:text-red-600 font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isActionLoading ? 'Processing...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center mt-12">No users found.</p>
        )}
      </div>
    </div>
  )
}