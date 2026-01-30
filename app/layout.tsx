import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import { AuthLoadingWrapper } from '@/lib/authLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Accelerator - Master Artificial Intelligence',
  description: 'Transform your career with our intensive 8-week AI and Machine Learning program',
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
          {children}
          </AuthLoadingWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}