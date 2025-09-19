"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'
const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90',
  outline: 'border border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900',
  ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-900',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}
const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3',
  md: 'h-10 px-4',
  lg: 'h-11 px-6',
  icon: 'h-10 w-10',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
