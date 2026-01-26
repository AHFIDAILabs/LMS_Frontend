'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { label: 'My Courses', href: '/courses', icon: '📚' },
  { label: 'Assignments', href: '/assignments', icon: '📝' },
  { label: 'Certificates', href: '/certificates', icon: '🎓' },
  { label: 'Community', href: '/community', icon: '💬' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <div className="w-9 h-9 rounded-lg bg-linear-to-br from-lime-500 to-emerald-500 flex items-center justify-center">
          <span className="font-bold text-slate-900">A</span>
        </div>
        <span className="ml-3 text-white font-semibold text-lg">
          AIxcel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-lime-500/10 text-lime-400'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Storage / Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Storage used</p>
          <div className="text-sm text-white font-semibold mb-2">
            128 MB / 1 GB
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[12%] bg-lime-500 rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  )
}
