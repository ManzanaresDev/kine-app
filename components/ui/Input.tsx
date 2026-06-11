// src/components/ui/Input.tsx
import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-stone-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white',
          'placeholder:text-stone-400 text-stone-900',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
          'transition-shadow duration-150',
          error && 'border-rose-300 focus:ring-rose-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}
