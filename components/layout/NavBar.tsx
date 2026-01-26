'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/context/AuthContext'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getInitials = () => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2A434E] backdrop-blur-xl border-b border-gray-800">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-lime-400 to-emerald-500 flex items-center justify-center">
              <span className="text-black font-bold text-xl">A</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white hover:text-[#EFB14A]">AI Accelerator</span>
              <span className="text-xs text-gray-500 block hover:text-[#EFB14A]">Innovation Program</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/program" 
              className="text-gray-400 hover:text-[#EFB14A] transition-colors duration-200 text-sm font-medium"
            >
              Program
            </Link>
            <Link 
              href="/curriculum" 
              className="text-gray-400 hover:text-[#EFB14A] transition-colors duration-200 text-sm font-medium"
            >
              Curriculum
            </Link>
            <Link 
              href="/modules" 
              className="text-gray-400 hover:text-[#EFB14A] transition-colors duration-200 text-sm font-medium"
            >
              Modules
            </Link>
            <Link 
              href="/about" 
              className="text-gray-400 hover:text-[#EFB14A] transition-colors duration-200 text-sm font-medium"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-400 hover:text-[#EFB14A] transition-colors duration-200 text-sm font-medium"
            >
              Contact
            </Link>
          </div>
          
          {/* Auth Buttons / User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-black font-semibold text-sm">
                    {getInitials()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-400">{user.role}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Settings</span>
                        </Link>
                      </div>
                      <div className="border-t border-gray-700 py-2">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            handleLogout()
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-600"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="bg-[#EFB14A] text-black hover:bg-lime-300"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-3">
              {isAuthenticated && user && (
                <div className="px-4 py-3 mb-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-black font-semibold">
                      {getInitials()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <Link
                href="/program"
                className="text-gray-400 hover:text-lime-400 py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Program
              </Link>
              <Link
                href="/curriculum"
                className="text-gray-400 hover:text-lime-400 py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Curriculum
              </Link>
              <Link
                href="/modules"
                className="text-gray-400 hover:text-lime-400 py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Modules
              </Link>
              <Link
                href="/about"
                className="text-gray-400 hover:text-lime-400 py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-lime-400 py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {isAuthenticated && user ? (
                <>
                  <div className="pt-3 border-t border-gray-800">
                    <Link
                      href="/dashboard"
                      className="text-gray-400 hover:text-lime-400 py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="text-gray-400 hover:text-lime-400 py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="text-gray-400 hover:text-lime-400 py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  </div>
                  <div className="pt-3 border-t border-gray-800">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full text-left text-red-400 hover:text-red-300 py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-3 space-y-2 border-t border-gray-800">
                
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      fullWidth
                      className="text-gray-400 border-gray-700"
                       onClick={() => router.push('/auth/login')}
                    >
                      Sign In
                    </Button>
               
             
                    <Button 
                      variant="primary" 
                      size="sm" 
                      fullWidth
                      className="bg-lime-400 text-black hover:bg-lime-300"
                       onClick={() => router.push('/auth/register')}
                    >
                      Get Started
                    </Button>
                
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}