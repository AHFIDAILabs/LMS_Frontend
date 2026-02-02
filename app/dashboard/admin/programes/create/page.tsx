'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { programService } from '@/services/programService'
import { courseService } from '@/services/courseService'
import {
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  BookOpen,
} from 'lucide-react'
import Link from 'next/link'

interface Course {
  _id: string
  title: string
  category: string
  level: string
}

export default function CreateProgramPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration: '',
    price: '',
    tags: [''],
    isPublished: false,
  })

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    fetchCourses()
  }, [authLoading, isAuthenticated, user])

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await courseService.getAllCoursesAdmin({ isPublished: true })
      
      if (response.success && Array.isArray(response.data)) {
        setCourses(response.data)
      }
    } catch (err: any) {
      console.error('Failed to fetch courses:', err)
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleTagChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }))
  }

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }))
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Program name is required')
      return false
    }
    
    if (!formData.description.trim()) {
      setError('Program description is required')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      setError(null)
      
      const filteredTags = formData.tags.filter(t => t.trim())
      
      const programData = {
        title: filteredTags.map(t => t.trim()).join(" "),
        name: formData.name,
        description: formData.description,
        category: formData.category || undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        tags: filteredTags.length > 0 ? filteredTags : undefined,
        isPublished: formData.isPublished,
        courses: selectedCourses.length > 0 ? selectedCourses : undefined,
      }
      
      const response = await programService.createProgram(programData)
      
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/admin/programs')
        }, 1500)
      } else {
        setError(response.error || 'Failed to create program')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the program')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loadingCourses) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Back Button */}
        <Link
          href="/dashboard/admin/programs"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Programs
        </Link>

        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Program</h1>
          <p className="text-gray-400 mb-8">Fill in the details to create a new program</p>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4">
              <p className="text-green-400 flex items-center gap-2">
                <AlertCircle size={20} />
                Program created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <p className="text-red-400 flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="text-red-300 text-sm underline mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Full Stack Web Development"
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the program..."
                    rows={4}
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition resize-none"
                    required
                  />
                </div>

                {/* Category, Duration, and Price */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g., Programming"
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (weeks)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 12"
                      min="0"
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 299"
                      min="0"
                      step="0.01"
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Tags</h2>
                <button
                  type="button"
                  onClick={addTag}
                  className="flex items-center gap-2 text-lime-400 hover:text-lime-300 text-sm transition-colors"
                >
                  <Plus size={16} />
                  Add Tag
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      placeholder="e.g., web-development, javascript"
                      className="flex-1 bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Course Selection */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Add Courses to Program
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Select courses to include in this program (optional)
              </p>
              
              {courses.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {courses.map(course => (
                    <label
                      key={course._id}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedCourses.includes(course._id)
                          ? 'bg-lime-500/10 border-lime-500/50'
                          : 'bg-slate-700/30 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course._id)}
                        onChange={() => toggleCourseSelection(course._id)}
                        className="mt-1 w-4 h-4 rounded border-gray-600 text-lime-500 focus:ring-lime-400"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{course.category}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400 capitalize">{course.level}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen size={48} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No published courses available</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Create and publish courses first to add them to programs
                  </p>
                </div>
              )}
              
              {selectedCourses.length > 0 && (
                <p className="text-lime-400 text-sm mt-4">
                  {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Publish Option */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray-600 text-lime-500 focus:ring-lime-400 focus:ring-offset-slate-800"
                />
                <div>
                  <p className="text-white font-medium">Publish immediately</p>
                  <p className="text-gray-400 text-sm">Make this program visible to students right away</p>
                </div>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Creating...' : 'Create Program'}
              </button>
              
              <Link
                href="/dashboard/admin/programs"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}