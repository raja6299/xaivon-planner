import type { CreateTaskInput, Task, TaskDraft } from '../../types/task'
import { generateId } from '../utils/id'
import { nowISO } from '../utils/date'
import { validateTaskDraft, ValidationError } from '../utils/validation'

export function taskToDraft(task: Task): TaskDraft {
  return {
    title: task.title,
    notes: task.notes,
    priority: task.priority,
    category: task.category,
    reminderTime: task.reminderTime,
    repeatType: task.repeatType,
    repeatDays: task.repeatDays,
    dueDate: task.dueDate,
  }
}

/**
 * Build a fully-formed Task entity from user input.
 * IDs are generated with crypto.randomUUID, which guarantees uniqueness,
 * so duplicate IDs cannot be created.
 */
export function buildTask(input: CreateTaskInput, id: string = generateId()): Task {
  const result = validateTaskDraft(input)
  if (!result.valid) {
    throw new ValidationError(result.errors)
  }
  const now = nowISO()
  return {
    id,
    title: result.value.title,
    notes: result.value.notes,
    completed: false,
    priority: result.value.priority,
    category: result.value.category,
    reminderTime: result.value.reminderTime,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    repeatType: result.value.repeatType,
    repeatDays: result.value.repeatDays,
    dueDate: result.value.dueDate,
    // Monotonically increasing default so new tasks append to the end of
    // the manual order. Reordering rewrites these to a 0..n-1 sequence.
    order: Date.now(),
  }
}
