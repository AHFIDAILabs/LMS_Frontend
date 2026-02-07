'use client'

import { useState, useEffect, useRef } from 'react'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { enrollmentService } from '@/services/enrollmentService'
import { programService } from '@/services/programService'
import * as XLSX from 'xlsx'
import {
  Users,
  UserPlus,
  Upload,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  FileText,
  UserCheck,
  Mail,
  FileSpreadsheet,
  Download,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Student {
  _id: string
  firstName: string
  lastName: string
  email: string
  cohort?: string
  profileImage?: string
  isEnrolled?: boolean
}

interface Program {
  _id: string
  title: string
  description: string
}

type EnrollmentMode = 'existing' | 'email-list' | 'csv'

interface EmailEntry {
  email: string
  firstName?: string
  lastName?: string
  cohort?: string
}

export default function CreateEnrollmentPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<EnrollmentMode>('existing')
  const [programs, setPrograms] = useState<Program[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [emailList, setEmailList] = useState('')
  const [parsedEmails, setParsedEmails] = useState<EmailEntry[]>([])
  const [csvData, setCsvData] = useState<EmailEntry[]>([])
  const [cohort, setCohort] = useState('')
  const [notes, setNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingStudents, setFetchingStudents] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [enrollmentResults, setEnrollmentResults] = useState<any>(null)

  // Fetch programs
  useEffect(() => {
    const fetchPrograms = async () => {
      const response = await programService.getPrograms()
      if (response.success) {
        setPrograms(response.data || [])
      }
    }
    fetchPrograms()
  }, [])

  // Fetch existing students when in existing mode
  useEffect(() => {
    const fetchStudents = async () => {
      if (mode !== 'existing' || !selectedProgram) {
        setStudents([])
        return
      }

      setFetchingStudents(true)
      try {
        const response = await enrollmentService.getAvailableStudents({
          programId: selectedProgram,
          search: searchTerm,
          limit: 100
        })

        if (response.success) {
          setStudents(response.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch students:', err)
      } finally {
        setFetchingStudents(false)
      }
    }

    fetchStudents()
  }, [selectedProgram, searchTerm, mode])

  // Parse email list
  useEffect(() => {
    if (mode === 'email-list' && emailList.trim()) {
      const emails = emailList
        .split(/[\n,;]/)
        .map(e => e.trim())
        .filter(e => e && e.includes('@'))
        .map(email => ({ email }))

      setParsedEmails(emails)
    } else {
      setParsedEmails([])
    }
  }, [emailList, mode])

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectAllStudents = () => {
    const availableStudents = students.filter(s => !s.isEnrolled)
    setSelectedStudents(availableStudents.map(s => s._id))
  }

  const deselectAllStudents = () => {
    setSelectedStudents([])
  }


const parseExcel = ( ArrayBuffer: any) => {
  if (!ArrayBuffer) return

  try {
    const workbook = XLSX.read(ArrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert sheet to JSON
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
    })

    if (jsonData.length === 0) {
      setError('Excel file is empty')
      return
    }

    const data: EmailEntry[] = []

    jsonData.forEach(row => {
      const email =
        row.email ||
        row.Email ||
        row.EMAIL

      if (email && email.includes('@')) {
        data.push({
          email: String(email).trim(),
          firstName: row.firstName || row.FirstName || row.first_name,
          lastName: row.lastName || row.LastName || row.last_name,
          cohort: row.cohort || row.Cohort,
        })
      }
    })

    if (data.length === 0) {
      setError('No valid emails found in Excel')
      return
    }

    setCsvData(data)
    setSuccess(`Parsed ${data.length} valid emails from Excel`)
  } catch (err) {
    console.error(err)
    setError('Failed to parse Excel file')
  }
}


 const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  if (fileExtension === 'csv') {
    // Parse CSV
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      parseCSV(text)
    }
    reader.readAsText(file)
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    // Parse Excel
    const reader = new FileReader()
    reader.onload = (event) => {
      const data = event.target?.result
      parseExcel(data)
    }
    reader.readAsArrayBuffer(file)
  } else {
    setError('Please upload a CSV or Excel file')
  }
}

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())

    const emailIndex = headers.findIndex(h => h.includes('email'))
    const firstNameIndex = headers.findIndex(h => h.includes('first') && h.includes('name'))
    const lastNameIndex = headers.findIndex(h => h.includes('last') && h.includes('name'))
    const cohortIndex = headers.findIndex(h => h.includes('cohort'))

    if (emailIndex === -1) {
      setError('CSV must contain an "email" column')
      return
    }

    const data: EmailEntry[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const email = values[emailIndex]

      if (email && email.includes('@')) {
        data.push({
          email,
          firstName: firstNameIndex !== -1 ? values[firstNameIndex] : undefined,
          lastName: lastNameIndex !== -1 ? values[lastNameIndex] : undefined,
          cohort: cohortIndex !== -1 ? values[cohortIndex] : undefined,
        })
      }
    }

    setCsvData(data)
    setSuccess(`Parsed ${data.length} valid emails from CSV`)
  }

const downloadCSVTemplate = () => {
  const rows = [
    ['email', 'firstName', 'lastName', 'cohort'],
    ['example@email.com', 'John', 'Doe', '2024-Q1'],
    ['student@email.com', 'Jane', 'Smith', '2024-Q1'],
  ]

  // Convert to CSV with proper escaping
  const csvContent = rows.map(row => 
    row.map(cell => {
      // Wrap cells in quotes if they contain commas, quotes, or newlines
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }).join(',')
  ).join('\n')

  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'enrollment_template.csv'
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setEnrollmentResults(null)

    if (!selectedProgram) {
      setError('Please select a program')
      return
    }

    setLoading(true)

    try {
      let response

      if (mode === 'existing') {
        if (selectedStudents.length === 0) {
          setError('Please select at least one student')
          setLoading(false)
          return
        }

        // Enroll existing users
        response = await enrollmentService.bulkEnrollStudents({
          studentIds: selectedStudents,
          programId: selectedProgram,
          cohort: cohort || undefined,
          notes: notes || undefined
        })
      } else if (mode === 'email-list') {
        if (parsedEmails.length === 0) {
          setError('Please enter at least one valid email')
          setLoading(false)
          return
        }

        // Enroll by email list
        response = await enrollmentService.bulkEnrollByEmail({
          emails: parsedEmails,
          programId: selectedProgram,
          cohort: cohort || undefined,
          notes: notes || undefined,
          createUsers: true // Create users if they don't exist
        })
      } else if (mode === 'csv') {
        if (csvData.length === 0) {
          setError('Please upload a valid CSV file')
          setLoading(false)
          return
        }

        // Enroll by CSV data
        response = await enrollmentService.bulkEnrollByEmail({
          emails: csvData,
          programId: selectedProgram,
          cohort: cohort || undefined,
          notes: notes || undefined,
          createUsers: true
        })
      }

      if (response?.success) {
        setEnrollmentResults(response.data)
        setSuccess(
          `Bulk enrollment completed: ${response.data.enrolled} successful, ${response.data.failed} failed`
        )
        
        // If all succeeded, redirect after delay
        if (response.data.failed === 0) {
          setTimeout(() => router.push('/dashboard/admin/enrollment'), 3000)
        }
      } else {
        setError(response?.error || 'Failed to enroll students')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-lime-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  const filteredStudents = students.filter(
    s =>
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const availableStudents = filteredStudents.filter(s => !s.isEnrolled)
  const enrolledStudents = filteredStudents.filter(s => s.isEnrolled)

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/admin/enrollments"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Enrollments
          </Link>

          <h1 className="text-3xl font-bold text-white">Create Enrollment</h1>
          <p className="text-gray-400 mt-1">Enroll students in a program</p>
        </div>

        {/* Mode Selection */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700 mb-6">
          <h2 className="text-white font-semibold mb-4">Enrollment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'existing'
                  ? 'border-lime-500 bg-lime-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <Users
                className={`mx-auto mb-2 ${mode === 'existing' ? 'text-lime-500' : 'text-gray-400'}`}
                size={32}
              />
              <p className={`font-semibold ${mode === 'existing' ? 'text-lime-400' : 'text-gray-400'}`}>
                Existing Users
              </p>
              <p className="text-gray-500 text-sm mt-1">Select from registered students</p>
            </button>

            <button
              type="button"
              onClick={() => setMode('email-list')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'email-list'
                  ? 'border-lime-500 bg-lime-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <Mail
                className={`mx-auto mb-2 ${mode === 'email-list' ? 'text-lime-500' : 'text-gray-400'}`}
                size={32}
              />
              <p className={`font-semibold ${mode === 'email-list' ? 'text-lime-400' : 'text-gray-400'}`}>
                Email List
              </p>
              <p className="text-gray-500 text-sm mt-1">Paste emails to enroll</p>
            </button>

            <button
              type="button"
              onClick={() => setMode('csv')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'csv'
                  ? 'border-lime-500 bg-lime-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <FileSpreadsheet
                className={`mx-auto mb-2 ${mode === 'csv' ? 'text-lime-500' : 'text-gray-400'}`}
                size={32}
              />
              <p className={`font-semibold ${mode === 'csv' ? 'text-lime-400' : 'text-gray-400'}`}>
                CSV Upload
              </p>
              <p className="text-gray-500 text-sm mt-1">Import from spreadsheet</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Program Selection */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700">
            <label className="block text-white font-semibold mb-2">Select Program *</label>
            <select
              value={selectedProgram}
              onChange={e => setSelectedProgram(e.target.value)}
              required
              className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              <option value="">Choose a program...</option>
              {programs.map(program => (
                <option key={program._id} value={program._id}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>

          {/* EXISTING USERS MODE */}
          {selectedProgram && mode === 'existing' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <label className="text-white font-semibold">Select Students *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    className="text-sm px-3 py-1 bg-lime-500/20 text-lime-400 rounded-lg hover:bg-lime-500/30 transition-colors"
                  >
                    Select All Available
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllStudents}
                    className="text-sm px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search students by name or email..."
                  className="w-full bg-slate-700 border border-gray-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              {fetchingStudents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {availableStudents.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Available Students ({availableStudents.length})</p>
                      {availableStudents.map(student => (
                        <label
                          key={student._id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all mb-2 ${
                            selectedStudents.includes(student._id)
                              ? 'bg-lime-500/10 border-lime-500'
                              : 'bg-slate-700 border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => toggleStudentSelection(student._id)}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-gray-400 text-sm">{student.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {enrolledStudents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-500 text-sm mb-2">Already Enrolled ({enrolledStudents.length})</p>
                      {enrolledStudents.map(student => (
                        <div
                          key={student._id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-gray-700 mb-2 opacity-50"
                        >
                          <UserCheck size={16} className="text-green-400" />
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-gray-400 text-sm">{student.email}</p>
                          </div>
                          <span className="text-xs text-green-400">Enrolled</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8">
                      <Users size={48} className="text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No students found</p>
                    </div>
                  )}
                </div>
              )}

              {selectedStudents.length > 0 && (
                <div className="mt-4 p-3 bg-lime-500/10 border border-lime-500/30 rounded-lg">
                  <p className="text-lime-400 text-sm">
                    {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EMAIL LIST MODE */}
          {selectedProgram && mode === 'email-list' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700">
              <label className="block text-white font-semibold mb-2">Enter Email Addresses *</label>
              <p className="text-gray-400 text-sm mb-4">
                Enter one email per line, or separate with commas. Accounts will be created for new users.
              </p>
              <textarea
                value={emailList}
                onChange={e => setEmailList(e.target.value)}
                placeholder="student1@example.com&#10;student2@example.com&#10;student3@example.com"
                rows={8}
                className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 font-mono text-sm resize-none"
              />
              {parsedEmails.length > 0 && (
                <div className="mt-4 p-3 bg-lime-500/10 border border-lime-500/30 rounded-lg">
                  <p className="text-lime-400 text-sm">
                    {parsedEmails.length} valid email{parsedEmails.length > 1 ? 's' : ''} detected
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CSV UPLOAD MODE */}
          {selectedProgram && mode === 'csv' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-white font-semibold">Upload CSV File *</label>
                <button
                  type="button"
                  onClick={downloadCSVTemplate}
                  className="flex items-center gap-2 text-sm text-lime-400 hover:text-lime-300 transition-colors"
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                CSV should contain: email (required), firstName, lastName, cohort (optional)
              </p>

              <input
                ref={fileInputRef}
                type="file"
                 accept=".csv,.xlsx,.xls" // Accept CSV and Excel files
                onChange={handleCSVUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-600 hover:border-lime-500 rounded-lg transition-all flex flex-col items-center gap-3 group"
              >
                <Upload className="w-12 h-12 text-gray-400 group-hover:text-lime-500 transition-colors" />
                <div className="text-center">
                  <p className="text-white font-semibold">Click to upload CSV</p>
                  <p className="text-gray-400 text-sm">or drag and drop</p>
                </div>
              </button>

              {csvData.length > 0 && (
                <div className="mt-4 p-4 bg-lime-500/10 border border-lime-500/30 rounded-lg">
                  <p className="text-lime-400 font-semibold mb-2">
                    {csvData.length} record{csvData.length > 1 ? 's' : ''} loaded
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {csvData.slice(0, 5).map((entry, idx) => (
                      <p key={idx} className="text-gray-300 text-sm">
                        {entry.email} {entry.firstName && `- ${entry.firstName} ${entry.lastName || ''}`}
                      </p>
                    ))}
                    {csvData.length > 5 && (
                      <p className="text-gray-400 text-sm italic">...and {csvData.length - 5} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optional Fields */}
          {selectedProgram && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Additional Information (Optional)</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Default Cohort {mode !== 'csv' && '(applies to all students)'}
                  </label>
                  <input
                    type="text"
                    value={cohort}
                    onChange={e => setCohort(e.target.value)}
                    placeholder="e.g., Cohort 2024-Q1"
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                  {mode === 'csv' && (
                    <p className="text-gray-500 text-xs mt-1">
                      Used only if cohort is not specified in CSV
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add any notes about this enrollment..."
                    rows={3}
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-400">{error}</p>
              </div>
              <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                <X size={20} />
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="text-green-400 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-green-400">{success}</p>
              </div>
              <button type="button" onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
                <X size={20} />
              </button>
            </div>
          )}

          {/* Enrollment Results */}
          {enrollmentResults && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} />
                Enrollment Results
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm">Successful</p>
                  <p className="text-2xl font-bold text-green-400">{enrollmentResults.enrolled}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{enrollmentResults.failed}</p>
                </div>
              </div>

              {enrollmentResults.errors && enrollmentResults.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-red-400 font-semibold mb-2">Errors:</p>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {enrollmentResults.errors.map((err: any, idx: number) => (
                      <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded p-2 text-sm">
                        <p className="text-red-400">{err.email}: {err.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/dashboard/admin/enrollments"
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedProgram}
              className="flex-1 px-6 py-3 bg-lime-500 hover:bg-lime-600 text-slate-900 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Enrolling...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Enroll Students
                  {mode === 'existing' && selectedStudents.length > 0 && ` (${selectedStudents.length})`}
                  {mode === 'email-list' && parsedEmails.length > 0 && ` (${parsedEmails.length})`}
                  {mode === 'csv' && csvData.length > 0 && ` (${csvData.length})`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}