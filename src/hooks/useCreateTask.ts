import { useTaskContext } from '../state/useTaskContext'

export function useCreateTask() {
  const ctx = useTaskContext()
  return ctx.createTask
}
