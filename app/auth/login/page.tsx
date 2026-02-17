'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/lib/context/AuthContext'
import toast from 'react-hot-toast'

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 // minutes
const LOCKOUT_STORAGE_KEY = 'account_lockout'

interface LoginAttempt {
  email: string
  attempts: number
  lastAttempt: number
  lockedUntil?: number
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const router = useRouter()
  const { user, login, loading } = useAuth()

  useEffect(() => { checkAccountLockout() }, [])

  useEffect(() => {
    if (user && !loading) router.replace('/')
  }, [user, loading, router])

  useEffect(() => {
    if (isLocked && remainingTime > 0) {
      const timer = setInterval(() => {
        const lockoutData = getLockoutData()
        if (lockoutData?.lockedUntil) {
          const remaining = Math.ceil((lockoutData.lockedUntil - Date.now()) / 60000)
          if (remaining <= 0) {
            clearLockout()
            toast.success('You can try logging in again.')
          } else setRemainingTime(remaining)
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isLocked, remainingTime])

  const getLockoutData = (): LoginAttempt | null => {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(LOCKOUT_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  }

  const setLockoutData = (data: LoginAttempt) =>
    localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(data))

  const clearLockout = () => {
    localStorage.removeItem(LOCKOUT_STORAGE_KEY)
    setIsLocked(false)
    setRemainingTime(0)
  }

  const checkAccountLockout = () => {
    const lockoutData = getLockoutData()
    if (!lockoutData?.lockedUntil) return
    const now = Date.now()
    if (lockoutData.lockedUntil > now) {
      const remaining = Math.ceil((lockoutData.lockedUntil - now) / 60000)
      setIsLocked(true)
      setRemainingTime(remaining)
      toast.error(`Account locked. Try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.`)
    } else clearLockout()
  }

  const recordFailedAttempt = (userEmail: string) => {
    const lockoutData = getLockoutData() || { email: userEmail, attempts: 0, lastAttempt: Date.now() }

    lockoutData.attempts++
    lockoutData.lastAttempt = Date.now()

    if (lockoutData.attempts >= MAX_LOGIN_ATTEMPTS) {
      lockoutData.lockedUntil = Date.now() + LOCKOUT_DURATION * 60 * 1000
      setIsLocked(true)
      setRemainingTime(LOCKOUT_DURATION)
      toast.error(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION} minutes.`)
    } else {
      const remaining = MAX_LOGIN_ATTEMPTS - lockoutData.attempts
      toast.error(`Login failed. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.`, {
        duration: 4000,
      })
    }

    setLockoutData(lockoutData)
  }

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password: string) => password.length >= 8
  const sanitizeInput = (input: string) => input.trim().replace(/[<>]/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      toast.error(`Account locked. Try again in ${remainingTime} minute${remainingTime !== 1 ? 's' : ''}.`)
      return
    }

    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = password

    if (!validateEmail(sanitizedEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!validatePassword(sanitizedPassword)) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      await login(sanitizedEmail, sanitizedPassword)
      
      // Clear lockout on successful login
      clearLockout()
      
      toast.success('Login successful! Redirecting...', {
        icon: '✅',
        duration: 2000,
      })
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('remember_email', sanitizedEmail)
      } else {
        localStorage.removeItem('remember_email')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Extract error message from backend response
      let errorMessage = 'Login failed. Please try again.'
      
      // Check for specific error messages from backend
      if (err.message) {
        errorMessage = err.message
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
      
      // Map backend error messages to user-friendly messages
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.'
      } else if (errorMessage.toLowerCase().includes('account is not active')) {
        errorMessage = 'Your account is not active. Please contact support for assistance.'
      } else if (errorMessage.toLowerCase().includes('account locked') || errorMessage.toLowerCase().includes('too many')) {
        errorMessage = 'Account temporarily locked due to too many failed attempts.'
      } else if (errorMessage.toLowerCase().includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (errorMessage.toLowerCase().includes('server')) {
        errorMessage = 'Server error. Please try again later.'
      }
      
      // Show error toast
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      })
      
      // Record failed attempt for lockout mechanism
      recordFailedAttempt(sanitizedEmail)
    }
  }

  const handleGoogleLogin = () => { 
    toast('Google login coming soon!', { icon: '🚧' })
    console.log('Google login') 
  }
  
  const handleGithubLogin = () => { 
    toast('GitHub login coming soon!', { icon: '🚧' })
    console.log('GitHub login') 
  }

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remember_email')
    if (rememberedEmail) { 
      setEmail(rememberedEmail)
      setRememberMe(true) 
    }
  }, [])

  if (loading && user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#EFB14A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Side - Welcome Section */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden rounded-l-xl"
        style={{
          backgroundImage: "url('/images/Dr.Kay3.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-500/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[140px] rounded-full animate-pulse delay-1000" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-[500px] h-[500px] rounded-full border border-lime-500/20" />
          <div className="absolute w-[400px] h-[400px] rounded-full border border-lime-500/30" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-lime-500/40" />
        </div>

        <div className="relative z-10 max-w-md text-start">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome<br />Back
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Experience the next generation of AI-driven learning. Secure, intelligent, and designed for innovators.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EFB14A]/5 blur-[140px] rounded-full" />
        
        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-lime-500 to-emerald-500 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold text-white">AI4SID~Academy</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Login to your account
            </h2>
            <p className="text-gray-400">
              Enter your details to access your dashboard
            </p>
          </div>

          {/* Security Notice for Locked Account */}
          {isLocked && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="font-semibold mb-1">Account Temporarily Locked</p>
                  <p className="text-sm">Too many failed login attempts. Please try again in {remainingTime} minute{remainingTime !== 1 ? 's' : ''}.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-2 mb-8 bg-slate-800/50 p-1 rounded-lg">
            <div className="flex-1 text-center py-2 px-4 bg-slate-700 text-white rounded-lg font-medium cursor-pointer">
              Login
            </div>
            <Link href="/auth/register" className="flex-1 text-center py-2 px-4 text-gray-400 hover:text-white rounded-lg font-medium transition-colors">
              Sign Up
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                disabled={loading || isLocked}
                autoComplete="email"
                maxLength={100}
                className="bg-slate-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-lime-500 focus:ring-lime-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-[#EFB14A] hover:text-[#EFB14A]/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading || isLocked}
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={128}
                  className="bg-slate-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-lime-500 focus:ring-lime-500/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={loading || isLocked}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading || isLocked}
                  className="w-4 h-4 rounded border-gray-700 bg-slate-800/50 text-lime-500 focus:ring-lime-500/20"
                />
                <label htmlFor="remember" className="text-sm text-gray-400">
                  Remember my email
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              disabled={loading || isLocked}
              className="bg-[#EFB14A] hover:bg-[#EFB14A]/90 text-slate-900 font-semibold"
            >
              {loading ? 'Signing in...' : isLocked ? 'Account Locked' : 'Sign In →'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700" />
            <span className="px-4 text-sm text-gray-500">OR CONTINUE WITH</span>
            <div className="flex-1 border-t border-gray-700" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading || isLocked}
              className="flex items-center justify-center space-x-2 bg-slate-800/50 border border-gray-700 hover:border-gray-600 text-white py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            
            <button
              onClick={handleGithubLogin}
              disabled={loading || isLocked}
              className="flex items-center justify-center space-x-2 bg-slate-800/50 border border-gray-700 hover:border-gray-600 text-white py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account yet?{' '}
              <Link href="/auth/register" className="text-[#EFB14A] hover:text-[#EFB14A]/80 font-semibold transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-12 flex items-center justify-center space-x-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/support" className="hover:text-gray-400 transition-colors">
              Contact Support
            </Link>
          </div>

          {/* Copyright */}
          <div className="mt-4 text-center text-xs text-gray-600">
            © 2024 AI4SID~Academy. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}