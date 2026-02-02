'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import clsx from 'clsx'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Award,
  Settings,
  LogOut,
  ChevronDown,
  Layers,
  FileText,
  Bell,
} from 'lucide-react'

// ──────────────────────────────────────────────
// Nav structure
// ──────────────────────────────────────────────
interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]  // nested routes collapse under the parent
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
      { label: 'Notifications', href: '/dashboard/admin/notifications', icon: Bell },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        label: 'Users',
        href: '/dashboard/users',
        icon: Users,
        children: [
          { label: 'All Users', href: '/dashboard/users', icon: Users },
          { label: 'Students', href: '/dashboard/users/students', icon: Users },
          { label: 'Instructors', href: '/dashboard/users/instructors', icon: Users },
        ],
      },
           {
        label: 'Programs',
        href: '/dashboard/programs',
        icon: Layers,
        children: [
          { label: 'All Programs', href: '/dashboard/programs', icon: Layers },
          { label: 'Course', href: '/dashboard/programs/course', icon: Layers },
        ],
      },
      {
        label: 'Courses',
        href: '/dashboard/courses',
        icon: BookOpen,
        children: [
          { label: 'All Courses', href: '/dashboard/courses', icon: BookOpen },
          { label: 'Programs', href: '/dashboard/programs', icon: Layers },
        ],
      },
      { label: 'Approvals', href: '/dashboard/approvals', icon: CheckCircle2 },
      { label: 'Enrollments', href: '/dashboard/enrollments', icon: FileText },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────
function NavLink({
  item,
  level = 0,
}: {
  item: NavItem
  level?: number
}) {
  const pathname = usePathname()
  const hasChildren = item.children && item.children.length > 0

  // Parent is "active" if the current path starts with its href
  const parentActive = hasChildren && pathname.startsWith(item.href)
  // Exact match for leaf items
  const exactActive = !hasChildren && pathname === item.href

  const active = parentActive || exactActive

  // If this item has children and the parent route is active, show them
  const expanded = parentActive

  return (
    <>
      <Link
        href={item.href}
        className={clsx(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
          level > 0 && 'ml-4 pl-3 py-2 text-xs',
          active
            ? 'bg-lime-500/10 text-lime-400'
            : 'text-gray-400 hover:bg-slate-800 hover:text-white'
        )}
      >
        <item.icon className={clsx('shrink-0', level > 0 ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5')} />
        <span className="flex-1">{item.label}</span>

        {hasChildren && (
          <ChevronDown
            className={clsx(
              'w-3.5 h-3.5 transition-transform',
              expanded ? 'rotate-180' : ''
            )}
          />
        )}
      </Link>

      {/* Nested children */}
      {hasChildren && expanded && (
        <div className="mt-0.5">
          {item.children!.map((child) => (
            <NavLink key={child.href} item={child} level={1} />
          ))}
        </div>
      )}
    </>
  )
}

// ──────────────────────────────────────────────
// Main sidebar
// ──────────────────────────────────────────────
export default function AdminSidebar() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 py-2.5 bg-slate-950 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <Link href="/" className="h-16 flex items-center px-6 border-b border-gray-800">
        <div className="w-9 h-9 rounded-lg bg-linear-to-br from-lime-500 to-emerald-500 flex items-center justify-center shrink-0">
          <span className="font-bold text-slate-900">A</span>
        </div>
        <span className="ml-3 text-white font-semibold text-lg truncate">
          AI4SID~Academy
        </span>
      </Link>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Admin Panel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Group label */}
            <p className="px-4 mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {group.label}
            </p>

            {/* Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — user info + logout */}
      <div className="border-t border-gray-800">
        {/* User strip */}
        <div className="flex items-center gap-3 p-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-gray-300 shrink-0">
            {(user?.firstName?.[0] || '').toUpperCase()}
            {(user?.lastName?.[0] || '').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 pb-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-slate-800 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}