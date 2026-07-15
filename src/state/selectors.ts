import type { TaskState } from './taskReducer'
import { selectVisibleTasks } from '../lib/utils/task'

export function selectVisibleTasksState(state: TaskState) {
  return selectVisibleTasks(state.tasks, state.filters, state.sort, state.query)
}

export function selectCategories(state: TaskState): string[] {
  const set = new Set<string>()
  for (const task of state.tasks) {
    if (task.category) set.add(task.category)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export type TaskCounts = {
  total: number
  completed: number
  pending: number
}

export function selectCounts(state: TaskState): TaskCounts {
  let completed = 0
  for (const task of state.tasks) {
    if (task.completed) completed += 1
  }
  return {
    total: state.tasks.length,
    completed,
    pending: state.tasks.length - completed,
  }
}
