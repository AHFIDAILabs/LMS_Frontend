import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number // 0-100
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'success' | 'warning'
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  size = 'md',
  variant = 'primary',
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }
  
  const variants = {
    primary: 'bg-gradient-to-r from-lime-500 to-emerald-500',
    success: 'bg-gradient-to-r from-emerald-500 to-lime-500',
    warning: 'bg-gradient-to-r from-[#EFB14A] to-yellow-500',
  }
  
  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="font-semibold text-white">{percentage}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-800 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  variant?: 'primary' | 'success' | 'warning'
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  variant = 'primary',
}: CircularProgressProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  
  const colors = {
    primary: '#84cc16',
    success: '#10B981',
    warning: '#EFB14A',
  }
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{percentage}%</span>
          <span className="text-xs text-gray-400">Complete</span>
        </div>
      )}
    </div>
  )
}