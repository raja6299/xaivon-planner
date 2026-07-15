const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function nowISO(): string {
  return new Date().toISOString()
}

export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayDateString(): string {
  return toDateString(new Date())
}

export function parseDateString(value: string): Date {
  const parts = value.split('-').map(Number)
  const y = parts[0] ?? 0
  const m = (parts[1] ?? 1) - 1
  const d = parts[2] ?? 1
  return new Date(y, m, d)
}

export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false
  const date = parseDateString(value)
  return !Number.isNaN(date.getTime()) && toDateString(date) === value
}

export function isValidTimeString(value: string): boolean {
  return TIME_RE.test(value)
}

export function getWeekday(value: string | Date): number {
  const date = typeof value === 'string' ? parseDateString(value) : value
  return date.getDay()
}

export function formatDateHuman(value: string): string {
  const date = parseDateString(value)
  if (Number.isNaN(date.getTime())) return value
  return `${MONTHS[date.getMonth()] ?? ''} ${date.getDate()}`
}

export function isSameDate(a: string, b: string): boolean {
  return a === b
}

export function isBeforeDate(a: string, b: string): boolean {
  return a < b
}

export function compareTime(a: string | null, b: string | null): number {
  if (a === b) return 0
  if (a === null) return 1
  if (b === null) return -1
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
