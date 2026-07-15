import { describe, it, expect, beforeEach } from 'vitest'
import { taskRepository } from './repository'
import { toDateString } from '../utils/date'

beforeEach(async () => {
  const all = await taskRepository.getAllTasks()
  await Promise.all(all.map((t) => taskRepository.deleteTask(t.id)))
})

describe('taskRepository', () => {
  it('creates and retrieves a task', async () => {
    const created = await taskRepository.createTask({ title: 'Write report' })
    expect(created.id).toBeTruthy()
    expect(created.title).toBe('Write report')
    expect(created.completed).toBe(false)
    const fetched = await taskRepository.getTask(created.id)
    expect(fetched?.id).toBe(created.id)
  })

  it('trims whitespace from the title', async () => {
    const created = await taskRepository.createTask({ title: '  Spaced  ' })
    expect(created.title).toBe('Spaced')
  })

  it('rejects an empty title', async () => {
    await expect(taskRepository.createTask({ title: '   ' })).rejects.toThrow()
  })

  it('updates a task while preserving identity', async () => {
    const created = await taskRepository.createTask({ title: 'A' })
    const updated = await taskRepository.updateTask(created.id, { title: 'B', priority: 'high' })
    expect(updated.title).toBe('B')
    expect(updated.priority).toBe('high')
    expect(updated.id).toBe(created.id)
  })

  it('toggles completion and stamps completedAt', async () => {
    const created = await taskRepository.createTask({ title: 'T' })
    const toggled = await taskRepository.toggleTask(created.id)
    expect(toggled.completed).toBe(true)
    expect(toggled.completedAt).not.toBeNull()
    const back = await taskRepository.toggleTask(created.id)
    expect(back.completed).toBe(false)
    expect(back.completedAt).toBeNull()
  })

  it('deletes a task', async () => {
    const created = await taskRepository.createTask({ title: 'D' })
    await taskRepository.deleteTask(created.id)
    expect(await taskRepository.getTask(created.id)).toBeNull()
  })

  it('returns all tasks', async () => {
    await taskRepository.createTask({ title: '1' })
    await taskRepository.createTask({ title: '2' })
    expect((await taskRepository.getAllTasks()).length).toBe(2)
  })

  it('clears completed tasks and reports the count', async () => {
    const a = await taskRepository.createTask({ title: 'a' })
    await taskRepository.createTask({ title: 'b' })
    await taskRepository.toggleTask(a.id)
    const cleared = await taskRepository.clearCompleted()
    expect(cleared).toBe(1)
    const remaining = await taskRepository.getAllTasks()
    expect(remaining.length).toBe(1)
    expect(remaining[0]?.title).toBe('b')
  })

  it('searches tasks case-insensitively', async () => {
    await taskRepository.createTask({ title: 'Grocery shopping', notes: 'milk' })
    await taskRepository.createTask({ title: 'Workout' })
    const res = await taskRepository.searchTasks('grocery')
    expect(res.length).toBe(1)
    expect(res[0]?.title).toBe('Grocery shopping')
  })

  it('bulk updates tasks in a single transaction', async () => {
    const a = await taskRepository.createTask({ title: 'a' })
    const b = await taskRepository.createTask({ title: 'b' })
    await taskRepository.bulkUpdate([
      { ...a, completed: true, completedAt: new Date().toISOString() },
      { ...b, priority: 'urgent' },
    ])
    const all = await taskRepository.getAllTasks()
    expect(all.find((t) => t.id === a.id)?.completed).toBe(true)
    expect(all.find((t) => t.id === b.id)?.priority).toBe('urgent')
  })

  it('returns today tasks based on due date and repeat', async () => {
    const today = toDateString(new Date())
    await taskRepository.createTask({ title: 'due today', dueDate: today })
    await taskRepository.createTask({ title: 'daily', repeatType: 'daily' })
    await taskRepository.createTask({ title: 'none no date' })
    const titles = (await taskRepository.getTodayTasks()).map((t) => t.title).sort()
    expect(titles).toEqual(['daily', 'due today'])
  })
})
