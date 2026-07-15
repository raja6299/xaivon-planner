import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ThemeContext,
  type ResolvedTheme,
  type ThemePreference,
} from './themeContext'
import { readStorage, writeStorage } from '../lib/utils/storage'

const STORAGE_KEY = 'dtr:theme'
const META_COLOR: Record<ResolvedTheme, string> = {
  dark: '#0f1115',
  light: '#ffffff',
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function readPreference(): ThemePreference {
  const raw = readStorage(STORAGE_KEY)
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system'
}

function resolve(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return preference
}

function applyTheme(resolved: ResolvedTheme): void {
  const el = document.documentElement
  el.classList.remove('dark', 'light')
  el.classList.add(resolved)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', META_COLOR[resolved])
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(readPreference)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolve(readPreference()))

  // Apply and persist whenever the preference changes.
  useEffect(() => {
    const resolved = resolve(preference)
    setResolvedTheme(resolved)
    applyTheme(resolved)
    writeStorage(STORAGE_KEY, preference)
  }, [preference])

  // Follow the OS theme only while in "system" mode.
  useEffect(() => {
    if (preference !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const resolved: ResolvedTheme = mq.matches ? 'dark' : 'light'
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  const setTheme = useCallback((next: ThemePreference) => setPreference(next), [])

  const value = useMemo(
    () => ({ theme: preference, resolvedTheme, setTheme }),
    [preference, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
