import { useMemo } from 'react'
import { useTaskContext } from '../state/useTaskContext'
import { searchTasks } from '../lib/utils/task'

export function useTaskSearch() {
  const ctx = useTaskContext()
  const results = useMemo(
    () => searchTasks(ctx.state.tasks, ctx.state.query),
    [ctx.state.tasks, ctx.state.query],
  )
  return {
    query: ctx.state.query,
    setQuery: ctx.setQuery,
    results,
  }
}
