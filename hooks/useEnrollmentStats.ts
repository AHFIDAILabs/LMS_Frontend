// hooks/useEnrollmentStats.ts
'use client'

import { useEffect, useRef } from 'react'
import { useEnrollment } from '@/lib/context/EnrollmentContext'

export function useEnrollmentStats(programId?: string, courseId?: string) {
  const { 
    enrollmentStats, 
    fetchEnrollmentStats, 
    loading, 
    error,
    getStatsForProgram 
  } = useEnrollment()

  // ✅ Use ref to track if we've already fetched for these IDs
  const fetchedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // ✅ Only fetch if we have an ID and haven't fetched it yet
    if (programId || courseId) {
      const key = programId || courseId || 'global'
      
      if (!fetchedRef.current.has(key)) {
        fetchedRef.current.add(key)
        fetchEnrollmentStats(programId, courseId)
      }
    }
    // ✅ Remove fetchEnrollmentStats from deps to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId, courseId]) // Only re-run when IDs change

  const stats = programId 
    ? getStatsForProgram(programId) 
    : courseId 
    ? enrollmentStats[courseId] 
    : enrollmentStats['global'] // ✅ Fallback to global stats

  return {
    stats,
    loading,
    error,
    refresh: () => fetchEnrollmentStats(programId, courseId)
  }
}