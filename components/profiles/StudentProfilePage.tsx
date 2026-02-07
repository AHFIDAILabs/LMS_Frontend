'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import {
  User, Mail, Phone, Calendar, Github, Linkedin, Globe,
  BookOpen, Award, TrendingUp, Clock, Edit2, Save, X,
  Upload, Camera, MapPin, Briefcase, AlertCircle, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { studentService } from '@/services/studentService'
import { authService } from '@/services/authService'

interface StudentProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  profileImage?: string
  role: string
  status: string
  studentProfile?: {
    cohort?: string
    enrollmentDate?: Date
    githubProfile?: string
    linkedinProfile?: string
    portfolioUrl?: string
  }
  programId?: any[]
  courseIds?: any[]
  createdAt: Date
}

export const StudentProfilePage = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()


  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    cohort: '',
    githubProfile: '',
    linkedinProfile: '',
    portfolioUrl: ''
  })

  // Fetch profile data
  useEffect(() => {
    fetchProfile()
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
          cohort: response.data.studentProfile?.cohort || '',
          githubProfile: response.data.studentProfile?.githubProfile || '',
          linkedinProfile: response.data.studentProfile?.linkedinProfile || '',
          portfolioUrl: response.data.studentProfile?.portfolioUrl || ''
        })
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
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

    // Validate URLs if provided
    if (formData.githubProfile && !validateUrl(formData.githubProfile)) {
      setError('GitHub profile must be a valid URL')
      return
    }
    if (formData.linkedinProfile && !validateUrl(formData.linkedinProfile)) {
      setError('LinkedIn profile must be a valid URL')
      return
    }
    if (formData.portfolioUrl && !validateUrl(formData.portfolioUrl)) {
      setError('Portfolio URL must be a valid URL')
      return
    }

    setSaving(true)
    
    try {
      const updateData = new FormData()
      
      // Only append fields that have values
      if (formData.firstName) updateData.append('firstName', formData.firstName)
      if (formData.lastName) updateData.append('lastName', formData.lastName)
      if (formData.phoneNumber) updateData.append('phoneNumber', formData.phoneNumber)
      if (formData.cohort) updateData.append('cohort', formData.cohort)
      if (formData.githubProfile) updateData.append('githubProfile', formData.githubProfile)
      if (formData.linkedinProfile) updateData.append('linkedinProfile', formData.linkedinProfile)
      if (formData.portfolioUrl) updateData.append('portfolioUrl', formData.portfolioUrl)
      
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
        cohort: profile.studentProfile?.cohort || '',
        githubProfile: profile.studentProfile?.githubProfile || '',
        linkedinProfile: profile.studentProfile?.linkedinProfile || '',
        portfolioUrl: profile.studentProfile?.portfolioUrl || ''
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
            
            {/* Profile Image & Basic Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-lime-400/20 bg-slate-800">
                  {(imagePreview || profile.profileImage) ? (
                    <img
                      src={imagePreview || profile.profileImage}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lime-400 to-emerald-500">
                      <span className="text-4xl font-bold text-slate-900">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-lime-500 transition">
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
                  <span className="px-3 py-1 bg-lime-400/10 text-lime-400 rounded-full text-sm font-semibold">
                    Student
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    profile.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-gray-400/10 text-gray-400'
                  }`}>
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>

{/* Back to Dashboard */}
<div className="w-full flex justify-end md:justify-start">
  <Button
    variant="ghost"
    onClick={() => router.push('/dashboard/students')}
    className="border border-gray-700 hover:bg-slate-800"
  >
    <ArrowLeft className="w-4 h-4 mr-2" />
    Back to Dashboard
  </Button>
</div>


            {/* Edit Button */}
            <div className="flex gap-3">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-linear-to-r from-lime-400 to-emerald-500 text-slate-900 hover:opacity-90"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-linear-to-r from-lime-400 to-emerald-500 text-slate-900 hover:opacity-90 disabled:opacity-50"
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
          
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Contact Information */}
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-lime-400" />
                Contact Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-lime-400"
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
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-lime-400"
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
                  <label className="text-sm text-gray-400 mb-1 block">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-lime-400"
                      placeholder="+1234567890"
                    />
                  ) : (
                    <p className="text-white">{profile.phoneNumber || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Cohort</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.cohort}
                      onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-lime-400"
                      placeholder="e.g., 2024-Spring"
                    />
                  ) : (
                    <p className="text-white">{profile.studentProfile?.cohort || 'Not assigned'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Enrollment Date</label>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-4 h-4 text-lime-400" />
                    {profile.studentProfile?.enrollmentDate 
                      ? new Date(profile.studentProfile.enrollmentDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-lime-400" />
                Social Links
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub Profile
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.githubProfile}
                      onChange={(e) => setFormData({ ...formData, githubProfile: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-lime-400"
                      placeholder="https://github.com/username"
                    />
                  ) : (
                    profile.studentProfile?.githubProfile ? (
                      <a 
                        href={profile.studentProfile.githubProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lime-400 hover:underline break-all"
                      >
                        {profile.studentProfile.githubProfile}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn Profile
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.linkedinProfile}
                      onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-lime-400"
                      placeholder="https://linkedin.com/in/username"
                    />
                  ) : (
                    profile.studentProfile?.linkedinProfile ? (
                      <a 
                        href={profile.studentProfile.linkedinProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lime-400 hover:underline break-all"
                      >
                        {profile.studentProfile.linkedinProfile}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1  flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Portfolio URL
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-lime-400"
                      placeholder="https://portfolio.com"
                    />
                  ) : (
                    profile.studentProfile?.portfolioUrl ? (
                      <a 
                        href={profile.studentProfile.portfolioUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lime-400 hover:underline break-all"
                      >
                        {profile.studentProfile.portfolioUrl}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Programs & Courses */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Enrolled Programs */}
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-lime-400" />
                Enrolled Programs ({profile.programId?.length || 0})
              </h3>
              
              {profile.programId && profile.programId.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {profile.programId.map((program: any, index) => (
                    <div key={index} className="bg-slate-800/50 border border-gray-700/50 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">{program.title || 'Program'}</h4>
                      <p className="text-sm text-gray-400">{program.description || 'No description'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No programs enrolled yet.</p>
              )}
            </div>

            {/* Enrolled Courses */}
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-lime-400" />
                Enrolled Courses ({profile.courseIds?.length || 0})
              </h3>
              
              {profile.courseIds && profile.courseIds.length > 0 ? (
                <div className="space-y-4">
                  {profile.courseIds.map((course: any, index) => (
                    <div key={index} className="bg-slate-800/50 border border-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{course.title || 'Course'}</h4>
                        <p className="text-sm text-gray-400">{course.description || 'No description'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-lime-400 font-semibold mb-1">
                          {course.progress || 0}% Complete
                        </div>
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-linear-to-r from-lime-400 to-emerald-500"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No courses enrolled yet.</p>
              )}
            </div>

            {/* Stats Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-lime-400/10 border border-lime-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-lime-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {profile.courseIds?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Courses Enrolled</div>
              </div>

              <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {profile.programId?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Active Programs</div>
              </div>

              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-gray-400">Certificates Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}