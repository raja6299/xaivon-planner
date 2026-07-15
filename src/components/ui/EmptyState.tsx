import React from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onAction, icon }) => {
  return (
    <div className="p-6 bg-surface border border-border rounded-xl shadow-sm flex flex-col items-center">
      {icon && <div className="mb-2">{icon}</div>}
      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
      {description && <p className="text-text-secondary mb-4">{description}</p>}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-primary text-surface rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

EmptyState.displayName = 'EmptyState'