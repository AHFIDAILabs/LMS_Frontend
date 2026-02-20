'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import Image from 'next/image'
import clsx from 'clsx'
import { useState } from 'react'
import { useNotificationCount } from '@/hooks/useNotificationCount'
import {
  LayoutDashboard, Users, BookOpen, CheckCircle2,
  BarChart3, Award, Settings, LogOut, ChevronDown,
  Layers, FileText, Bell, Gift,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  isNotification?: boolean
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',     href: '/dashboard/admin',               icon: LayoutDashboard },
      { label: 'Notifications', href: '/dashboard/admin/notifications', icon: Bell, isNotification: true },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        label: 'Users', href: '/dashboard/admin/users', icon: Users,
        children: [
          { label: 'All Users',    href: '/dashboard/admin/users',            icon: Users },
          { label: 'Students',     href: '/dashboard/admin/users/students',   icon: Users },
          { label: 'Instructors',  href: '/dashboard/admin/users/instructors',icon: Users },
        ],
      },
      {
        label: 'Programs', href: '/dashboard/admin/programes', icon: Layers,
        children: [
          { label: 'All Programs', href: '/dashboard/admin/programes',        icon: Layers },
          { label: 'Course',       href: '/dashboard/admin/programes/course', icon: Layers },
        ],
      },
      {
        label: 'Courses', href: '/dashboard/admin/courses', icon: BookOpen,
        children: [
          { label: 'All Courses', href: '/dashboard/admin/courses',   icon: BookOpen },
          { label: 'Programs',    href: '/dashboard/admin/programes', icon: Layers },
        ],
      },
      { label: 'Approvals',   href: '/dashboard/admin/approvals',   icon: CheckCircle2 },
      { label: 'Enrollments', href: '/dashboard/admin/enrollment',  icon: FileText },
      {
        label: 'Scholarships', href: '/dashboard/admin/scholarship', icon: Gift,
        children: [
          { label: 'All Scholarships', href: '/dashboard/admin/scholarship',       icon: Gift },
          { label: 'Statistics',       href: '/dashboard/admin/scholarship/stats', icon: BarChart3 },
        ],
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Analytics',    href: '/dashboard/admin/analytics',    icon: BarChart3 },
      { label: 'Certificates', href: '/dashboard/admin/certificates', icon: Award },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
    ],
  },
]

function NavLink({ item, level = 0, unreadCount = 0 }: {
  item: NavItem; level?: number; unreadCount?: number
}) {
  const pathname = usePathname()
  const hasChildren = item.children && item.children.length > 0
  const parentActive = hasChildren && pathname.startsWith(item.href)
  const exactActive  = !hasChildren && pathname === item.href
  const active = parentActive || exactActive

  return (
    <>
      <Link
        href={item.href}
        className={clsx(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
          level > 0 && 'ml-4 pl-3 py-2 text-xs',
          active ? 'bg-purple-500/10 text-purple-400' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
        )}
      >
        {/* Icon with badge overlay */}
        <div className="relative shrink-0 w-5 h-5 flex items-center justify-center">
          <item.icon className={clsx(level > 0 ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]')} />
          {item.isNotification && unreadCount > 0 && (
            <span
              className="absolute -top-2 -right-2 min-w-[17px] h-[17px] px-[3px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none z-10"
              style={{ boxShadow: '0 0 0 1.5px #020617' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        <span className="flex-1">{item.label}</span>

        {hasChildren && (
          <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', parentActive ? 'rotate-180' : '')} />
        )}
      </Link>

      {hasChildren && parentActive && (
        <div className="mt-0.5">
          {item.children!.map((child) => (
            <NavLink key={child.href} item={child} level={1} unreadCount={unreadCount} />
          ))}
        </div>
      )}
    </>
  )
}

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const [imageError, setImageError] = useState(false)
  const { unreadCount } = useNotificationCount()

  const handleLogout = async () => { try { await logout() } catch {} }
  const userInitials = `${(user?.firstName?.[0] || '').toUpperCase()}${(user?.lastName?.[0] || '').toUpperCase()}`

  const getValidImageUrl = (url?: string) => {
    if (!url || url.trim() === '') return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return url.startsWith('/') ? url : `/${url}`
  }
  const validImageUrl   = getValidImageUrl(user?.profileImage)
  const shouldShowImage = validImageUrl && !imageError

  return (
    <aside className="fixed inset-y-0 left-0 w-64 py-2.5 bg-slate-950 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <Link href="/" className="h-16 flex items-center px-6 border-b border-gray-800">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-lime-500 to-emerald-500 flex items-center justify-center shrink-0">
          <span className="font-bold text-slate-900">A</span>
        </div>
        <span className="ml-3 text-white font-semibold text-lg truncate">AI4SID~Academy</span>
      </Link>

      <div className="px-4 pt-4 pb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Admin Panel
        </span>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-4 mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} unreadCount={unreadCount} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-800">
        <Link href="/profile" className="flex items-center gap-3 p-4">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-gray-300 shrink-0 overflow-hidden">
            {shouldShowImage ? (
              <Image src={validImageUrl!} alt="" width={36} height={36} className="w-full h-full object-cover" onError={() => setImageError(true)} unoptimized />
            ) : (
              <span>{userInitials || 'A'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </Link>
        <div className="px-3 pb-3">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-slate-800 hover:text-red-400 transition-all">
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}