import { describe, it, expect } from 'vitest'
import { validateTaskDraft, ValidationError } from './validation'

describe('validateTaskDraft', () => {
  it('requires a title', () => {
    const result = validateTaskDraft({ title: '   ' })
    expect(result.valid).toBe(false)
    expect(result.errors.title).toBeDefined()
  })

  it('accepts a valid draft and trims the title', () => {
    const result = validateTaskDraft({ title: '  Hello  ', priority: 'high', category: 'work' })
    expect(result.valid).toBe(true)
    expect(result.value.title).toBe('Hello')
    expect(result.value.priority).toBe('high')
  })

  it('defaults priority to medium and normalizes category', () => {
    const result = validateTaskDraft({ title: 'x' })
    expect(result.value.priority).toBe('medium')
    expect(result.value.category).toBe('')
  })

  it('rejects an invalid time', () => {
    const result = validateTaskDraft({ title: 'x', reminderTime: '99:99' })
    expect(result.valid).toBe(false)
    expect(result.errors.reminderTime).toBeDefined()
  })

  it('rejects an invalid date', () => {
    const result = validateTaskDraft({ title: 'x', dueDate: '2026-13-01' })
    expect(result.valid).toBe(false)
    expect(result.errors.dueDate).toBeDefined()
  })

  it('ValidationError carries its errors', () => {
    const err = new ValidationError({ title: 'required' })
    expect(err.errors.title).toBe('required')
    expect(err.message).toBe('required')
  })
})
