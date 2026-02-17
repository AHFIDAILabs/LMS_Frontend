'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface AuthLoadingProps {
  children: React.ReactNode
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/about',
  '/contact',
  '/programs',
  '/allPrograms',
  '/courses',
  '/curriculum',
  '/modules',
  '/privacy',
  '/terms',
  '/support',
]

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
  '/auth/login',
  '/register',
  '/auth/register',
]

// Helper function to check if route is public (including dynamic routes)
const isRoutePublic = (pathname: string | null): boolean => {
  if (!pathname) return false
  
  return PUBLIC_ROUTES.some(route => {
    // Exact match
    if (pathname === route) return true
    
    // Allow sub-routes (e.g., /programs/some-slug)
    if (pathname.startsWith(route + '/')) return true
    
    return false
  })
}

// Helper function to check if route is an auth route
const isRouteAuth = (pathname: string | null): boolean => {
  if (!pathname) return false
  return AUTH_ROUTES.includes(pathname)
}

export function AuthLoadingWrapper({ children }: AuthLoadingProps) {
  const { loading, isAuthenticated, user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const hasRedirectedRef = useRef(false)
  const lastPathnameRef = useRef<string | null>(null)

  const isPublicRoute = isRoutePublic(pathname)
  const isAuthRoute = isRouteAuth(pathname)

  useEffect(() => {
    // Reset redirect flag when pathname changes
    if (pathname !== lastPathnameRef.current) {
      hasRedirectedRef.current = false
      lastPathnameRef.current = pathname
    }

    // Skip if still loading auth state
    if (loading) {
      console.log('⏳ Auth still loading, skipping redirect logic')
      return
    }

    // Skip if already redirected for this pathname
    if (hasRedirectedRef.current) {
      console.log('✅ Already redirected for this path, skipping')
      return
    }

    // CASE 1: Authenticated user on auth pages (login/register)
    if (isAuthenticated && isAuthRoute) {
      console.log('🔄 Redirecting authenticated user from auth page to dashboard')
      hasRedirectedRef.current = true
      
      // Get user-specific dashboard
      const dashboardRoute = user?.role === 'student' 
        ? '/dashboard/students'
        : user?.role === 'instructor'
        ? '/dashboard/instructor'
        : user?.role === 'admin'
        ? '/dashboard/admin'
        : '/dashboard/students' // default
      
      router.push(dashboardRoute)
      return
    }

    // CASE 2: Unauthenticated user on protected route
    if (!isAuthenticated && !isPublicRoute) {
      console.log('🔒 Redirecting unauthenticated user to login')
      hasRedirectedRef.current = true
      router.push('/auth/login')
      return
    }

    console.log('✅ No redirect needed')
  }, [loading, isAuthenticated, isAuthRoute, isPublicRoute, pathname, router, user])

  // Show loading spinner while checking authentication
  // BUT only for protected routes to avoid flash on public pages
  if (loading && !isPublicRoute) {
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