import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import { AuthLoadingWrapper } from '@/lib/authLoader'
import { Toaster } from 'react-hot-toast'
import { EnrollmentProvider } from '@/lib/context/EnrollmentContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI4SID~Academy- Master Artificial Intelligence',
  description: 'Transform your career with our intensive  AI and Machine Learning programs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthLoadingWrapper >
             <EnrollmentProvider>
          {children}
          </EnrollmentProvider>
          <Toaster position="top-right" reverseOrder={false} />
          </AuthLoadingWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}