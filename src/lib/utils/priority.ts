import type { Priority } from '../../types/task'
import { PRIORITIES, PRIORITY_WEIGHT } from '../../types/task'

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value)
}

export function priorityWeight(p: Priority): number {
  return PRIORITY_WEIGHT[p]
}
