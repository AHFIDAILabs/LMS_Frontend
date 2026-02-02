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
      
      if (response.success && response.data && Object.keys(response.data).length > 0) {
        console.log('✅ User authenticated:', response.data)
        setUser(response.data as User)
      } else {
        console.log('❌ Invalid user data, clearing auth')
        clearAuthStorage()
      }
    } catch (err: any) {
      console.error('❌ Error refreshing user:', err.message)
      if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('Not authorized')) {
        clearAuthStorage()
      }
    } finally {
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

    // ✅ ROLE-BASED NAVIGATION HERE
    const route = getDashboardRoute(loggedInUser.role)
    router.replace(route)

  } finally {
    isLoggingInRef.current = false
    setLoading(false)
  }
}, [])



  const register = useCallback(async (data: RegisterData) => {
    if (typeof window === 'undefined') return

    setLoading(true)
    try {
      console.log('📝 Registering user...')
      
      const response = await authService.register(data)

      console.log('📦 Registration response:', response)

      if (!response.success) {
        throw new Error(response.error || 'Registration failed')
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

    const response = await authService.updateProfile(data)
    
    if (response.success && response.data) {
      setUser(prev => (prev ? { ...prev, ...response.data } : response.data as User))
    } else {
      throw new Error('Failed to update profile')
    }
  }, [])

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