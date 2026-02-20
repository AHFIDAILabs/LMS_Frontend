'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/context/AuthContext'
import { ChevronDown, Zap, Users, Briefcase, Info, Mail, LayoutDashboard, User, Settings, LogOut } from 'lucide-react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isProgramsDropdownOpen, setIsProgramsDropdownOpen] = useState(false)
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()

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

  const getProfileImage = () => user?.profileImage || null

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin':      return '/dashboard/admin'
      case 'instructor': return '/dashboard/instructor'
      case 'student':
      default:           return '/dashboard/students'
    }
  }

  const getProfileLink = () => {
    // All roles use /profile for now — update per role if paths diverge
    return '/profile'
  }

  const getSettingsLink = () => {
    switch (user?.role) {
      case 'admin':      return '/dashboard/admin/settings'
      case 'instructor': return '/dashboard/instructor/settings'
      case 'student':
      default:           return '/dashboard/students/settings'
    }
  }

  const programPaths = [
    {
      title: 'Bootcamps',
      description: 'Intensive AI & Data training',
      href: '/programs/tech-mastery-bootcamp',
      icon: Zap,
      color: 'lime',
    },
    {
      title: 'Fellowships',
      description: 'Advanced mentorship programs',
      href: '/programs/advanced-professional-fellowships-program',
      icon: Users,
      color: 'emerald',
    },
    {
      title: 'AI Programs',
      description: 'Specialized AI courses',
      href: '/programs/ai-accelerator-masterclass',
      icon: Briefcase,
      color: 'yellow',
    },
  ]

  const ProfileAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const profileImage = getProfileImage()
    const sizeClasses = { sm: 'w-8 h-8 text-sm', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' }

    if (profileImage && profileImage !== 'default-avatar.png' && profileImage.startsWith('http')) {
      return (
        <img
          src={profileImage}
          alt={`${user?.firstName} ${user?.lastName}`}
          className={`${sizeClasses[size]} rounded-full object-cover shadow-lg shadow-lime-500/20`}
        />
      )
    }

    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-slate-900 font-semibold shadow-lg shadow-lime-500/20`}>
        {getInitials()}
      </div>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-gray-800/50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-lime-500/20">
              <span className="text-slate-900 font-bold text-lg">A</span>
            </div>
            <span className="hidden sm:block text-base font-bold text-white group-hover:text-lime-400 transition-colors">
              AI4SID Academy
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Programs Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setIsProgramsDropdownOpen(true)}
                onMouseLeave={() => setIsProgramsDropdownOpen(false)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Programs
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isProgramsDropdownOpen && (
                <div
                  onMouseEnter={() => setIsProgramsDropdownOpen(true)}
                  onMouseLeave={() => setIsProgramsDropdownOpen(false)}
                  className="absolute top-full left-0 mt-1 w-80 bg-slate-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-2">
                    {programPaths.map((program) => {
                      const Icon = program.icon
                      const colorClasses: Record<string, string> = {
                        lime:    'text-lime-400 bg-lime-500/10',
                        emerald: 'text-emerald-400 bg-emerald-500/10',
                        yellow:  'text-yellow-400 bg-yellow-500/10',
                      }
                      return (
                        <Link
                          key={program.href}
                          href={program.href}
                          onClick={() => setIsProgramsDropdownOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
                        >
                          <div className={`p-2 rounded-lg ${colorClasses[program.color]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white group-hover:text-lime-400 transition-colors">
                              {program.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{program.description}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  <div className="border-t border-gray-800 p-2">
                    <Link
                      href="/allPrograms"
                      onClick={() => setIsProgramsDropdownOpen(false)}
                      className="block px-3 py-2 text-sm text-lime-400 hover:bg-slate-800/50 rounded-lg transition-colors text-center font-medium"
                    >
                      View All Programs →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/about" icon={Info}>About</NavLink>
            <NavLink href="/contact" icon={Mail}>Contact</NavLink>
          </div>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <ProfileAvatar size="md" />
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-medium text-white leading-tight">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-gray-800 rounded-xl shadow-2xl z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-800">
                        <p className="text-sm font-medium text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {/* Role badge */}
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-lime-500/10 text-lime-400 border border-lime-500/20">
                          {user?.role}
                        </span>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href={getDashboardLink()}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href={getProfileLink()}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href={getSettingsLink()}  
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>
                      <div className="border-t border-gray-800 p-1.5">
                        <button
                          onClick={() => { setIsUserMenuOpen(false); handleLogout() }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
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
                    className="text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700 hover:bg-slate-800/50"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-900 hover:from-lime-500 hover:to-emerald-600 font-semibold shadow-lg shadow-lime-500/20"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-800/50">
            <div className="flex flex-col space-y-1">

              {isAuthenticated && (
                <div className="px-4 py-3 mb-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar size="lg" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-lime-500/10 text-lime-400 border border-lime-500/20">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Programs */}
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Programs</p>
                {programPaths.map((program) => {
                  const Icon = program.icon
                  return (
                    <Link
                      key={program.href}
                      href={program.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors mb-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 text-lime-400" />
                      {program.title}
                    </Link>
                  )
                })}
              </div>

              <div className="border-t border-gray-800/50 my-2" />

              <Link href="/about" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                <Info className="w-4 h-4" /> About
              </Link>
              <Link href="/contact" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                <Mail className="w-4 h-4" /> Contact
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-800/50 my-2" />
                  <Link href={getDashboardLink()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href={getProfileLink()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  {/* ✅ Dynamic settings link in mobile menu too */}
                  <Link href={getSettingsLink()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button
                    onClick={() => { setIsMenuOpen(false); handleLogout() }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="px-3 pt-3 space-y-2 border-t border-gray-800/50 mt-2">
                  <Button variant="ghost" size="sm" fullWidth className="text-gray-300 border border-gray-800 hover:bg-slate-800/50" onClick={() => { setIsMenuOpen(false); router.push('/auth/login') }}>
                    Sign In
                  </Button>
                  <Button variant="primary" size="sm" fullWidth className="bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-900 hover:from-lime-500 hover:to-emerald-600 font-semibold" onClick={() => { setIsMenuOpen(false); router.push('/auth/register') }}>
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

function NavLink({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors">
      <Icon className="w-3.5 h-3.5" />
      {children}
    </Link>
  )
}