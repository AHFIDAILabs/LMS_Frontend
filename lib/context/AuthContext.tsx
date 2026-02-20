'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/services/authService'
import { User, RegisterData } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  refreshUser: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  refreshAuthToken: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ✅ ADDED: Store initialization state globally (survives hot reloads)
if (typeof window !== 'undefined') {
  (window as any).__authInitialized = (window as any).__authInitialized || false
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const isLoggingInRef = useRef(false)
  const isRefreshingRef = useRef(false)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  const router = useRouter()
  const pathname = usePathname()

  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'student':
        return '/dashboard/student'
      case 'admin':
        return '/dashboard/admin'
      case 'instructor':
        return '/dashboard/instructor'
      default:
        return '/'
    }
  }

  const clearAuthStorage = useCallback(() => {
    authService.clearTokens()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    // Skip if not in browser
    if (typeof window === 'undefined') return

    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) {
      console.log('⏳ refreshUser already running, skipping...')
      return
    }

    isRefreshingRef.current = true

    try {
      const token = authService.getToken()
      
      // No token found
      if (!token) {
        // Don't clear during login process
        if (isLoggingInRef.current) {
          console.log('⏳ Skipping refreshUser during login')
          return
        }

        console.log('📭 No auth token found')
        setUser(null)
        setLoading(false)
        return
      }

      console.log('🔄 Refreshing user data...')
      
      const response = await authService.getMe()
      
      console.log('📦 getMe response:', response)
      
      if (!response) {
        console.error('❌ No response from getMe')
        // Don't logout on network errors in dev mode
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Network error in dev mode - keeping user logged in')
          setLoading(false)
          return
        }
        clearAuthStorage()
        setLoading(false)
        return
      }

      // Type guard: check if response has 'error' property (error response)
      if ('error' in response && response.error) {
        console.log('❌ Error response from getMe:', response.message)
        
        // Don't logout on server errors in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Server error in dev mode - keeping user logged in')
          setLoading(false)
          return
        }
        
        clearAuthStorage()
        return
      }

      // Now TypeScript knows this is a ServiceResponse
      if (response.success && response.data) {
        if (Object.keys(response.data).length > 0) {
          console.log('✅ User authenticated:', response.data.email)
          setUser(response.data as User)
        } else {
          console.log('❌ Empty user data received')
          clearAuthStorage()
        }
      } else {
        console.log('❌ Invalid response structure')
        // Don't clear in dev mode
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Invalid response in dev mode - keeping session')
          setLoading(false)
          return
        }
        clearAuthStorage()
      }
    } catch (err: any) {
      const status = err?.response?.status || err?.status
      const message = err?.response?.data?.message || err?.message || 'Unknown error'

      console.error('❌ Error in refreshUser:', {
        status,
        message,
        type: err?.name
      })

      // 🚫 NEVER LOG OUT ON THESE ERRORS
      if (
        status === 429 || // Rate limit
        status === 500 || // Server error
        status === 502 || // Bad gateway
        status === 503 || // Service unavailable
        err?.name === 'NetworkError' ||
        err?.code === 'ECONNREFUSED' ||
        message?.includes('fetch failed') ||
        message?.includes('network')
      ) {
        console.warn(`⏳ Temporary error (${status}) – keeping user logged in`)
        setLoading(false)
        return
      }

      // ❌ Only logout on real auth errors
      if (status === 401 || status === 403) {
        console.log('🔒 Auth error detected - clearing storage')
        clearAuthStorage()
      }  
    } finally {
      isRefreshingRef.current = false
      setLoading(false)
      setIsInitialized(true)
    }
  }, [clearAuthStorage])

  // ✅ FIXED: Initialize auth ONCE, survive hot reloads
  useEffect(() => {
    if (typeof window === 'undefined') return

    // ✅ Check global flag to prevent re-initialization on hot reload
    if ((window as any).__authInitialized) {
      console.log('🔥 Hot reload detected - using existing auth state')
      setLoading(false)
      setIsInitialized(true)
      return
    }

    // ✅ Mark as initialized globally
    (window as any).__authInitialized = true
    
    console.log('🚀 Initializing authentication...')
    refreshUser()

    // ✅ Cleanup on unmount (app close, not hot reload)
    return () => {
      // Only reset if window is closing, not on hot reload
      if (typeof window !== 'undefined' && !document.hidden) {
        console.log('🧹 Cleaning up auth context')
      }
    }
  }, []) // Keep empty deps

  // ✅ IMPROVED: Better token refresh with cleanup
  const refreshAuthToken = useCallback(async () => {
    if (typeof window === 'undefined') return

    try {
      console.log('🔄 Refreshing auth token...')
      
      const refreshToken = authService.getRefreshToken()
      
      if (!refreshToken) {
        console.log('📭 No refresh token found - logging out')
        clearAuthStorage()
        return
      }

      const response = await authService.refreshToken()
      
      if (response.success && response.token) {
        console.log('✅ Token refreshed successfully')
        await refreshUser()
      } else {
        console.log('❌ Token refresh failed:', response.message)
        clearAuthStorage()
        
        const isProtectedRoute = pathname?.startsWith('/dashboard')
        if (isProtectedRoute) {
          router.push('/auth/login?session=expired')
        }
      }
    } catch (err: any) {
      const message = err?.message || 'Unknown error'
      console.error('❌ Refresh token error:', message)
      
      clearAuthStorage()
      
      const isProtectedRoute = pathname?.startsWith('/dashboard')
      if (isProtectedRoute) {
        router.push('/auth/login?session=expired')
      }
    }
  }, [clearAuthStorage, refreshUser, router, pathname])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    isLoggingInRef.current = true

    try {
      const response = await authService.login({ email, password })

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed')
      }

      const loggedInUser = response.data as User
      setUser(loggedInUser)

      console.log('✅ Login successful:', loggedInUser.email)

      // Role-based navigation
      const route = getDashboardRoute(loggedInUser.role)
      router.replace(route)

    } catch (err: any) {
      console.error('❌ Login error:', err)
      throw err
    } finally {
      isLoggingInRef.current = false
      setLoading(false)
    }
  }, [router])

  const register = useCallback(async (data: RegisterData) => {
    if (typeof window === 'undefined') return

    setLoading(true)
    try {
      console.log('📝 Registering user...')
      
      const response = await authService.register(data)

      console.log('📦 Registration response:', response)

      if (!response.success) {
        throw new Error(response.message || 'Registration failed')
      }

      if (!response.data) {
        throw new Error('No user data received')
      }

      const userData = response.data as User
      console.log('✅ Registration successful:', userData.email)
      setUser(userData)

      const route = getDashboardRoute(userData.role)
      router.push(route)

    } catch (err: any) {
      console.error('❌ Registration error:', err)
      throw new Error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    if (typeof window === 'undefined') return

    console.log('👋 Logging out...')
    
    // ✅ Clear the global initialization flag
    if (typeof window !== 'undefined') {
      (window as any).__authInitialized = false
    }

    // ✅ Clear refresh timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
    
    try {
      await authService.logout()
    } catch (err) {
      console.error('❌ Logout API call failed:', err)
    } finally {
      clearAuthStorage()
      setUser(null)
      
      router.push('/auth/login')
    }
  }, [clearAuthStorage, router])

  const updateProfile = useCallback(async (data: any) => {
    if (typeof window === 'undefined') return

    try {
      console.log('📝 Updating profile...')
      const response = await authService.updateProfile(data)
      
      console.log('📦 Update profile response:', response)
      
      if (response.success && response.data) {
        console.log('✅ Profile updated')
        
        setUser(prev => (prev ? { ...prev, ...response.data } : response.data as User))
        
        await refreshUser()
      } else {
        throw new Error(response.message || 'Failed to update profile')
      }
    } catch (err: any) {
      console.error('❌ Update profile error:', err)
      throw err
    }
  }, [refreshUser])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (typeof window === 'undefined') return

    const response = await authService.changePassword({ currentPassword, newPassword })
    
    if (!response.success) {
      throw new Error('Failed to change password')
    }
    
    clearAuthStorage()
    router.push('/auth/login')
  }, [clearAuthStorage, router])

  // ✅ IMPROVED: Auto-refresh with proper cleanup
  useEffect(() => {
    if (!user || !isInitialized) {
      // Clear any existing timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
      return
    }

    // ✅ Only set up auto-refresh in production or if explicitly needed
    const shouldAutoRefresh = process.env.NODE_ENV === 'production' || 
                              process.env.NEXT_PUBLIC_ENABLE_AUTO_REFRESH === 'true'

    if (!shouldAutoRefresh) {
      console.log('⏸️ Auto-refresh disabled in development')
      return
    }

    console.log('⏰ Setting up auto-refresh timer (14 minutes)')
    refreshTimerRef.current = setInterval(() => {
      console.log('🔄 Auto-refreshing token...')
      refreshAuthToken().catch(err => {
        console.error('❌ Auto refresh failed:', err)
      })
    }, 14 * 60 * 1000) // 14 minutes

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
        console.log('🧹 Cleared auto-refresh timer')
      }
    }
  }, [user, isInitialized, refreshAuthToken])

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    changePassword,
    refreshAuthToken,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}