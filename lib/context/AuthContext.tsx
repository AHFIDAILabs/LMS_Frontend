'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User, RegisterData } from '@/types'
import api from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      
      if (!token) {
        setLoading(false)
        return
      }

      const response: any = await api.auth.getCurrentUser()
      
      if (response?.success && response?.data) {
        setUser(response.data)
      } else {
        clearAuthStorage()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      clearAuthStorage()
    } finally {
      setLoading(false)
    }
  }

  const clearAuthStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
    }
    setUser(null)
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response: any = await api.auth.login({ email, password })

      if (!response?.success) {
        throw new Error(response?.message || 'Login failed')
      }

      if (typeof window !== 'undefined') {
        if (response.token) {
          localStorage.setItem('authToken', response.token)
        }
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken)
        }
      }

      if (response.data) {
        setUser(response.data)
      } else if (response.user) {
        setUser(response.user)
      }

      router.push('/dashboard/students')
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      const response: any = await api.auth.register(data)

      if (!response?.success) {
        throw new Error(response?.message || 'Registration failed')
      }

      if (typeof window !== 'undefined') {
        if (response.token) {
          localStorage.setItem('authToken', response.token)
        }
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken)
        }
      }

      if (response.data) {
        setUser(response.data)
      } else if (response.user) {
        setUser(response.user)
      }

      router.push('/dashboard/students')
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      clearAuthStorage()
      router.push('/login')
    }
  }

  const updateProfile = async (data: any) => {
    try {
      const response: any = await api.auth.updateProfile(data)
      
      if (response?.success && response?.data) {
        setUser(prev => prev ? { ...prev, ...response.data } : response.data)
      } else {
        throw new Error(response?.message || 'Profile update failed')
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      throw new Error(error.message || 'Failed to update profile')
    }
  }

  const refreshUser = async () => {
    try {
      const response: any = await api.auth.getCurrentUser()
      
      if (response?.success && response?.data) {
        setUser(response.data)
      } else {
        clearAuthStorage()
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      clearAuthStorage()
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}