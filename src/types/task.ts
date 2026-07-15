export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high', 'urgent']

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'

export type Task = {
  id: string
  title: string
  notes: string
  completed: boolean
  priority: Priority
  category: string
  reminderTime: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  repeatType: RepeatType
  repeatDays: number[]
  dueDate: string | null
  order: number
}

export type TaskDraft = {
  title: string
  notes?: string
  priority?: Priority
  category?: string
  reminderTime?: string | null
  repeatType?: RepeatType
  repeatDays?: number[]
  dueDate?: string | null
}

export type CreateTaskInput = TaskDraft

export type UpdateTaskInput = Partial<TaskDraft>

export type SortField = 'priority' | 'createdAt' | 'reminderTime' | 'title' | 'manual'
export type SortDirection = 'asc' | 'desc'

export type TaskSort = {
  field: SortField
  direction: SortDirection
}

export type TaskFilterStatus = 'all' | 'completed' | 'pending' | 'overdue' | 'today'

export type TaskFilters = {
  status: TaskFilterStatus
  category: string | null
  priority: Priority | null
}
