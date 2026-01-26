import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconPosition = 'left', className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white mb-2">
            {label}
            {props.required && <span className="text-error-red ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'w-full bg-space-blue border rounded-lg px-4 py-3',
              'text-white placeholder:text-slate-gray',
              'focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-error-red focus:border-error-red focus:ring-error-red/20' : 'border-slate-gray/30',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-gray">
              {icon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-error-red flex items-center">
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-1 text-sm text-slate-gray">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  rows?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, rows = 4, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white mb-2">
            {label}
            {props.required && <span className="text-error-red ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full bg-space-blue border rounded-lg px-4 py-3',
            'text-white placeholder:text-slate-gray',
            'focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20',
            'transition-all duration-200 resize-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-error-red focus:border-error-red focus:ring-error-red/20' : 'border-slate-gray/30',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-error-red flex items-center">
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-1 text-sm text-slate-gray">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'