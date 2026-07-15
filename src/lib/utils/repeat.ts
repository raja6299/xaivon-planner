import type { Task } from '../../types/task'
import { getWeekday, parseDateString, toDateString } from './date'

export function isTaskActiveOnDate(task: Task, dateStr: string): boolean {
  switch (task.repeatType) {
    case 'daily':
      return true
    case 'weekly':
    case 'custom':
      return task.repeatDays.includes(getWeekday(dateStr))
    case 'monthly':
      if (!task.dueDate) return false
      return parseDateString(task.dueDate).getDate() === parseDateString(dateStr).getDate()
    case 'none':
    default:
      if (!task.dueDate) return false
      return task.dueDate === dateStr
  }
}

export function nextOccurrence(task: Task, from: Date = new Date()): string | null {
  if (task.repeatType === 'none') return task.dueDate
  const start = toDateString(from)
  for (let i = 0; i < 366; i += 1) {
    const candidate = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    if (isTaskActiveOnDate(task, toDateString(candidate))) {
      return i === 0 ? start : toDateString(candidate)
    }
  }
  return null
}
