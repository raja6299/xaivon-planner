import { useCallback, useMemo } from 'react'
import { useTaskContext } from '../state/useTaskContext'
import type { UpdateTaskInput } from '../types/task'

export function useTask(id: string) {
  const ctx = useTaskContext()
  const task = useMemo(
    () => ctx.state.tasks.find((t) => t.id === id) ?? null,
    [ctx.state.tasks, id],
  )

  const update = useCallback(
    (patch: UpdateTaskInput) => ctx.updateTask(id, patch),
    [ctx, id],
  )
  const remove = useCallback(() => ctx.deleteTask(id), [ctx, id])
  const toggle = useCallback(() => ctx.toggleTask(id), [ctx, id])

  return {
    task,
    update,
    remove,
    toggle,
    isLoading: ctx.state.status === 'loading',
  }
}
