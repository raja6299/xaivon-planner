import { useContext } from 'react'
import { TaskContext, type TaskContextValue } from './taskContext'

export function useTaskContext(): TaskContextValue {
  const ctx = useContext(TaskContext)
  if (!ctx) {
    throw new Error('useTaskContext must be used within a TaskProvider.')
  }
  return ctx
}
