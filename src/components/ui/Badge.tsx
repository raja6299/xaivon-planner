import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

export const Badge = ({ children, variant = 'secondary', size = 'md', className = '' }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center rounded-full font-medium text-xs tracking-wider px-2 py-0.5 whitespace-nowrap'
  const variantStyles = {
    primary: 'bg-primary text-surface',
    secondary: 'bg-surface-elevated text-text-primary',
    success: 'bg-green-600 text-white',
    warning: 'bg-amber-500 text-white',
    error: 'bg-red-500 text-white',
  }
  const sizeStyles = {
    xs: 'text-[0.65rem] px-1.5 py-0',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
  }

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'