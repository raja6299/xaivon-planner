import { useTaskContext } from '../state/useTaskContext'

export function useToggleTask() {
  const ctx = useTaskContext()
  return ctx.toggleTask
}
