import React from 'react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  id?: string
  className?: string
  tabIndex?: number
  'aria-label'?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      onChange,
      disabled = false,
      label,
      size = 'md',
      id,
      className = '',
      tabIndex,
      'aria-label': ariaLabel,
    },
    ref,
  ) => {
    const baseStyles = 'rounded border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:ring-primary transition-colors duration-150 touch-target cursor-pointer'
    const sizeStyles = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }
    const checkedStyles = checked ? 'bg-primary border-primary' : 'bg-surface hover:bg-surface-elevated'

    return (
      <label className="flex items-center gap-2 cursor-pointer" htmlFor={id}>
        <input
          ref={ref}
          type="checkbox"
          className={`${baseStyles} ${sizeStyles[size]} ${checkedStyles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          id={id}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          aria-checked={checked}
        />
        {label && <span className="text-sm text-text-primary">{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'