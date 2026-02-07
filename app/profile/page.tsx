// app/profile/page.tsx
'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { StudentProfilePage } from '@/components/profiles/StudentProfilePage'
import { InstructorProfilePage } from '@/components/profiles/InstructorProfilePage'
import { AdminProfilePage } from '@/components/profiles/AdminProfilePage'

export default function ProfilePage() {
  const { user } = useAuth()

  if (user?.role === 'student') return <StudentProfilePage />
  if (user?.role === 'instructor') return <InstructorProfilePage />
  if (user?.role === 'admin') return <AdminProfilePage />

  return <div>Loading...</div>
}