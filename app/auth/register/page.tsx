'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/lib/context/AuthContext'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const { register: registerUser, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (!agreeTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    try {
      await registerUser({ 
        firstName, 
        lastName, 
        email, 
        password 
      })
      // Navigation is handled in AuthContext
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    }
  }

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    console.log('Google signup')
  }

  const handleGithubSignup = () => {
    // TODO: Implement GitHub OAuth
    console.log('GitHub signup')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Side - Welcome Section */}
<div
  className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden rounded-l-xl"
  style={{
    backgroundImage: "url('/images/Dr.Kay4.jpeg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
>
  {/* Overlay for readability */}
  <div className="absolute inset-0 bg-black/60" />

  {/* Ambient glows */}
  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[140px] rounded-full animate-pulse" />
  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/10 blur-[140px] rounded-full animate-pulse delay-1000" />

  {/* Decorative spheres */}
  <div className="absolute inset-0 flex items-center justify-center opacity-20">
    <div className="w-[500px] h-[500px] rounded-full border border-emerald-500/20" />
    <div className="absolute w-[400px] h-[400px] rounded-full border border-lime-500/30" />
    <div className="absolute w-[300px] h-[300px] rounded-full border border-[#EFB14A]/40" />
  </div>

  <div className="relative z-10 max-w-md text-start">
    <h1 className="text-5xl font-bold text-white mb-6">
      Join the Future<br />of AI Learning
    </h1>
    <p className="text-gray-300 text-lg leading-relaxed mb-8">
      Start your journey in artificial intelligence. Build, learn, and innovate with our comprehensive program.
    </p>

    {/* Benefits */}
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-lime-500/10 border border-lime-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-gray-300">Access to all courses</span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-lime-500/10 border border-lime-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-gray-300">Certificate upon completion</span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-lime-500/10 border border-lime-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-gray-300">Community support</span>
      </div>
    </div>
  </div>
</div>


      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-y-auto">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EFB14A]/5 blur-[140px] rounded-full" />
        
        <div className="w-full max-w-md relative z-10 py-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-lime-500 to-emerald-500 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold text-white">AI Accelerator</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Create your account
            </h2>
            <p className="text-gray-400">
              Start your AI learning journey today
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-8 bg-slate-800/50 p-1 rounded-lg">
            <Link href="/auth/login" className="flex-1 text-center py-2 px-4 text-gray-400 hover:text-white rounded-lg font-medium transition-colors">
              Login
            </Link>
            <div className="flex-1 text-center py-2 px-4 bg-slate-700 text-white rounded-lg font-medium cursor-pointer">
              Sign Up
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  disabled={loading}
                  className="bg-slate-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-lime-500 focus:ring-lime-500/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  disabled={loading}
                  className="bg-slate-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-lime-500 focus:ring-lime-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                disabled={loading}
                className="bg-slate-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-lime-500 focus:ring-lime-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="bg-slate-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-lime-500 focus:ring-lime-500/20"
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="bg-slate-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-lime-500 focus:ring-lime-500/20"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={loading}
                className="mt-1 w-4 h-4 rounded border-gray-700 bg-slate-800/50 text-lime-500 focus:ring-lime-500/20"
              />
              <label htmlFor="terms" className="text-sm text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="text-[#EFB14A] hover:text-[#EFB14A]/80 transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#EFB14A] hover:text-[#EFB14A]/80 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              disabled={loading}
              className="bg-[#EFB14A] hover:bg-[#EFB14A]/90 text-slate-900 font-semibold"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700" />
            <span className="px-4 text-sm text-gray-500">OR SIGN UP WITH</span>
            <div className="flex-1 border-t border-gray-700" />
          </div>

          {/* Social Signup */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
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
              onClick={handleGithubSignup}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-slate-800/50 border border-gray-700 hover:border-gray-600 text-white py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#EFB14A] hover:text-[#EFB14A]/80 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500">
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
            © 2024 AI Accelerator. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}