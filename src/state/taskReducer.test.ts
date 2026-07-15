import { describe, it, expect } from 'vitest'
import { initialTaskState, taskReducer, type TaskState } from './taskReducer'
import type { Task } from '../types/task'

function task(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: id,
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

describe('taskReducer', () => {
  it('loads tasks into the ready state', () => {
    const state = taskReducer(initialTaskState, { type: 'LOAD_SUCCESS', tasks: [task('1')] })
    expect(state.status).toBe('ready')
    expect(state.tasks.length).toBe(1)
  })

  it('upserts: inserts then updates in place', () => {
    let state: TaskState = taskReducer(initialTaskState, {
      type: 'UPSERT_TASK',
      task: task('1', { title: 'a' }),
    })
    expect(state.tasks.length).toBe(1)
    state = taskReducer(state, { type: 'UPSERT_TASK', task: task('1', { title: 'b' }) })
    expect(state.tasks[0]?.title).toBe('b')
  })

  it('removes a task by id', () => {
    const state = taskReducer(
      { ...initialTaskState, tasks: [task('1'), task('2')] },
      { type: 'REMOVE_TASK', id: '1' },
    )
    expect(state.tasks.length).toBe(1)
    expect(state.tasks[0]?.id).toBe('2')
  })

  it('sets query, filters, sort and error', () => {
    let state = taskReducer(initialTaskState, { type: 'SET_QUERY', query: 'x' })
    expect(state.query).toBe('x')
    state = taskReducer(state, { type: 'SET_FILTERS', filters: { status: 'completed' } })
    expect(state.filters.status).toBe('completed')
    state = taskReducer(state, { type: 'SET_SORT', sort: { field: 'title', direction: 'desc' } })
    expect(state.sort.direction).toBe('desc')
    state = taskReducer(state, { type: 'SET_ERROR', error: 'boom' })
    expect(state.error).toBe('boom')
  })
})
