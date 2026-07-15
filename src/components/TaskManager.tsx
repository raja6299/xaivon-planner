import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTasks } from '../hooks/useTasks'
import { useCreateTask } from '../hooks/useCreateTask'
import { useToggleTask } from '../hooks/useToggleTask'
import { useDeleteTask } from '../hooks/useDeleteTask'
import { useReorderTasks } from '../hooks/useReorderTasks'
import { usePreferences } from '../hooks/usePreferences'
import {
  PRIORITIES,
  type Priority,
  type RepeatType,
  type SortDirection,
  type SortField,
  type Task,
  type TaskFilterStatus,
} from '../types/task'
import { formatDateHuman } from '../lib/utils/date'
import { Button } from './ui/Button'
import { Checkbox } from './ui/Checkbox'
import { EmptyState } from './ui/EmptyState'
import { StatsBar } from './ui/StatsBar'
import TaskEditor from './TaskEditor'
import SettingsSheet from './SettingsSheet'

const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom (weekdays)' },
]

const STATUS_OPTIONS: { value: TaskFilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'today', label: 'Today' },
  { value: 'overdue', label: 'Overdue' },
]

type FormState = {
  title: string
  priority: Priority
  category: string
  dueDate: string
  reminderTime: string
  repeatType: RepeatType
}

function makeEmptyForm(priority: Priority, reminderTime: string): FormState {
  return {
    title: '',
    priority,
    category: '',
    dueDate: '',
    reminderTime,
    repeatType: 'none',
  }
}

function metaLine(task: Task): string {
  return [task.category, task.dueDate ? formatDateHuman(task.dueDate) : null, task.reminderTime]
    .filter(Boolean)
    .join(' · ')
}

type TaskRowProps = {
  task: Task
  focused: boolean
  draggable: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  registerRef: (id: string, el: HTMLInputElement | null) => void
}

const TaskRow = memo(function TaskRow({
  task,
  focused,
  draggable,
  onToggle,
  onDelete,
  onEdit,
  registerRef,
}: TaskRowProps) {
  const meta = metaLine(task)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !draggable,
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`card mb-2 flex items-center gap-3 p-3 ${isDragging ? 'z-10 opacity-70 shadow-card-hover' : ''}`}
    >
      {draggable && (
        <button
          type="button"
          className="touch-target -ml-1 flex shrink-0 cursor-grab items-center justify-center text-text-muted active:cursor-grabbing"
          aria-label={`Reorder ${task.title}`}
          {...attributes}
          {...listeners}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="6" r="1.6" />
            <circle cx="15" cy="6" r="1.6" />
            <circle cx="9" cy="12" r="1.6" />
            <circle cx="15" cy="12" r="1.6" />
            <circle cx="9" cy="18" r="1.6" />
            <circle cx="15" cy="18" r="1.6" />
          </svg>
        </button>
      )}
      <Checkbox
        ref={(el) => registerRef(task.id, el)}
        checked={task.completed}
        size="lg"
        className="shrink-0 accent-primary"
        tabIndex={focused ? 0 : -1}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'pending' : 'completed'}`}
      />
      <div
        className="min-w-0 flex-1 cursor-pointer"
        onDoubleClick={() => onEdit(task.id)}
        title="Double-click to edit"
      >
        <p
          className={`truncate font-medium ${
            task.completed ? 'text-text-muted line-through' : 'text-text-primary'
          }`}
        >
          {task.title}
        </p>
        {meta && <p className="truncate text-sm text-text-secondary">{meta}</p>}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onEdit(task.id)}
        aria-label={`Edit task ${task.title}`}
      >
        Edit
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDelete(task.id)}
        className="text-accent"
        aria-label={`Delete task ${task.title}`}
      >
        Delete
      </Button>
    </li>
  )
})

export default function TaskManager() {
  const {
    visibleTasks,
    categories,
    counts,
    state,
    setQuery,
    setFilters,
    setSort,
    clearCompleted,
  } = useTasks()
  const createTask = useCreateTask()
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()
  const reorderTasks = useReorderTasks()
  const { preferences } = usePreferences()

  const isManualSort = state.sort.field === 'manual'
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const sortableIds = useMemo(() => visibleTasks.map((task) => task.id), [visibleTasks])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = sortableIds.indexOf(String(active.id))
      const newIndex = sortableIds.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return
      const nextIds = arrayMove(sortableIds, oldIndex, newIndex)
      reorderTasks(nextIds).catch(() => undefined)
    },
    [sortableIds, reorderTasks],
  )

  const [form, setForm] = useState<FormState>(() =>
    makeEmptyForm(preferences.defaultPriority, preferences.defaultReminderTime),
  )
  const [error, setError] = useState<string | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Apply the user's default sort once on first mount.
  const defaultSortApplied = useRef(false)
  useEffect(() => {
    if (defaultSortApplied.current) return
    defaultSortApplied.current = true
    setSort(preferences.defaultSort)
  }, [preferences.defaultSort, setSort])

  const editingTask = useMemo(
    () => state.tasks.find((t) => t.id === editingId) ?? null,
    [state.tasks, editingId],
  )
  const openEditor = useCallback((id: string) => setEditingId(id), [])
  const closeEditor = useCallback(() => setEditingId(null), [])

  const itemRefs = useRef(new Map<string, HTMLInputElement>())
  const formId = useId()
  const errorId = useId()

  const registerRef = useCallback((id: string, el: HTMLInputElement | null) => {
    if (el) itemRefs.current.set(id, el)
    else itemRefs.current.delete(id)
  }, [])

  const focusedId = visibleTasks[focusedIndex]?.id
  useEffect(() => {
    const el = focusedId ? itemRefs.current.get(focusedId) : undefined
    if (el) el.focus()
  }, [focusedId, visibleTasks.length])

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      setError(null)
      try {
        await createTask({
          title: form.title,
          priority: form.priority,
          category: form.category || undefined,
          dueDate: form.dueDate || null,
          reminderTime: form.reminderTime || null,
          repeatType: form.repeatType,
        })
        setForm(makeEmptyForm(preferences.defaultPriority, preferences.defaultReminderTime))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not create task.')
      }
    },
    [createTask, form, preferences.defaultPriority, preferences.defaultReminderTime],
  )

  const onListKeyDown = useCallback(
    (event: KeyboardEvent<HTMLUListElement>) => {
      if (visibleTasks.length === 0) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setFocusedIndex((i) => Math.min(i + 1, visibleTasks.length - 1))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setFocusedIndex((i) => Math.max(i - 1, 0))
      } else if (event.key === 'Home') {
        event.preventDefault()
        setFocusedIndex(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        setFocusedIndex(visibleTasks.length - 1)
      }
    },
    [visibleTasks.length],
  )

  return (
    <main className="mx-auto max-w-2xl p-4">
      <header className="mb-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-text-primary">Daily Task Reminder</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
              className="touch-target flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="card p-4" aria-live="polite">
          <StatsBar total={counts.total} completed={counts.completed} pending={counts.pending} />
        </div>
      </header>

      <form
        id={formId}
        onSubmit={handleSubmit}
        className="card mb-4 space-y-3 p-4"
        aria-label="Create task"
      >
        <div>
          <label htmlFor={`${formId}-title`} className="mb-1 block text-sm text-text-secondary">
            Title
          </label>
          <input
            id={`${formId}-title`}
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            placeholder="What needs to be done?"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="block text-sm text-text-secondary">
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-text-primary"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-text-secondary">
            Category
            <input
              type="text"
              list={`${formId}-categories`}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-text-primary"
              placeholder="work"
            />
            <datalist id={`${formId}-categories`}>
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>

          <label className="block text-sm text-text-secondary">
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-text-primary"
            />
          </label>

          <label className="block text-sm text-text-secondary">
            Reminder
            <input
              type="time"
              value={form.reminderTime}
              onChange={(e) => setForm((f) => ({ ...f, reminderTime: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-text-primary"
            />
          </label>

          <label className="block text-sm text-text-secondary">
            Repeat
            <select
              value={form.repeatType}
              onChange={(e) => setForm((f) => ({ ...f, repeatType: e.target.value as RepeatType }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-text-primary"
            >
              {REPEAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit">Add task</Button>
          {error && (
            <p id={errorId} role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}
        </div>
      </form>

      <section className="mb-4 flex flex-wrap items-end gap-3" aria-label="Filters and search">
        <label className="block text-sm text-text-secondary">
          Search
          <input
            type="search"
            value={state.query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1 w-40 rounded-lg border border-border bg-surface px-2 py-2 text-text-primary"
            placeholder="Search…"
            aria-label="Search tasks"
          />
        </label>

        <label className="block text-sm text-text-secondary">
          Status
          <select
            value={state.filters.status}
            onChange={(e) => setFilters({ status: e.target.value as TaskFilterStatus })}
            className="mt-1 block rounded-lg border border-border bg-surface px-2 py-2 text-text-primary"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-text-secondary">
          Category
          <select
            value={state.filters.category ?? ''}
            onChange={(e) =>
              setFilters({ category: e.target.value === '' ? null : e.target.value })
            }
            className="mt-1 block rounded-lg border border-border bg-surface px-2 py-2 text-text-primary"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-text-secondary">
          Sort
          <select
            value={`${state.sort.field}:${state.sort.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split(':')
              setSort({ field: field as SortField, direction: direction as SortDirection })
            }}
            className="mt-1 block rounded-lg border border-border bg-surface px-2 py-2 text-text-primary"
          >
            <option value="priority:asc">Priority ↑</option>
            <option value="priority:desc">Priority ↓</option>
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="reminderTime:asc">Reminder</option>
            <option value="title:asc">Title A–Z</option>
            <option value="manual:asc">Manual (drag)</option>
          </select>
        </label>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => clearCompleted().catch(() => undefined)}
        >
          Clear completed
        </Button>
      </section>

      {state.error && (
        <p role="alert" className="mb-3 text-sm text-accent">
          {state.error}
        </p>
      )}

      {isManualSort && visibleTasks.length > 0 && (
        <p className="mb-2 text-xs text-text-muted">
          Drag the handle to reorder tasks. Your order is saved automatically.
        </p>
      )}

      {visibleTasks.length === 0 ? (
        <EmptyState
          title="No tasks match"
          description="Adjust your filters or add a new task to get started."
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <ul
              role="list"
              aria-label="Tasks"
              onKeyDown={onListKeyDown}
              className="scrollbar-hide list-none"
            >
              {visibleTasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  focused={index === focusedIndex}
                  draggable={isManualSort}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEdit={openEditor}
                  registerRef={registerRef}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <TaskEditor task={editingTask} categories={categories} onClose={closeEditor} />
      <SettingsSheet isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  )
}
