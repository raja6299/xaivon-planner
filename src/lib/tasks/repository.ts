import type { CreateTaskInput, Task, UpdateTaskInput } from '../../types/task'
import { getDB, promisifyRequest, txComplete } from '../db/connection'
import { STORE_TASKS } from '../db/schema'
import { buildTask, taskToDraft } from './factory'
import { validateTaskDraft, ValidationError } from '../utils/validation'
import { nowISO, todayDateString } from '../utils/date'
import { isTaskActiveOnDate } from '../utils/repeat'
import { searchTasks as searchTasksUtil } from '../utils/task'

async function putTask(task: Task): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_TASKS, 'readwrite')
  tx.objectStore(STORE_TASKS).put(task)
  await txComplete(tx)
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const task = buildTask(input)
  await putTask(task)
  return task
}

export async function getTask(id: string): Promise<Task | null> {
  const db = await getDB()
  const tx = db.transaction(STORE_TASKS, 'readonly')
  const request = tx.objectStore(STORE_TASKS).get(id)
  const result = await promisifyRequest(request)
  return result ?? null
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB()
  const tx = db.transaction(STORE_TASKS, 'readonly')
  const request = tx.objectStore(STORE_TASKS).getAll()
  const result = await promisifyRequest(request)
  return result ?? []
}

export async function updateTask(id: string, patch: UpdateTaskInput): Promise<Task> {
  const existing = await getTask(id)
  if (!existing) throw new Error(`Task "${id}" was not found.`)

  const merged = { ...taskToDraft(existing), ...patch }
  const result = validateTaskDraft(merged)
  if (!result.valid) throw new ValidationError(result.errors)

  const updated: Task = {
    ...existing,
    ...result.value,
    id,
    completed: existing.completed,
    completedAt: existing.completedAt,
    createdAt: existing.createdAt,
    updatedAt: nowISO(),
  }
  await putTask(updated)
  return updated
}

export async function toggleTask(id: string): Promise<Task> {
  const existing = await getTask(id)
  if (!existing) throw new Error(`Task "${id}" was not found.`)

  const completed = !existing.completed
  const updated: Task = {
    ...existing,
    completed,
    completedAt: completed ? nowISO() : null,
    updatedAt: nowISO(),
  }
  await putTask(updated)
  return updated
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_TASKS, 'readwrite')
  tx.objectStore(STORE_TASKS).delete(id)
  await txComplete(tx)
}

export async function clearCompleted(): Promise<number> {
  const all = await getAllTasks()
  const completed = all.filter((task) => task.completed)
  if (completed.length === 0) return 0

  const db = await getDB()
  const tx = db.transaction(STORE_TASKS, 'readwrite')
  const store = tx.objectStore(STORE_TASKS)
  for (const task of completed) {
    store.delete(task.id)
  }
  await txComplete(tx)
  return completed.length
}

export async function bulkUpdate(tasks: Task[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_TASKS, 'readwrite')
  const store = tx.objectStore(STORE_TASKS)
  for (const task of tasks) {
    store.put(task)
  }
  await txComplete(tx)
}

export async function reorderTasks(orderedIds: string[]): Promise<Task[]> {
  const all = await getAllTasks()
  const byId = new Map(all.map((task) => [task.id, task]))
  const now = nowISO()
  const updated: Task[] = []
  orderedIds.forEach((id, index) => {
    const task = byId.get(id)
    if (task) updated.push({ ...task, order: index, updatedAt: now })
  })
  await bulkUpdate(updated)
  return updated
}

export async function getTodayTasks(): Promise<Task[]> {
  const all = await getAllTasks()
  const today = todayDateString()
  return all.filter((task) => isTaskActiveOnDate(task, today))
}

export async function searchTasks(query: string): Promise<Task[]> {
  const all = await getAllTasks()
  return searchTasksUtil(all, query)
}

export const taskRepository = {
  createTask,
  getTask,
  getAllTasks,
  updateTask,
  toggleTask,
  deleteTask,
  clearCompleted,
  bulkUpdate,
  reorderTasks,
  getTodayTasks,
  searchTasks,
}
