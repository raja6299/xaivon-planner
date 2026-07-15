/**
 * Safe localStorage helpers for small UI preferences ONLY.
 * Task data lives in IndexedDB — never store tasks here.
 * All access is wrapped so a disabled/full localStorage never throws.
 */

export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore: private mode / quota / disabled storage.
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  const raw = readStorage(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  writeStorage(key, JSON.stringify(value))
}
