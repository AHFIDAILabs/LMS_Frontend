'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { enrollmentService } from '@/services/enrollmentService'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

interface EnrollButtonProps {
  programId: string
  programTitle: string
  isEnrolled?: boolean
  className?: string
}

export default function EnrollButton({
  programId,
  programTitle,
  isEnrolled = false,
  className = '',
}: EnrollButtonProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(isEnrolled)
  const [error, setError] = useState<string | null>(null)

  const handleEnroll = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/programs/${programId}`)
      return
    }

    // Prevent duplicate enrollments
    if (enrolled) {
      router.push('/dashboard/students')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await enrollmentService.selfEnroll(programId)

      if (response.success) {
        setEnrolled(true)
        
        // Show success message
        alert(`Successfully enrolled in ${programTitle}! Redirecting to your dashboard...`)
        
        // Redirect to student dashboard
        setTimeout(() => {
          router.push('/dashboard/students')
        }, 1500)
      } else {
        setError(response.error || 'Failed to enroll in program')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during enrollment')
    } finally {
      setLoading(false)
    }
  }

  if (enrolled) {
    return (
      <button
        onClick={handleEnroll}
        className={`px-8 py-4 bg-green-500 text-white rounded-full font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-green-600 transition-all duration-300 ${className}`}
      >
        <CheckCircle className="w-5 h-5" />
        Enrolled - Go to Dashboard
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleEnroll}
        disabled={loading}
        className={`px-8 py-4 bg-[#FF6B35] text-white rounded-full font-semibold hover:bg-[#f85a28] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enrolling...
          </>
        ) : (
          <>
            {isAuthenticated ? 'Enroll Now' : 'Login to Enroll'}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
    </div>
  )
}