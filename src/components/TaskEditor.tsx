import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { useTask } from '../hooks/useTask'
import { validateTaskDraft } from '../lib/utils/validation'
import { PRIORITIES, type Priority, type RepeatType, type Task } from '../types/task'

const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom (weekdays)' },
]

type EditorForm = {
  title: string
  notes: string
  priority: Priority
  category: string
  dueDate: string
  reminderTime: string
  repeatType: RepeatType
}

function toForm(task: Task | null): EditorForm {
  return {
    title: task?.title ?? '',
    notes: task?.notes ?? '',
    priority: task?.priority ?? 'medium',
    category: task?.category ?? '',
    dueDate: task?.dueDate ?? '',
    reminderTime: task?.reminderTime ?? '',
    repeatType: task?.repeatType ?? 'none',
  }
}

type TaskEditorProps = {
  task: Task | null
  categories: string[]
  onClose: () => void
}

/**
 * Edit an existing task in a modal. Validation reuses the shared
 * `validateTaskDraft`. Ctrl/Cmd+Enter saves, Escape cancels (via Modal).
 * `repeatDays` is preserved from the original task since it isn't edited here.
 */
export default function TaskEditor({ task, categories, onClose }: TaskEditorProps) {
  const { update } = useTask(task?.id ?? '')
  const [form, setForm] = useState<EditorForm>(() => toForm(task))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const fieldId = useId()

  useEffect(() => {
    setForm(toForm(task))
    setErrors({})
  }, [task])

  const save = async () => {
    if (!task || submitting) return
    const draft = {
      title: form.title,
      notes: form.notes,
      priority: form.priority,
      category: form.category,
      dueDate: form.dueDate || null,
      reminderTime: form.reminderTime || null,
      repeatType: form.repeatType,
      repeatDays: task.repeatDays,
    }
    const result = validateTaskDraft(draft)
    if (!result.valid) {
      setErrors(result.errors)
      return
    }
    setSubmitting(true)
    try {
      await update(result.value)
      onClose()
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Could not save task.' })
    } finally {
      setSubmitting(false)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      void save()
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary'

  return (
    <Modal isOpen={task !== null} onClose={onClose} title="Edit task" size="md">
      <form
        className="space-y-3"
        aria-label="Edit task"
        onKeyDown={onKeyDown}
        onSubmit={(e) => {
          e.preventDefault()
          void save()
        }}
      >
        <label htmlFor={`${fieldId}-title`} className="block text-sm text-text-secondary">
          Title
          <input
            id={`${fieldId}-title`}
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={inputClass}
            aria-invalid={errors.title ? true : undefined}
            required
          />
          {errors.title && (
            <span className="mt-1 block text-xs text-accent">{errors.title}</span>
          )}
        </label>

        <label htmlFor={`${fieldId}-notes`} className="block text-sm text-text-secondary">
          Description
          <textarea
            id={`${fieldId}-notes`}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className={`${inputClass} min-h-[80px] resize-y`}
            placeholder="Optional details…"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label htmlFor={`${fieldId}-priority`} className="block text-sm text-text-secondary">
            Priority
            <select
              id={`${fieldId}-priority`}
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
              className={inputClass}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor={`${fieldId}-category`} className="block text-sm text-text-secondary">
            Category
            <input
              id={`${fieldId}-category`}
              type="text"
              list={`${fieldId}-categories`}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className={inputClass}
              placeholder="work"
            />
            <datalist id={`${fieldId}-categories`}>
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>

          <label htmlFor={`${fieldId}-duedate`} className="block text-sm text-text-secondary">
            Due date
            <input
              id={`${fieldId}-duedate`}
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className={inputClass}
            />
            {errors.dueDate && (
              <span className="mt-1 block text-xs text-accent">{errors.dueDate}</span>
            )}
          </label>

          <label htmlFor={`${fieldId}-reminder`} className="block text-sm text-text-secondary">
            Reminder
            <input
              id={`${fieldId}-reminder`}
              type="time"
              value={form.reminderTime}
              onChange={(e) => setForm((f) => ({ ...f, reminderTime: e.target.value }))}
              className={inputClass}
            />
            {errors.reminderTime && (
              <span className="mt-1 block text-xs text-accent">{errors.reminderTime}</span>
            )}
          </label>

          <label htmlFor={`${fieldId}-repeat`} className="col-span-2 block text-sm text-text-secondary">
            Repeat
            <select
              id={`${fieldId}-repeat`}
              value={form.repeatType}
              onChange={(e) => setForm((f) => ({ ...f, repeatType: e.target.value as RepeatType }))}
              className={inputClass}
            >
              {REPEAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {errors.form && (
          <p role="alert" className="text-sm text-accent">
            {errors.form}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save
          </Button>
        </div>
        <p className="text-right text-xs text-text-muted">Tip: press Ctrl/⌘ + Enter to save</p>
      </form>
    </Modal>
  )
}
