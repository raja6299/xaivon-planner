import { describe, it, expect } from 'vitest'
import {
  compareTime,
  formatDateHuman,
  getWeekday,
  isBeforeDate,
  isValidDateString,
  isValidTimeString,
  parseDateString,
  toDateString,
  todayDateString,
} from './date'

describe('date utils', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 6, 14))).toBe('2026-07-14')
  })

  it('parses a date string', () => {
    expect(parseDateString('2026-07-14').getDate()).toBe(14)
  })

  it('validates date strings', () => {
    expect(isValidDateString('2026-07-14')).toBe(true)
    expect(isValidDateString('2026-13-01')).toBe(false)
    expect(isValidDateString('not-a-date')).toBe(false)
  })

  it('validates time strings (HH:mm)', () => {
    expect(isValidTimeString('09:30')).toBe(true)
    expect(isValidTimeString('25:00')).toBe(false)
    expect(isValidTimeString('9:30')).toBe(false)
  })

  it('compares times with nulls sorted last', () => {
    expect(compareTime('09:00', '10:00')).toBe(-1)
    expect(compareTime('10:00', '09:00')).toBe(1)
    expect(compareTime(null, '10:00')).toBe(1)
    expect(compareTime('10:00', null)).toBe(-1)
    expect(compareTime(null, null)).toBe(0)
  })

  it('formats human-readable dates', () => {
    expect(formatDateHuman('2026-07-14')).toBe('Jul 14')
  })

  it('detects before dates', () => {
    expect(isBeforeDate('2026-07-13', '2026-07-14')).toBe(true)
    expect(isBeforeDate('2026-07-14', '2026-07-14')).toBe(false)
  })

  it('gets the weekday (0=Sun)', () => {
    // 2026-07-14 is a Tuesday (2)
    expect(getWeekday('2026-07-14')).toBe(2)
  })

  it('todayDateString returns a valid date string', () => {
    expect(isValidDateString(todayDateString())).toBe(true)
  })
})
