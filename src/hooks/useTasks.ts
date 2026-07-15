import { useMemo } from 'react'
import { useTaskContext } from '../state/useTaskContext'
import {
  selectCategories,
  selectCounts,
  selectVisibleTasksState,
} from '../state/selectors'

export function useTasks() {
  const ctx = useTaskContext()
  const visibleTasks = useMemo(() => selectVisibleTasksState(ctx.state), [ctx.state])
  const categories = useMemo(() => selectCategories(ctx.state), [ctx.state])
  const counts = useMemo(() => selectCounts(ctx.state), [ctx.state])

  return {
    ...ctx,
    visibleTasks,
    categories,
    counts,
  }
}
