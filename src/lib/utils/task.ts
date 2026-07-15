import type { Task, TaskFilters, TaskSort } from '../../types/task'
import { priorityWeight } from './priority'
import { compareTime, todayDateString } from './date'
import { isTaskActiveOnDate } from './repeat'

export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const dir = sort.direction === 'asc' ? 1 : -1
  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0
    switch (sort.field) {
      case 'priority':
        cmp = priorityWeight(a.priority) - priorityWeight(b.priority)
        break
      case 'createdAt':
        cmp = a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
        break
      case 'reminderTime':
        cmp = compareTime(a.reminderTime, b.reminderTime)
        break
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'manual':
        cmp = a.order - b.order
        break
    }
    if (cmp === 0) {
      cmp = a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
    }
    return cmp * dir
  })
  return sorted
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const today = todayDateString()
  return tasks.filter((task) => {
    if (filters.status !== 'all') {
      if (filters.status === 'completed' && !task.completed) return false
      if (filters.status === 'pending' && task.completed) return false
      if (filters.status === 'overdue') {
        if (task.completed) return false
        if (!task.dueDate || !isBeforeDate(task.dueDate, today)) return false
      }
      if (filters.status === 'today') {
        if (!isTaskActiveOnDate(task, today)) return false
      }
    }
    if (filters.category !== null && task.category !== filters.category) return false
    if (filters.priority !== null && task.priority !== filters.priority) return false
    return true
  })
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase()
  if (!q) return tasks
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(q) ||
      task.notes.toLowerCase().includes(q) ||
      task.category.toLowerCase().includes(q),
  )
}

export function selectVisibleTasks(
  tasks: Task[],
  filters: TaskFilters,
  sort: TaskSort,
  query: string,
): Task[] {
  return sortTasks(searchTasks(filterTasks(tasks, filters), query), sort)
}

function isBeforeDate(a: string, b: string): boolean {
  return a < b
}
