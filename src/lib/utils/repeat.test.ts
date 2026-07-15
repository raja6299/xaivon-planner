import { describe, it, expect } from 'vitest'
import { isTaskActiveOnDate, nextOccurrence } from './repeat'
import type { Task } from '../../types/task'

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: '1',
    title: 't',
    notes: '',
    completed: false,
    priority: 'medium',
    category: '',
    reminderTime: null,
    createdAt: '',
    updatedAt: '',
    completedAt: null,
    repeatType: 'none',
    repeatDays: [],
    dueDate: null,
    order: 0,
    ...overrides,
  }
}

describe('repeat helpers', () => {
  it('daily is always active', () => {
    const task = makeTask({ repeatType: 'daily' })
    expect(isTaskActiveOnDate(task, '2026-07-14')).toBe(true)
  })

  it('weekly matches the configured weekday', () => {
    // 2026-07-14 is a Tuesday (2)
    const task = makeTask({ repeatType: 'weekly', repeatDays: [2] })
    expect(isTaskActiveOnDate(task, '2026-07-14')).toBe(true)
    expect(isTaskActiveOnDate(task, '2026-07-15')).toBe(false)
  })

  it('monthly matches the day of month', () => {
    const task = makeTask({ repeatType: 'monthly', dueDate: '2026-07-14' })
    expect(isTaskActiveOnDate(task, '2026-08-14')).toBe(true)
    expect(isTaskActiveOnDate(task, '2026-08-15')).toBe(false)
  })

  it('none matches only the due date', () => {
    const task = makeTask({ dueDate: '2026-07-14' })
    expect(isTaskActiveOnDate(task, '2026-07-14')).toBe(true)
    expect(isTaskActiveOnDate(task, '2026-07-15')).toBe(false)
  })

  it('nextOccurrence returns the due date for non-repeating tasks', () => {
    const task = makeTask({ dueDate: '2026-07-20' })
    expect(nextOccurrence(task, new Date(2026, 6, 14))).toBe('2026-07-20')
  })

  it('nextOccurrence finds the next daily occurrence', () => {
    const task = makeTask({ repeatType: 'daily' })
    expect(nextOccurrence(task, new Date(2026, 6, 14))).toBe('2026-07-14')
  })
})
