// lib/context/EnrollmentContext.tsx
'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { enrollmentService } from '@/services/enrollmentService'
import { useAuth } from './AuthContext'

interface EnrollmentStats {
  total: number
  active: number
  completed: number
  pending: number
  suspended: number
  dropped: number
  completionRate: number
}

interface Enrollment {
  _id: string
  studentId: any
  program: any
  status: string
  cohort?: string
  notes?: string
  coursesProgress: any[]
  enrollmentDate: string
  completionDate?: string
  createdAt: string
  updatedAt: string
}

interface EnrollmentContextType {
  // State
  enrollments: Enrollment[]
  myEnrollments: Enrollment[]
  enrollmentStats: Record<string, EnrollmentStats>
  loading: boolean
  error: string | null

  // Actions
  fetchEnrollments: (params?: any) => Promise<void>
  fetchMyEnrollments: () => Promise<void>
  fetchEnrollmentStats: (programId?: string, courseId?: string) => Promise<void>
  enrollStudent: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>
  bulkEnrollStudents: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>
  bulkEnrollByEmail: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>
  updateEnrollmentStatus: (enrollmentId: string, data: any) => Promise<{ success: boolean; data?: any; error?: string }>
  deleteEnrollment: (enrollmentId: string) => Promise<{ success: boolean; error?: string }>
  selfEnroll: (programId: string, data?: any) => Promise<{ success: boolean; data?: any; error?: string }>
  
  // Utilities
  refreshEnrollments: () => Promise<void>
  clearError: () => void
  getStatsForProgram: (programId: string) => EnrollmentStats | null
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined)

export function EnrollmentProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([])
  const [enrollmentStats, setEnrollmentStats] = useState<Record<string, EnrollmentStats>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all enrollments (Admin/Instructor)
  const fetchEnrollments = useCallback(async (params?: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await enrollmentService.getAllEnrollments(params)
      
      if (response.success) {
        setEnrollments(response.data || [])
      } else {
        setError(response.error || 'Failed to fetch enrollments')
      }
    } catch (err: any) {
      console.error('Error fetching enrollments:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch my enrollments (Student)
  const fetchMyEnrollments = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'student') return

    try {
      setLoading(true)
      setError(null)
      
      const response = await enrollmentService.getMyEnrollments()
      
      if (response.success) {
        setMyEnrollments(response.data || [])
      } else {
        setError(response.error || 'Failed to fetch your enrollments')
      }
    } catch (err: any) {
      console.error('Error fetching my enrollments:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Fetch enrollment stats for a program/course
  const fetchEnrollmentStats = useCallback(async (programId?: string, courseId?: string) => {
    try {
      const response = await enrollmentService.getEnrollmentStats(programId, courseId)
      
      if (response.success && response.data) {
        const key = programId || courseId || 'global'
        setEnrollmentStats(prev => ({
          ...prev,
          [key]: response.data
        }))
      }
    } catch (err: any) {
      console.error('Error fetching enrollment stats:', err)
    }
  }, [])

  // Enroll a student (Admin/Instructor)
  const enrollStudent = useCallback(async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await enrollmentService.enrollStudent(data)
      
      if (response.success) {
        // Refresh enrollments and stats
        await fetchEnrollments()
        if (data.programId) {
          await fetchEnrollmentStats(data.programId)
        }
      } else {
        setError(response.error || 'Failed to enroll student')
      }
      
      return response
    } catch (err: any) {
      console.error('Error enrolling student:', err)
      setError(err.message || 'An error occurred')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [fetchEnrollments, fetchEnrollmentStats])

  // Bulk enroll students
  const bulkEnrollStudents = useCallback(async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await enrollmentService.bulkEnrollStudents(data)
      
      if (response.success) {
        // Refresh enrollments and stats
        await fetchEnrollments()
        if (data.programId) {
          await fetchEnrollmentStats(data.programId)
        }
      } else {
        setError(response.error || 'Failed to bulk enroll students')
      }
      
      return response
    } catch (err: any) {
      console.error('Error bulk enrolling students:', err)
      setError(err.message || 'An error occurred')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [fetchEnrollments, fetchEnrollmentStats])

  // Bulk enroll by email
  const bulkEnrollByEmail = useCallback(async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await enrollmentService.bulkEnrollByEmail(data)
      
      if (response.success) {
        // Refresh enrollments and stats
        await fetchEnrollments()
        if (data.programId) {
          await fetchEnrollmentStats(data.programId)
        }
      } else {
        setError(response.error || 'Failed to bulk enroll by email')
      }
      
      return response
    } catch (err: any) {
      console.error('Error bulk enrolling by email:', err)
      setError(err.message || 'An error occurred')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [fetchEnrollments, fetchEnrollmentStats])

  // Update enrollment status
  const updateEnrollmentStatus = useCallback(async (enrollmentId: string, data: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await enrollmentService.updateEnrollmentStatus(enrollmentId, data)
      
      if (response.success) {
        // Update local state
        setEnrollments(prev => 
          prev.map(e => e._id === enrollmentId ? { ...e, ...data } : e)
        )
        setMyEnrollments(prev => 
          prev.map(e => e._id === enrollmentId ? { ...e, ...data } : e)
        )
      } else {
        setError(response.error || 'Failed to update enrollment')
      }
      
      return response
    } catch (err: any) {
      console.error('Error updating enrollment:', err)
      setError(err.message || 'An error occurred')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete enrollment
  const deleteEnrollment = useCallback(async (enrollmentId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await enrollmentService.deleteEnrollment(enrollmentId)
      
      if (response.success) {
        // Remove from local state
        setEnrollments(prev => prev.filter(e => e._id !== enrollmentId))
        setMyEnrollments(prev => prev.filter(e => e._id !== enrollmentId))
        
        // Refresh stats (we don't know which program, so refresh all loaded stats)
        for (const key of Object.keys(enrollmentStats)) {
          if (key !== 'global') {
            await fetchEnrollmentStats(key)
          }
        }
      } else {
        setError(response.error || 'Failed to delete enrollment')
      }
      
      return response
    } catch (err: any) {
      console.error('Error deleting enrollment:', err)
      setError(err.message || 'An error occurred')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [enrollmentStats, fetchEnrollmentStats])

  // Self-enroll (Student)
  const selfEnroll = useCallback(async (programId: string, data?: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await enrollmentService.selfEnroll(programId, data)
      
      if (response.success) {
        // Refresh my enrollments
        await fetchMyEnrollments()
      } else {
        setError(response.error || 'Failed to enroll')
      }
      
      return response
    } catch (err: any) {
      console.error('Error self-enrolling:', err)
      setError(err.message || 'An error occurred')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [fetchMyEnrollments])

  // Refresh enrollments based on user role
  const refreshEnrollments = useCallback(async () => {
    if (user?.role === 'student') {
      await fetchMyEnrollments()
    } else if (user?.role === 'admin' || user?.role === 'instructor') {
      await fetchEnrollments()
    }
  }, [user, fetchEnrollments, fetchMyEnrollments])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Get stats for a specific program
  const getStatsForProgram = useCallback((programId: string): EnrollmentStats | null => {
    return enrollmentStats[programId] || null
  }, [enrollmentStats])

  // Auto-fetch enrollments on mount based on user role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') {
        fetchMyEnrollments()
      } else if (user.role === 'admin' || user.role === 'instructor') {
        fetchEnrollments()
      }
    }
  }, [isAuthenticated, user, fetchEnrollments, fetchMyEnrollments])

  const value: EnrollmentContextType = {
    enrollments,
    myEnrollments,
    enrollmentStats,
    loading,
    error,
    fetchEnrollments,
    fetchMyEnrollments,
    fetchEnrollmentStats,
    enrollStudent,
    bulkEnrollStudents,
    bulkEnrollByEmail,
    updateEnrollmentStatus,
    deleteEnrollment,
    selfEnroll,
    refreshEnrollments,
    clearError,
    getStatsForProgram,
  }

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  )
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext)
  if (context === undefined) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider')
  }
  return context
}