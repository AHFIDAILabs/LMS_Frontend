'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { User, RegisterData } from '@/types/user'

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const isLoggingInRef = useRef(false)

  const router = useRouter()
  const isRefreshingRef = useRef(false)


  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'student':
        return '/dashboard/students'
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
  if (typeof window === 'undefined') return

  if (isRefreshingRef.current) {
    console.log('⏳ refreshUser already running')
    return
  }

  isRefreshingRef.current = true

  try {
    const token = authService.getToken()
    
    if (!token) {
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
      clearAuthStorage()
      setLoading(false)
      return
    }

    // Type guard: check if response has 'error' property (error response)
    if ('error' in response && response.error) {
      console.log('❌ Error response from getMe:', response.message)
      clearAuthStorage()
      return
    }

    // Now TypeScript knows this is a ServiceResponse
    if (response.success && response.data) {
      if (Object.keys(response.data).length > 0) {
        console.log('✅ User authenticated:', response.data)
        setUser(response.data as User)
      } else {
        console.log('❌ Empty user data received')
        clearAuthStorage()
      }
    } else {
      console.log('❌ Invalid response structure:', response)
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

    // 🚫 DO NOT LOG OUT ON RATE LIMIT
    if (status === 429) {
      console.warn('⏳ Rate limited – keeping user logged in')
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


  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 Initializing authentication...')
      refreshUser()
    }
  }, [])

  const refreshAuthToken = useCallback(async () => {
    if (typeof window === 'undefined') return

    try {
      console.log('🔄 Refreshing auth token...')
      const response = await authService.refreshToken()
      
      if (response.success && response.token) {
        console.log('✅ Token refreshed successfully')
        await refreshUser()
      } else {
        console.log('❌ Token refresh failed')
        clearAuthStorage()
      }
    } catch (err) {
      console.error('❌ Refresh token failed:', err)
      clearAuthStorage()
      throw err
    }
  }, [clearAuthStorage, refreshUser])

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
      console.log('✅ Registration successful:', userData)
      setUser(userData)

    } catch (err: any) {
      console.error('❌ Registration error:', err)
      setLoading(false)
      throw new Error(err.message || 'Registration failed')
    }
  }, [])

  const logout = useCallback(async () => {
    if (typeof window === 'undefined') return

    console.log('👋 Logging out...')
    
    try {
      await authService.logout()
    } catch (err) {
      console.error('❌ Logout API call failed:', err)
    } finally {
      clearAuthStorage()
      setUser(null)
      window.location.href = '/auth/login'
    }
  }, [clearAuthStorage])

  const updateProfile = useCallback(async (data: any) => {
    if (typeof window === 'undefined') return

    try {
      console.log('📝 Updating profile...')
      const response = await authService.updateProfile(data)
      
      console.log('📦 Update profile response:', response)
      
      if (response.success && response.data) {
        console.log('✅ Profile updated, refreshing user data...')
        
        // Update local user state immediately
        setUser(prev => (prev ? { ...prev, ...response.data } : response.data as User))
        
        // Also refresh from server to ensure we have latest data
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
    window.location.href = '/auth/login'
  }, [clearAuthStorage])

  useEffect(() => {
    if (!user || !isInitialized) return

    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing token...')
      refreshAuthToken().catch(err => {
        console.error('Auto refresh failed:', err)
      })
    }, 14 * 60 * 1000)

    return () => clearInterval(refreshInterval)
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