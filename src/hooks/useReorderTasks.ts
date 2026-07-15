import { useTaskContext } from '../state/useTaskContext'

export function useReorderTasks() {
  const ctx = useTaskContext()
  return ctx.reorderTasks
}
