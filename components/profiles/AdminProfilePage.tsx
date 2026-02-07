'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, Shield, Users, BookOpen, TrendingUp,
  Edit2, Save, X, Camera, Award, Settings, Lock, CheckCircle, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { adminService } from '@/services/adminService'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'


interface AdminProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  profileImage?: string
  role: string
  status: string
  adminProfile?: {
    permissions?: string[]
  }
  createdAt: Date
}

const ALL_PERMISSIONS = [
  { id: 'createProgram', label: 'Create Programs', description: 'Create and manage educational programs' },
  { id: 'deleteProgram', label: 'Delete Programs', description: 'Remove programs from the system' },
  { id: 'promoteInstructor', label: 'Promote Instructors', description: 'Elevate users to instructor role' },
  { id: 'demoteInstructor', label: 'Demote Instructors', description: 'Remove instructor privileges' },
  { id: 'manageUsers', label: 'Manage Users', description: 'Full user account management' },
  { id: 'viewReports', label: 'View Reports', description: 'Access analytics and reports' },
  { id: 'bulkOperations', label: 'Bulk Operations', description: 'Perform bulk actions on data' },
  { id: 'systemSettings', label: 'System Settings', description: 'Modify platform configuration' }
]

export const AdminProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()


  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await authService.getProfile()
      
      if (response.success && response.data) {
        setProfile(response.data)
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phoneNumber: response.data.phoneNumber || ''
        })
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleSave = async () => {
    // Clear previous messages
    setError(null)
    setSuccess(null)

    setSaving(true)
    
    try {
      const updateData = new FormData()
      
      // Only append fields that have values
      if (formData.firstName) updateData.append('firstName', formData.firstName)
      if (formData.lastName) updateData.append('lastName', formData.lastName)
      if (formData.phoneNumber) updateData.append('phoneNumber', formData.phoneNumber)
      
      if (imageFile) {
        updateData.append('profileImage', imageFile)
      }

      const response = await authService.updateProfile(updateData)
      
      if (response.success) {
        await fetchProfile()
        setIsEditing(false)
        setImageFile(null)
        setImagePreview(null)
        setSuccess('Profile updated successfully!')
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setImageFile(null)
    setImagePreview(null)
    setError(null)
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || ''
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    )
  }

  const hasPermission = (permission: string) => {
    return profile.adminProfile?.permissions?.includes(permission) || false
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Success/Error Messages */}
        {(error || success) && (
          <div className="mb-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-400">{success}</p>
              </div>
            )}
          </div>
        )}

        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-gray-800/50 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400/20 bg-slate-800">
                  {(imagePreview || profile.profileImage) ? (
                    <img
                      src={imagePreview || profile.profileImage}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500">
                      <span className="text-4xl font-bold text-slate-900">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-500 transition">
                    <Camera className="w-5 h-5 text-slate-900" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Administrator
                  </span>
                  <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-sm font-semibold">
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>

<div className="w-full flex justify-end md:justify-start">
  <Button
    variant="ghost"
    onClick={() => router.push('/dashboard/admin')}
    className="border border-gray-700 hover:bg-slate-800"
  >
    <ArrowLeft className="w-4 h-4 mr-2" />
    Back to Dashboard
  </Button>
</div>

            <div className="flex gap-3">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 hover:opacity-90"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 hover:opacity-90 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    className="border border-gray-700 hover:bg-slate-800"
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Personal Info */}
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-400" />
                Personal Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    />
                  ) : (
                    <p className="text-white">{profile.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    />
                  ) : (
                    <p className="text-white">{profile.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Email</label>
                  <p className="text-white">{profile.email}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      placeholder="+1234567890"
                    />
                  ) : (
                    <p className="text-white">{profile.phoneNumber || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Member Since</label>
                  <p className="text-white">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-yellow-400" />
                Permissions
              </h3>

              <div className="space-y-3">
                {ALL_PERMISSIONS.map((perm) => {
                  const enabled = hasPermission(perm.id)
                  return (
                    <div 
                      key={perm.id}
                      className={`p-3 rounded-lg border ${
                        enabled 
                          ? 'bg-yellow-400/5 border-yellow-400/20' 
                          : 'bg-slate-800/30 border-gray-700/30'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {enabled ? (
                          <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className={`text-sm font-semibold ${enabled ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {perm.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {perm.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Platform Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats?.totalUsers || 0}
                </div>
                <div className="text-sm text-gray-400">Total Users</div>
              </div>

              <div className="bg-lime-400/10 border border-lime-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-lime-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats?.totalPrograms || 0}
                </div>
                <div className="text-sm text-gray-400">Active Programs</div>
              </div>

              <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats?.totalCourses || 0}
                </div>
                <div className="text-sm text-gray-400">Total Courses</div>
              </div>
            </div>

            {/* User Distribution */}
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                User Distribution
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Students</span>
                    <span className="text-white font-semibold">{stats?.studentCount || 0}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-lime-400 to-emerald-500"
                      style={{ 
                        width: `${stats?.totalUsers > 0 ? (stats?.studentCount / stats?.totalUsers * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Instructors</span>
                    <span className="text-white font-semibold">{stats?.instructorCount || 0}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-lime-500"
                      style={{ 
                        width: `${stats?.totalUsers > 0 ? (stats?.instructorCount / stats?.totalUsers * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Administrators</span>
                    <span className="text-white font-semibold">{stats?.adminCount || 0}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      style={{ 
                        width: `${stats?.totalUsers > 0 ? (stats?.adminCount / stats?.totalUsers * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-gray-700"
                  disabled={!hasPermission('manageUsers')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>

                <Button
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-gray-700"
                  disabled={!hasPermission('createProgram')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Create Program
                </Button>

                <Button
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-gray-700"
                  disabled={!hasPermission('viewReports')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Reports
                </Button>

                <Button
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-gray-700"
                  disabled={!hasPermission('systemSettings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}