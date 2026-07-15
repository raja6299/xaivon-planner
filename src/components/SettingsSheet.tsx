import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useTasks } from '../hooks/useTasks'
import { buildBackup, importTasks, parseBackup } from '../lib/tasks/backup'
import { todayDateString } from '../lib/utils/date'
import { PRIORITIES, type Priority, type SortDirection, type SortField } from '../types/task'
import type { ThemePreference } from '../context/themeContext'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'priority:asc', label: 'Priority ↑' },
  { value: 'priority:desc', label: 'Priority ↓' },
  { value: 'createdAt:desc', label: 'Newest' },
  { value: 'createdAt:asc', label: 'Oldest' },
  { value: 'reminderTime:asc', label: 'Reminder' },
  { value: 'title:asc', label: 'Title A–Z' },
  { value: 'manual:asc', label: 'Manual (drag)' },
]

type SettingsSheetProps = {
  isOpen: boolean
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h3>
      {children}
    </section>
  )
}

const controlClass =
  'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary'

export default function SettingsSheet({ isOpen, onClose }: SettingsSheetProps) {
  const { theme, setTheme } = useTheme()
  const { preferences, setDefaultSort, setDefaultPriority, setDefaultReminderTime } =
    usePreferences()
  const { canInstall, installed, install } = useInstallPrompt()
  const { counts, reloadTasks } = useTasks()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [storageUsage, setStorageUsage] = useState<string>('—')

  useEffect(() => {
    if (!isOpen) return
    setMessage(null)
    if (navigator.storage?.estimate) {
      navigator.storage
        .estimate()
        .then((est) => {
          const used = est.usage ?? 0
          setStorageUsage(`${(used / 1024).toFixed(0)} KB used`)
        })
        .catch(() => setStorageUsage('unavailable'))
    } else {
      setStorageUsage('unavailable')
    }
  }, [isOpen])

  const handleExport = async () => {
    try {
      const backup = await buildBackup()
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `daily-tasks-${todayDateString()}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMessage(`Exported ${backup.tasks.length} task(s).`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Export failed.')
    }
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const tasks = parseBackup(text)
      await importTasks(tasks)
      await reloadTasks()
      setMessage(`Imported ${tasks.length} task(s).`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Import failed.')
    }
  }

  const sortValue = `${preferences.defaultSort.field}:${preferences.defaultSort.direction}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="space-y-6">
        <Section title="Appearance">
          <label className="flex items-center justify-between gap-3 text-sm text-text-secondary">
            Theme
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemePreference)}
              className={controlClass}
              aria-label="Theme"
            >
              {THEME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </Section>

        <Section title="Task Preferences">
          <label className="flex items-center justify-between gap-3 text-sm text-text-secondary">
            Default sorting
            <select
              value={sortValue}
              onChange={(e) => {
                const [field, direction] = e.target.value.split(':')
                setDefaultSort({
                  field: field as SortField,
                  direction: direction as SortDirection,
                })
              }}
              className={controlClass}
              aria-label="Default sorting"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between gap-3 text-sm text-text-secondary">
            Default priority
            <select
              value={preferences.defaultPriority}
              onChange={(e) => setDefaultPriority(e.target.value as Priority)}
              className={controlClass}
              aria-label="Default priority"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between gap-3 text-sm text-text-secondary">
            Default reminder
            <input
              type="time"
              value={preferences.defaultReminderTime}
              onChange={(e) => setDefaultReminderTime(e.target.value)}
              className={controlClass}
              aria-label="Default reminder time"
            />
          </label>
        </Section>

        <Section title="Data">
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={handleExport}>
              Export tasks
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Import tasks
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
          {message && (
            <p role="status" className="text-sm text-text-secondary">
              {message}
            </p>
          )}
        </Section>

        {!installed && canInstall && (
          <Section title="Install">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-text-secondary">Install this app on your device.</p>
              <Button type="button" size="sm" onClick={() => void install()}>
                Install App
              </Button>
            </div>
          </Section>
        )}

        <Section title="About">
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">App version</dt>
              <dd className="text-text-primary">{__APP_VERSION__}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Build</dt>
              <dd className="text-text-primary">{new Date(__BUILD_TIME__).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Tasks stored</dt>
              <dd className="text-text-primary">{counts.total}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Storage</dt>
              <dd className="text-text-primary">{storageUsage}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Installed</dt>
              <dd className="text-text-primary">{installed ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </Section>
      </div>
    </Modal>
  )
}
