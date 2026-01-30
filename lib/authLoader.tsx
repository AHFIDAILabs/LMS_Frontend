'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface AuthLoadingProps {
  children: React.ReactNode
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth/login',
  '/register',
  '/auth/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/about',
  '/contact',
  '/programs',        // ✅ Changed from '/program' to '/programs'
  '/allPrograms',     // ✅ Added - your all programs page
  '/courses',         // ✅ Added - course listing pages
  '/curriculum',
  '/modules',
  '/privacy',
  '/terms',
  '/support',
]

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
  '/login',
  '/auth/login',
  '/register',
  '/auth/register',
]

export function AuthLoadingWrapper({ children }: AuthLoadingProps) {
  const { loading, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some(route => pathname === route)

  useEffect(() => {

    
   if (loading && !isPublicRoute) {
      // If user is authenticated and trying to access auth pages, redirect to dashboard
      if (isAuthenticated && isAuthRoute) {
        console.log('Redirecting authenticated user from auth route to dashboard/students')
        router.push('/dashboard/students')
      }
      
      // If user is not authenticated and trying to access protected route, redirect to login
      if (!isAuthenticated && !isPublicRoute) {
        console.log('Redirecting unauthenticated user to login')
        router.push('/login')
      }
    }
  }, [loading, isAuthenticated, isAuthRoute, isPublicRoute, pathname, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          {/* Spinner */}
          <div className="inline-block w-16 h-16 border-4 border-lime-500/20 border-t-lime-500 rounded-full animate-spin mb-4" />
          
          {/* Logo */}
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-lime-400 to-emerald-500 flex items-center justify-center">
              <span className="text-black font-bold text-2xl">A</span>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}