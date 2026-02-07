'use client'

import React, { useState, useEffect } from 'react'
import { scholarshipService } from '@/services/scholarshipService'
import { programService } from '@/services/programService'
import { X, Award, Mail, Calendar, DollarSign, Percent } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Program } from '@/types'



interface CreateScholarshipModalProps {
  onClose: () => void
  onSuccess: () => void
}

const CreateScholarshipModal: React.FC<CreateScholarshipModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    programId: '',
    studentEmail: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    expiresAt: '',
    notes: '',
    sendEmail: true,
  })

  useEffect(() => {
    // Fetch programs - you'll need to implement this in your programService

    // For now, we'll use a placeholder
    fetchPrograms()
  }, [])

const fetchPrograms = async () => {
  try {
    const result = await programService.getPrograms({
      limit: 100,
      isPublished: true, // optional but nice for scholarships
    })

    if (result.success && result.data) {
      setPrograms(result.data)
    } else {
      toast.error(result.error || 'Failed to load programs')
    }
  } catch (err) {
    toast.error('Unexpected error loading programs')
  }
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.programId || !formData.discountValue) {
      toast.error('Please fill in all required fields')
      return
    }

    const discountValue = parseFloat(formData.discountValue)
    if (isNaN(discountValue) || discountValue <= 0) {
      toast.error('Please enter a valid discount value')
      return
    }

    if (formData.discountType === 'percentage' && discountValue > 100) {
      toast.error('Percentage discount cannot exceed 100%')
      return
    }

    setLoading(true)

    const result = await scholarshipService.createScholarship({
      programId: formData.programId,
      studentEmail: formData.studentEmail || undefined,
      discountType: formData.discountType,
      discountValue,
      expiresAt: formData.expiresAt || undefined,
      notes: formData.notes || undefined,
      sendEmail: formData.sendEmail && !!formData.studentEmail,
    })

    setLoading(false)

    if (result.success) {
      toast.success('Scholarship created successfully!')
      onSuccess()
      onClose()
    } else {
      toast.error(result.error || 'Failed to create scholarship')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-lime-500 to-emerald-500 flex items-center justify-center">
              <Award className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Scholarship</h2>
              <p className="text-sm text-gray-400">Generate a new scholarship code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Program Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Program <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.programId}
              onChange={(e) =>
                setFormData({ ...formData, programId: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white focus:border-lime-500 focus:outline-none transition-colors"
              required
            >
              <option value="">Select a program</option>
              {programs.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.title} - (N){program.price}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Choose which program this scholarship applies to
            </p>
          </div>

          {/* Student Email (Optional) */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Student Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={formData.studentEmail}
              onChange={(e) =>
                setFormData({ ...formData, studentEmail: e.target.value })
              }
              placeholder="student@example.com"
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:outline-none transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for general-use scholarship or specify a student's email
            </p>
          </div>

          {/* Discount Type & Value */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Discount Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, discountType: 'percentage' })
                  }
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    formData.discountType === 'percentage'
                      ? 'bg-lime-500 text-slate-900'
                      : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, discountType: 'fixed' })
                  }
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    formData.discountType === 'fixed'
                      ? 'bg-lime-500 text-slate-900'
                      : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Fixed
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Discount Value <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  placeholder={
                    formData.discountType === 'percentage' ? '0-100' : '0.00'
                  }
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:outline-none transition-colors"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {formData.discountType === 'percentage' ? '%' : '$'}
                </div>
              </div>
            </div>
          </div>

          {/* Expiration Date (Optional) */}
          <div>
            <label className=" text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) =>
                setFormData({ ...formData, expiresAt: e.target.value })
              }
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white focus:border-lime-500 focus:outline-none transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for no expiration
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any additional notes or instructions..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Send Email Toggle */}
          {formData.studentEmail && (
            <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-gray-700">
              <input
                type="checkbox"
                id="sendEmail"
                checked={formData.sendEmail}
                onChange={(e) =>
                  setFormData({ ...formData, sendEmail: e.target.checked })
                }
                className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-lime-500 focus:ring-lime-500"
              />
              <label htmlFor="sendEmail" className="text-sm text-gray-300">
                Send email notification to student with scholarship code
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-linear-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-slate-900 rounded-lg font-semibold transition-all shadow-lg shadow-lime-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Scholarship'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateScholarshipModal