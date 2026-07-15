import { useTaskContext } from '../state/useTaskContext'

export function useDeleteTask() {
  const ctx = useTaskContext()
  return ctx.deleteTask
}
