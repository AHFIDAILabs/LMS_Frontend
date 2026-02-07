'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import {
  User, Mail, Phone, Linkedin, BookOpen, Users, Award,
  Edit2, Save, X, Camera, TrendingUp, Clock, FileText, AlertCircle, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { instructorService } from '@/services/instructorService'
import { GetAllUsersResponse } from '@/types'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'


interface InstructorProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  profileImage?: string
  role: string
  status: string
  instructorProfile?: {
    bio?: string
    coursesTaught?: string
    linkedinProfile?: string
  }
  createdAt: Date
}

export const InstructorProfilePage = () => {
  const [profile, setProfile] = useState<InstructorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()


  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bio: '',
    linkedinProfile: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchCourses()
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
          phoneNumber: response.data.phoneNumber || '',
          linkedinProfile: response.data.instructorProfile?.linkedinProfile || '',
          bio: response.data.instructorProfile?.bio || ''
        })
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await instructorService.getCourses({ limit: 10 })
      if (response.success && response.data) {
        setCourses(response.data)
      }
    } catch (err) {
      console.error('Failed to load courses:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await instructorService.getDashboardStats()
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

  const validateUrl = (url: string): boolean => {
    if (!url) return true // Empty is valid (optional field)
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSave = async () => {
    // Clear previous messages
    setError(null)
    setSuccess(null)

    // Validate LinkedIn URL if provided
    if (formData.linkedinProfile && !validateUrl(formData.linkedinProfile)) {
      setError('LinkedIn profile must be a valid URL')
      return
    }

    setSaving(true)
    
    try {
      const updateData = new FormData()
      
      // Only append fields that have values
      if (formData.firstName) updateData.append('firstName', formData.firstName)
      if (formData.lastName) updateData.append('lastName', formData.lastName)
      if (formData.phoneNumber) updateData.append('phoneNumber', formData.phoneNumber)
      if (formData.bio) updateData.append('bio', formData.bio)
      if (formData.linkedinProfile) updateData.append('linkedinProfile', formData.linkedinProfile)
      
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
        phoneNumber: profile.phoneNumber || '',
        bio: profile.instructorProfile?.bio || '',
        linkedinProfile: profile.instructorProfile?.linkedinProfile || ''
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

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Success/Error Messages */}
        {(error || success) && (
          <div className="mb-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-emerald-400">{success}</p>
              </div>
            )}
          </div>
        )}

        {/* Header Section */}
        <div className="flex w-full justify-between bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl border border-gray-800/50 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-center w-full gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-400/20 bg-slate-800">
                  {(imagePreview || profile.profileImage) ? (
                    <img
                      src={imagePreview || profile.profileImage}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-emerald-400 to-lime-500">
                      <span className="text-4xl font-bold text-slate-900">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-500 transition">
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
                  <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-sm font-semibold">
                    Instructor
                  </span>
                  <span className="px-3 py-1 bg-lime-400/10 text-lime-400 rounded-full text-sm font-semibold">
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>

{/* Back to Dashboard */}
<div className="w-full flex justify-end md:justify-start">
  <Button
    variant="ghost"
    onClick={() => router.push('/dashboard/instructor')}
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
                  className="bg-linear-to-r from-emerald-400 to-lime-500 text-slate-900 hover:opacity-90"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-linear-to-r from-emerald-400 to-lime-500 text-slate-900 hover:opacity-90 disabled:opacity-50"
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
                <User className="w-5 h-5 text-emerald-400" />
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
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
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
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
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
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                      placeholder="+1234567890"
                    />
                  ) : (
                    <p className="text-white">{profile.phoneNumber || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.linkedinProfile}
                      onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                      placeholder="https://linkedin.com/in/username"
                    />
                  ) : (
                    profile.instructorProfile?.linkedinProfile ? (
                      <a 
                        href={profile.instructorProfile.linkedinProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline break-all"
                      >
                        {profile.instructorProfile.linkedinProfile}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Bio
              </h3>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 resize-none"
                  placeholder="Tell us about yourself, your expertise, and teaching philosophy..."
                />
              ) : (
                <p className="text-gray-300 leading-relaxed">
                  {profile.instructorProfile?.bio || 'No bio added yet.'}
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats?.totalCourses || courses.length}
                </div>
                <div className="text-sm text-gray-400">Courses Teaching</div>
              </div>

              <div className="bg-lime-400/10 border border-lime-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-lime-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats?.totalStudents || 0}
                </div>
                <div className="text-sm text-gray-400">Total Students</div>
              </div>

              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats?.averageRating || '4.8'}
                </div>
                <div className="text-sm text-gray-400">Average Rating</div>
              </div>
            </div>

            {/* Courses */}
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                My Courses ({courses.length})
              </h3>
              
              {courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div 
                      key={course._id} 
                      className="bg-slate-800/50 border border-gray-700/50 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white mb-1">{course.title}</h4>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          course.isPublished 
                            ? 'bg-emerald-400/10 text-emerald-400' 
                            : 'bg-gray-400/10 text-gray-400'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.enrolledStudents || 0} students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No courses yet. Create your first course to get started!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}