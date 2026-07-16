import React, { type ReactNode, type ErrorInfo } from 'react'
import { Button } from './ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-accent">Something went wrong</h1>
            <p className="text-sm text-text-secondary">
              An unexpected error occurred. You can try refreshing the page or clearing the local data if the issue persists.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button type="button" onClick={() => window.location.reload()}>Reload Page</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (window.confirm('This will delete all tasks. Are you sure?')) {
                    window.localStorage.clear()
                    indexedDB.deleteDatabase('daily-tasks-db')
                    window.location.reload()
                  }
                }}
              >
                Clear Data & Reset
              </Button>
            </div>
            {this.state.error && (
              <pre className="mt-6 max-h-32 overflow-auto rounded-lg bg-surface-elevated p-3 text-left text-xs text-text-muted">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
