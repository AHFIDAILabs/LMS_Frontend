'use client'

import React, { useState, useEffect } from 'react'
import { scholarshipService } from '@/services/scholarshipService'
import { X, Award, Layers, Calendar, DollarSign, Percent, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Program {
  _id: string
  title: string
  price: number
}

interface BulkCreateModalProps {
  onClose: () => void
  onSuccess: () => void
}

const BulkCreateModal: React.FC<BulkCreateModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(false)
  const [createdCodes, setCreatedCodes] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState({
    programId: '',
    quantity: '10',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    expiresAt: '',
    notes: '',
  })

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    // Implement fetching programs from your API
    // const result = await programService.getAllPrograms()
    // if (result.success) setPrograms(result.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.programId || !formData.discountValue || !formData.quantity) {
      toast.error('Please fill in all required fields')
      return
    }

    const quantity = parseInt(formData.quantity)
    const discountValue = parseFloat(formData.discountValue)

    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
      toast.error('Quantity must be between 1 and 100')
      return
    }

    if (isNaN(discountValue) || discountValue <= 0) {
      toast.error('Please enter a valid discount value')
      return
    }

    if (formData.discountType === 'percentage' && discountValue > 100) {
      toast.error('Percentage discount cannot exceed 100%')
      return
    }

    setLoading(true)

    const result = await scholarshipService.bulkCreateScholarships({
      programId: formData.programId,
      quantity,
      discountType: formData.discountType,
      discountValue,
      expiresAt: formData.expiresAt || undefined,
      notes: formData.notes || undefined,
    })

    setLoading(false)

    if (result.success) {
      setCreatedCodes(result.data || [])
      setShowResults(true)
      toast.success(`${quantity} scholarships created successfully!`)
      onSuccess()
    } else {
      toast.error(result.error || 'Failed to create scholarships')
    }
  }

  const downloadCodes = () => {
    const csvContent = [
      ['Code', 'Program', 'Discount', 'Expires', 'Status'],
      ...createdCodes.map((s) => [
        s.code,
        s.programId?.title || 'N/A',
        s.discountType === 'percentage'
          ? `${s.discountValue}%`
          : `$${s.discountValue}`,
        s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : 'No expiration',
        s.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scholarship-codes-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-slate-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-lime-500 flex items-center justify-center">
                <Award className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Scholarships Created Successfully
                </h2>
                <p className="text-sm text-gray-400">
                  {createdCodes.length} scholarship codes generated
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Success Message */}
          <div className="p-6">
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-emerald-400 font-semibold mb-2">
                ✓ Bulk creation successful!
              </p>
              <p className="text-sm text-gray-400">
                All scholarship codes have been generated and are ready to use.
                Download the CSV file to share these codes.
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadCodes}
              className="w-full mb-6 px-4 py-3 bg-linear-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-slate-900 rounded-lg font-semibold transition-all shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download All Codes (CSV)
            </button>

            {/* Codes List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {createdCodes.map((scholarship, index) => (
                <div
                  key={scholarship._id}
                  className="p-4 bg-slate-800/50 border border-gray-700 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-gray-400">
                      {index + 1}
                    </span>
                    <code className="px-3 py-1.5 bg-slate-900 text-lime-400 rounded-lg font-mono text-sm font-semibold">
                      {scholarship.code}
                    </code>
                  </div>
                  <span className="text-sm text-gray-500">
                    {scholarship.discountType === 'percentage'
                      ? `${scholarship.discountValue}% off`
                      : `$${scholarship.discountValue} off`}
                  </span>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-6 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Bulk Create Scholarships
              </h2>
              <p className="text-sm text-gray-400">
                Generate multiple scholarship codes at once
              </p>
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
          {/* Info Banner */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-sm text-purple-300">
              Create multiple scholarship codes with the same discount settings.
              Maximum 100 codes per batch.
            </p>
          </div>

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
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
              required
            >
              <option value="">Select a program</option>
              {programs.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.title} - ${program.price}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              min="1"
              max="100"
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Number of scholarship codes to generate (1-100)
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
                      ? 'bg-purple-500 text-white'
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
                      ? 'bg-purple-500 text-white'
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
                  className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
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
            <label className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
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
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500">
              All codes will share the same expiration date
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
              placeholder="e.g., 'Fall 2024 Batch' or 'Partner Organization Codes'"
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
            />
          </div>

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
              className="flex-1 px-4 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                `Create ${formData.quantity || 0} Scholarships`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BulkCreateModal