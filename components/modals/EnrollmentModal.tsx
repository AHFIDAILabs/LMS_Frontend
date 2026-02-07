'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Gift, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { enrollmentService } from '@/services/enrollmentService'
import { useRouter } from 'next/navigation'

interface EnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  program: {
    _id: string
    title: string
    price: number
    currency: string
  }
}

type EnrollmentType = 'payment' | 'scholarship'

export function EnrollmentModal({ isOpen, onClose, program }: EnrollmentModalProps) {
  const router = useRouter()
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>('payment')
  const [scholarshipCode, setScholarshipCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [scholarshipValidation, setScholarshipValidation] = useState<{
    isValid: boolean
    discountAmount: number
    finalPrice: number
    originalPrice: number
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateScholarship = async () => {
    if (!scholarshipCode.trim()) {
      setError('Please enter a scholarship code')
      return
    }

    setIsValidating(true)
    setError(null)
    setScholarshipValidation(null)

    const response = await enrollmentService.validateScholarship({
      code: scholarshipCode.trim(),
      programId: program._id
    })

    setIsValidating(false)

    if (response.success && response.data) {
      setScholarshipValidation({
        isValid: true,
        discountAmount: response.data.discountAmount,
        finalPrice: response.data.finalPrice,
        originalPrice: response.data.originalPrice
      })
      setError(null)
    } else {
      setError(response.error || 'Invalid scholarship code')
      setScholarshipValidation(null)
    }
  }

  const handleEnroll = async () => {
    setError(null)
    setIsLoading(true)

    try {
      if (enrollmentType === 'scholarship') {
        if (!scholarshipCode.trim()) {
          setError('Please enter a scholarship code')
          setIsLoading(false)
          return
        }

        // Enroll with scholarship code
        const response = await enrollmentService.selfEnroll(program._id, {
          scholarshipCode: scholarshipCode.trim()
        })
        
        if (!response.success) {
          setError(response.error || 'Failed to enroll. Please try again.')
          setIsLoading(false)
          return
        }
      } else {
        // Regular payment enrollment
        if (program.price === 0) {
          // Free program - direct enrollment
          const response = await enrollmentService.selfEnroll(program._id)
          
          if (!response.success) {
            setError(response.error || 'Failed to enroll. Please try again.')
            setIsLoading(false)
            return
          }
        } else {
          // Paid program - redirect to payment
          // TODO: Implement payment gateway integration
          setError('Payment integration coming soon!')
          setIsLoading(false)
          return
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/students/myProgram/${program._id}/learn`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setEnrollmentType('payment')
    setScholarshipCode('')
    setScholarshipValidation(null)
    setError(null)
    setSuccess(false)
    setIsLoading(false)
    setIsValidating(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1F3540] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#1F3540] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Enroll in Program</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-green-500 font-semibold">Enrollment Successful!</p>
                      <p className="text-gray-300 text-sm">Redirecting to your course...</p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-500 text-sm">{error}</p>
                  </motion.div>
                )}

                {!success && (
                  <>
                    {/* Program Info */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-2">{program.title}</h3>
                      <p className="text-2xl font-bold text-[#FF6B35]">
                        {program.price === 0 
                          ? 'Free' 
                          : `${program.currency === 'NGN' ? '₦' : '$'}${program.price.toLocaleString()}`
                        }
                      </p>
                    </div>

                    {/* Enrollment Type Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        Choose Enrollment Option
                      </label>
                      
                      {/* Payment Option */}
                      <button
                        onClick={() => setEnrollmentType('payment')}
                        disabled={isLoading}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-4 ${
                          enrollmentType === 'payment'
                            ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          enrollmentType === 'payment' 
                            ? 'border-[#FF6B35]' 
                            : 'border-gray-400'
                        }`}>
                          {enrollmentType === 'payment' && (
                            <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
                          )}
                        </div>
                        <CreditCard className={`w-6 h-6 ${
                          enrollmentType === 'payment' ? 'text-[#FF6B35]' : 'text-gray-400'
                        }`} />
                        <div className="flex-1 text-left">
                          <p className={`font-semibold ${
                            enrollmentType === 'payment' ? 'text-white' : 'text-gray-300'
                          }`}>
                            {program.price === 0 ? 'Free Enrollment' : 'Pay Now'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {program.price === 0 
                              ? 'No payment required' 
                              : 'Complete payment to access program'
                            }
                          </p>
                        </div>
                      </button>

                      {/* Scholarship Option */}
                      <button
                        onClick={() => setEnrollmentType('scholarship')}
                        disabled={isLoading}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-4 ${
                          enrollmentType === 'scholarship'
                            ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          enrollmentType === 'scholarship' 
                            ? 'border-[#FF6B35]' 
                            : 'border-gray-400'
                        }`}>
                          {enrollmentType === 'scholarship' && (
                            <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
                          )}
                        </div>
                        <Gift className={`w-6 h-6 ${
                          enrollmentType === 'scholarship' ? 'text-[#FF6B35]' : 'text-gray-400'
                        }`} />
                        <div className="flex-1 text-left">
                          <p className={`font-semibold ${
                            enrollmentType === 'scholarship' ? 'text-white' : 'text-gray-300'
                          }`}>
                            Use Scholarship Code
                          </p>
                          <p className="text-sm text-gray-400">
                            Have a scholarship code? Apply it here
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Scholarship Code Input */}
                    {enrollmentType === 'scholarship' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <label className="block text-sm font-medium text-gray-300">
                          Scholarship Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={scholarshipCode}
                            onChange={(e) => {
                              setScholarshipCode(e.target.value.toUpperCase())
                              setScholarshipValidation(null)
                            }}
                            placeholder="Enter your scholarship code"
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            disabled={isLoading || isValidating}
                          />
                          <button
                            onClick={validateScholarship}
                            disabled={!scholarshipCode.trim() || isValidating || isLoading}
                            className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isValidating ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              'Validate'
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">
                          Enter the unique code provided in your scholarship email
                        </p>

                        {/* Validation Success */}
                        {scholarshipValidation?.isValid && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                              <p className="text-green-500 font-semibold">Scholarship Code Valid!</p>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-300">
                                Original Price: <span className="line-through">
                                  {program.currency === 'NGN' ? '₦' : '$'}{scholarshipValidation.originalPrice.toLocaleString()}
                                </span>
                              </p>
                              <p className="text-green-400 font-semibold">
                                Discount: -{program.currency === 'NGN' ? '₦' : '$'}{scholarshipValidation.discountAmount.toLocaleString()}
                              </p>
                              <p className="text-xl text-white font-bold">
                                Final Price: {scholarshipValidation.finalPrice === 0 
                                  ? 'FREE' 
                                  : `${program.currency === 'NGN' ? '₦' : '$'}${scholarshipValidation.finalPrice.toLocaleString()}`
                                }
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* Info Box */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-blue-400 text-sm">
                        {enrollmentType === 'payment' 
                          ? program.price === 0
                            ? 'You will get instant access to all course materials after enrollment.'
                            : 'You will be redirected to complete payment. After successful payment, you will get instant access to all course materials.'
                          : 'If your scholarship code is valid, you will get 100% free access to this program.'
                        }
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {!success && (
                <div className="sticky bottom-0 bg-[#1F3540] border-t border-white/10 px-6 py-4 flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEnroll}
                    disabled={isLoading || (enrollmentType === 'scholarship' && !scholarshipCode.trim())}
                    className="flex-1 px-6 py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : enrollmentType === 'scholarship' ? (
                      'Apply & Enroll'
                    ) : program.price === 0 ? (
                      'Enroll Now'
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}