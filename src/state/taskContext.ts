import { createContext } from 'react'
import type { TaskState } from './taskReducer'
import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  TaskSort,
  UpdateTaskInput,
} from '../types/task'

export type TaskContextValue = {
  state: TaskState
  createTask: (input: CreateTaskInput) => Promise<Task>
  updateTask: (id: string, patch: UpdateTaskInput) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<Task>
  clearCompleted: () => Promise<void>
  reorderTasks: (orderedVisibleIds: string[]) => Promise<void>
  reloadTasks: () => Promise<void>
  setQuery: (query: string) => void
  setFilters: (filters: Partial<TaskFilters>) => void
  setSort: (sort: TaskSort) => void
}

export const TaskContext = createContext<TaskContextValue | null>(null)
