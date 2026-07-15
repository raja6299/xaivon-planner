import type { Priority, RepeatType, Task } from '../../types/task'
import { taskRepository } from './repository'
import { generateId } from '../utils/id'
import { nowISO } from '../utils/date'
import { isPriority } from '../utils/priority'

const EXPORT_VERSION = 1
const APP_ID = 'daily-task-reminder'
const REPEAT_TYPES: RepeatType[] = ['none', 'daily', 'weekly', 'monthly', 'custom']

export type BackupFile = {
  app: string
  version: number
  exportedAt: string
  tasks: Task[]
}

export async function buildBackup(): Promise<BackupFile> {
  const tasks = await taskRepository.getAllTasks()
  return { app: APP_ID, version: EXPORT_VERSION, exportedAt: nowISO(), tasks }
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asPriority(value: unknown): Priority {
  return isPriority(value) ? value : 'medium'
}

function asRepeatType(value: unknown): RepeatType {
  return REPEAT_TYPES.includes(value as RepeatType) ? (value as RepeatType) : 'none'
}

/** Coerce an untrusted record into a valid Task, or throw if unusable. */
function normalizeTask(raw: unknown, index: number): Task {
  const t = (raw ?? {}) as Record<string, unknown>
  const title = asString(t.title).trim()
  if (!title) {
    throw new Error(`Invalid backup: task #${index + 1} is missing a title.`)
  }
  const now = nowISO()
  return {
    id: typeof t.id === 'string' && t.id ? t.id : generateId(),
    title,
    notes: asString(t.notes),
    completed: typeof t.completed === 'boolean' ? t.completed : false,
    priority: asPriority(t.priority),
    category: asString(t.category),
    reminderTime: typeof t.reminderTime === 'string' ? t.reminderTime : null,
    createdAt: asString(t.createdAt, now),
    updatedAt: asString(t.updatedAt, now),
    completedAt: typeof t.completedAt === 'string' ? t.completedAt : null,
    repeatType: asRepeatType(t.repeatType),
    repeatDays: Array.isArray(t.repeatDays)
      ? t.repeatDays.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6)
      : [],
    dueDate: typeof t.dueDate === 'string' ? t.dueDate : null,
    order: typeof t.order === 'number' ? t.order : index,
  }
}

/** Parse and validate a backup JSON string into a list of tasks. */
export function parseBackup(json: string): Task[] {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new Error('Invalid backup file: not valid JSON.')
  }
  const tasks = (data as Partial<BackupFile>)?.tasks
  if (!Array.isArray(tasks)) {
    throw new Error('Invalid backup file: missing a "tasks" array.')
  }
  return tasks.map((task, index) => normalizeTask(task, index))
}

/** Persist imported tasks (upsert by id). */
export async function importTasks(tasks: Task[]): Promise<void> {
  await taskRepository.bulkUpdate(tasks)
}
