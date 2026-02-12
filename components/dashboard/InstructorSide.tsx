'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import Image from "next/image"
import clsx from 'clsx'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  PenLine,
  Bell,
  Video,
  Layers,
} from 'lucide-react'

// ──────────────────────────────────────────────
// Nav structure
// ──────────────────────────────────────────────
interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard/instructor', icon: LayoutDashboard },
      { label: 'Notifications', href: '/dashboard/instructor/notifications', icon: Bell },
    ],
  },
  {
    label: 'Teaching',
    items: [
      {
        label: 'My Courses',
        href: '/dashboard/instructor/courses',
        icon: BookOpen,
        children: [
          { label: 'All My Courses', href: '/dashboard/instructor/courses', icon: BookOpen },
          { label: 'Create Course', href: '/dashboard/instructor/courses/create', icon: PenLine },
        ],
      },
      {
        label: 'Content',
        href: '/dashboard/instructor/contents',
        icon: Video,
        children: [
          { label: 'Modules', href: '/dashboard/instructor/contents/modules', icon: Layers },
          { label: 'Lessons', href: '/dashboard/instructor/contents/lessons', icon: FileText },
          { label: 'Assessments', href: '/dashboard/instructor/contents/assessments', icon: PenLine },
        ],
      },
      { label: 'My Students', href: '/dashboard/instructor/students', icon: Users },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Analytics', href: '/dashboard/instructor/analytics', icon: BarChart3 },
      { label: 'Submissions', href: '/dashboard/instructor/submissions', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', href: '/dashboard/instructor/settings', icon: Settings },
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

  const parentActive = hasChildren && pathname.startsWith(item.href)
  const exactActive = !hasChildren && pathname === item.href
  const active = parentActive || exactActive
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
export default function InstructorSidebar() {
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Instructor
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-4 mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800">
        <div className="flex items-center gap-3 p-4">
                 <div className="relative w-9 h-9 shrink-0">
         <Image
           src={
             user?.profileImage ||
             "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
           }
           alt={user?.firstName || "Admin"}
           fill
           className="rounded-full object-cover border border-gray-700"
         />
       </div>
       
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-white truncate">
                     {user?.firstName} {user?.lastName}
                   </p>
                   <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                 </div>
               </div>

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