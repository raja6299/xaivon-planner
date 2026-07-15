import { describe, it, expect } from 'vitest'
import { filterTasks, searchTasks, selectVisibleTasks, sortTasks } from './task'
import type { Task, TaskFilters, TaskSort } from '../../types/task'

function make(overrides: Partial<Task>): Task {
  return {
    id: Math.random().toString(),
    title: 't',
    notes: '',
    completed: false,
    priority: 'medium',
    category: '',
    reminderTime: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '',
    completedAt: null,
    repeatType: 'none',
    repeatDays: [],
    dueDate: null,
    order: 0,
    ...overrides,
  }
}

const baseFilters: TaskFilters = { status: 'all', category: null, priority: null }
const baseSort: TaskSort = { field: 'priority', direction: 'asc' }

describe('task utils', () => {
  it('sorts by priority weight', () => {
    const tasks = [make({ priority: 'low' }), make({ priority: 'urgent' }), make({ priority: 'high' })]
    const sorted = sortTasks(tasks, baseSort)
    expect(sorted.map((t) => t.priority)).toEqual(['urgent', 'high', 'low'])
  })

  it('sorts by title alphabetically', () => {
    const tasks = [make({ title: 'Banana' }), make({ title: 'Apple' })]
    const sorted = sortTasks(tasks, { field: 'title', direction: 'asc' })
    expect(sorted[0]?.title).toBe('Apple')
  })

  it('sorts reminder time with nulls last', () => {
    const tasks = [
      make({ reminderTime: '10:00' }),
      make({ reminderTime: null }),
      make({ reminderTime: '08:00' }),
    ]
    const sorted = sortTasks(tasks, { field: 'reminderTime', direction: 'asc' })
    expect(sorted[0]?.reminderTime).toBe('08:00')
    expect(sorted[2]?.reminderTime).toBeNull()
  })

  it('filters completed and pending', () => {
    const tasks = [make({ completed: true }), make({ completed: false })]
    expect(filterTasks(tasks, { ...baseFilters, status: 'completed' }).length).toBe(1)
    expect(filterTasks(tasks, { ...baseFilters, status: 'pending' }).length).toBe(1)
  })

  it('filters overdue (excludes completed and future)', () => {
    const tasks = [
      make({ dueDate: '2026-01-01', completed: false }),
      make({ dueDate: '2999-01-01', completed: false }),
      make({ dueDate: '2026-01-01', completed: true }),
    ]
    const result = filterTasks(tasks, { ...baseFilters, status: 'overdue' })
    expect(result.length).toBe(1)
    expect(result[0]?.dueDate).toBe('2026-01-01')
  })

  it('filters by category and priority', () => {
    const tasks = [make({ category: 'work', priority: 'high' }), make({ category: 'home' })]
    expect(filterTasks(tasks, { ...baseFilters, category: 'work' }).length).toBe(1)
    expect(filterTasks(tasks, { ...baseFilters, priority: 'high' }).length).toBe(1)
  })

  it('searches case-insensitively across title, notes and category', () => {
    const tasks = [make({ title: 'Grocery', notes: 'milk', category: 'home' }), make({ title: 'Gym' })]
    expect(searchTasks(tasks, 'MILK').length).toBe(1)
    expect(searchTasks(tasks, 'gym').length).toBe(1)
    expect(searchTasks(tasks, '').length).toBe(2)
  })

  it('selectVisibleTasks composes filter, sort and search', () => {
    const tasks = [
      make({ title: 'A', priority: 'low', completed: false }),
      make({ title: 'B', priority: 'urgent', completed: true }),
    ]
    const result = selectVisibleTasks(tasks, { ...baseFilters, status: 'pending' }, baseSort, '')
    expect(result.length).toBe(1)
    expect(result[0]?.title).toBe('A')
  })
})
