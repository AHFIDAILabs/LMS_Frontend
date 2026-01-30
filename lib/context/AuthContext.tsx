'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
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
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Track if component is mounted (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  const clearAuthStorage = useCallback(() => {
    authService.clearTokens()
    setUser(null)
  }, [])

const refreshUser = useCallback(async () => {
  // 1. If we are on the server, we can't check localStorage/cookies easily here
  if (typeof window === 'undefined') return;

  try {
    const token = authService.getToken()
    if (!token) {
      setLoading(false); // No token? Stop loading immediately.
      return;
    }
    
    const response = await authService.getMe();
   if (response.success && response.data && Object.keys(response.data).length > 0) {
  setUser(response.data as User); 
} else {
  clearAuthStorage();
}
  } catch (err) {
    clearAuthStorage();
  } finally {
    setLoading(false);
  }
}, [clearAuthStorage]);

// Trigger refreshUser immediately without waiting for a 'mounted' state variable
useEffect(() => {
  refreshUser();
}, [refreshUser]);

  const refreshAuthToken = useCallback(async () => {
    if (!mounted || typeof window === 'undefined') return

    try {
      const response = await authService.refreshToken()
      if (response.success && response.token) {
        // refresh user data to ensure sync
        await refreshUser()
      } else {
        clearAuthStorage()
      }
    } catch (err) {
      console.error('Refresh token failed:', err)
      clearAuthStorage()
      throw err
    }
  }, [mounted, clearAuthStorage, refreshUser])

const login = useCallback(async (email: string, password: string) => {
  if (!mounted || typeof window === 'undefined') return

  setLoading(true)
  try {
    const response = (await authService.login({ email, password })) as {
      success: boolean
      token?: string
      refreshToken?: string
      data?: User
    }

    console.log('Login response:', response)

    if (!response.success) {
      throw new Error('Login failed')
    }

    if (response.data) {
      console.log('Setting user data:', response.data)
      setUser(response.data)

      // ✅ Navigate after successful login
      router.push('/dashboard/students') 
    }

    console.log('Login successful, user state updated')
  } catch (err: any) {
    console.error('Login error:', err)
    throw new Error(err.message || 'Invalid email or password')
  } finally {
    setLoading(false)
  }
}, [mounted, router])


  const register = useCallback(async (data: RegisterData) => {
    if (!mounted || typeof window === 'undefined') return

    setLoading(true)
    try {
      const response = (await authService.register(data)) as {
        success: boolean
        token?: string
        refreshToken?: string
        data?: User
      }
      
      if (!response.success) {
        throw new Error('Registration failed')
      }
      
      if (response.data) {
        setUser(response.data)
      }
      
      // Redirect to dashboard after successful registration
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Registration error:', err)
      throw new Error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }, [mounted, router])

  const logout = useCallback(async () => {
    if (!mounted || typeof window === 'undefined') return

    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout API call failed:', err)
    } finally {
      clearAuthStorage()
      router.push('/login')
    }
  }, [mounted, clearAuthStorage, router])

  const updateProfile = useCallback(async (data: any) => {
    if (!mounted || typeof window === 'undefined') return

    const response = (await authService.updateProfile(data)) as { success: boolean; data?: User }
    if (response.success && response.data) {
      setUser(prev => (prev ? { ...prev, ...response.data } : response.data!))
    } else {
      throw new Error('Failed to update profile')
    }
  }, [mounted])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!mounted || typeof window === 'undefined') return

    const response = (await authService.changePassword({ currentPassword, newPassword })) as { 
      success: boolean 
    }
    if (!response.success) {
      throw new Error('Failed to change password')
    }
    clearAuthStorage()
    router.push('/login')
  }, [mounted, clearAuthStorage, router])

  // Initial user load on mount (client-side only)
  useEffect(() => {
    if (mounted) {
      refreshUser()
    }
  }, [mounted, refreshUser])

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

/**
 * Hook to access AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}