import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'neutral'
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full border'
  
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    neutral: 'bg-gray-800 text-gray-400 border-gray-700',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }
  
  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: 'completed' | 'in-progress' | 'not-started' | 'locked'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    'completed': { 
      variant: 'success' as const, 
      label: 'Completed', 
      icon: '✓' 
    },
    'in-progress': { 
      variant: 'primary' as const, 
      label: 'In Progress', 
      icon: '⏱' 
    },
    'not-started': { 
      variant: 'neutral' as const, 
      label: 'Not Started', 
      icon: '○' 
    },
    'locked': { 
      variant: 'neutral' as const, 
      label: 'Locked', 
      icon: '🔒' 
    },
  }
  
  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant} size="sm">
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  )
}