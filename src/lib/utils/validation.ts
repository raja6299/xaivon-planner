import type { Priority, RepeatType, TaskDraft } from '../../types/task'
import { isValidDateString, isValidTimeString } from './date'
import { isPriority } from './priority'

export class ValidationError extends Error {
  errors: Record<string, string>
  constructor(errors: Record<string, string>) {
    super(Object.values(errors)[0] ?? 'Validation failed.')
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export type ResolvedTaskDraft = {
  title: string
  notes: string
  priority: Priority
  category: string
  reminderTime: string | null
  dueDate: string | null
  repeatType: RepeatType
  repeatDays: number[]
}

export type ValidationResult = {
  valid: boolean
  errors: Record<string, string>
  value: ResolvedTaskDraft
}

export function validateTaskDraft(input: TaskDraft): ValidationResult {
  const errors: Record<string, string> = {}

  const title = (input.title ?? '').toString().trim()
  if (!title) {
    errors.title = 'Title is required.'
  }

  const priority = isPriority(input.priority) ? input.priority : 'medium'
  const category = (input.category ?? '').toString().trim()
  const notes = (input.notes ?? '').toString()

  let reminderTime: string | null = null
  if (input.reminderTime != null && input.reminderTime !== '') {
    if (!isValidTimeString(input.reminderTime)) {
      errors.reminderTime = 'Reminder time must use HH:mm (24-hour) format.'
    } else {
      reminderTime = input.reminderTime
    }
  }

  let dueDate: string | null = null
  if (input.dueDate != null && input.dueDate !== '') {
    if (!isValidDateString(input.dueDate)) {
      errors.dueDate = 'Due date must use YYYY-MM-DD format.'
    } else {
      dueDate = input.dueDate
    }
  }

  const repeatType = input.repeatType ?? 'none'
  const repeatDays = Array.isArray(input.repeatDays)
    ? input.repeatDays.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6)
    : []

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: { title, notes, priority, category, reminderTime, dueDate, repeatType, repeatDays },
  }
}
