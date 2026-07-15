import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { taskReducer, initialTaskState } from './taskReducer'
import { TaskContext, type TaskContextValue } from './taskContext'
import { taskRepository } from '../lib/tasks/repository'
import { generateId } from '../lib/utils/id'
import { nowISO } from '../lib/utils/date'
import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  TaskSort,
  UpdateTaskInput,
} from '../types/task'

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An unexpected error occurred.'
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState)
  const tasksRef = useRef<Task[]>(state.tasks)
  useEffect(() => {
    tasksRef.current = state.tasks
  }, [state.tasks])

  useEffect(() => {
    let active = true
    dispatch({ type: 'LOAD_START' })
    taskRepository
      .getAllTasks()
      .then((tasks) => {
        if (active) dispatch({ type: 'LOAD_SUCCESS', tasks })
      })
      .catch((err: unknown) => {
        if (active) dispatch({ type: 'LOAD_ERROR', error: errorMessage(err) })
      })
    return () => {
      active = false
    }
  }, [])

  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    const tempId = `temp-${generateId()}`
    const now = nowISO()
    const optimistic: Task = {
      id: tempId,
      title: input.title.trim(),
      notes: input.notes?.trim() ?? '',
      completed: false,
      priority: input.priority ?? 'medium',
      category: input.category?.trim() ?? '',
      reminderTime: input.reminderTime ?? null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      repeatType: input.repeatType ?? 'none',
      repeatDays: input.repeatDays ?? [],
      dueDate: input.dueDate ?? null,
      order: Date.now(),
    }
    dispatch({ type: 'UPSERT_TASK', task: optimistic })
    try {
      const created = await taskRepository.createTask(input)
      dispatch({ type: 'REMOVE_TASK', id: tempId })
      dispatch({ type: 'UPSERT_TASK', task: created })
      return created
    } catch (err) {
      dispatch({ type: 'REMOVE_TASK', id: tempId })
      dispatch({ type: 'SET_ERROR', error: errorMessage(err) })
      throw err
    }
  }, [])

  const updateTask = useCallback(async (id: string, patch: UpdateTaskInput): Promise<Task> => {
    const current = tasksRef.current.find((task) => task.id === id)
    if (!current) throw new Error('Task not found.')
    const optimistic: Task = {
      ...current,
      ...patch,
      id,
      updatedAt: nowISO(),
    }
    dispatch({ type: 'UPSERT_TASK', task: optimistic })
    try {
      const updated = await taskRepository.updateTask(id, patch)
      dispatch({ type: 'UPSERT_TASK', task: updated })
      return updated
    } catch (err) {
      dispatch({ type: 'UPSERT_TASK', task: current })
      dispatch({ type: 'SET_ERROR', error: errorMessage(err) })
      throw err
    }
  }, [])

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    const current = tasksRef.current.find((task) => task.id === id)
    if (!current) return
    dispatch({ type: 'REMOVE_TASK', id })
    try {
      await taskRepository.deleteTask(id)
    } catch (err) {
      dispatch({ type: 'UPSERT_TASK', task: current })
      dispatch({ type: 'SET_ERROR', error: errorMessage(err) })
      throw err
    }
  }, [])

  const toggleTask = useCallback(async (id: string): Promise<Task> => {
    const current = tasksRef.current.find((task) => task.id === id)
    if (!current) throw new Error('Task not found.')
    const completed = !current.completed
    const optimistic: Task = {
      ...current,
      completed,
      completedAt: completed ? nowISO() : null,
      updatedAt: nowISO(),
    }
    dispatch({ type: 'UPSERT_TASK', task: optimistic })
    try {
      const updated = await taskRepository.toggleTask(id)
      dispatch({ type: 'UPSERT_TASK', task: updated })
      return updated
    } catch (err) {
      dispatch({ type: 'UPSERT_TASK', task: current })
      dispatch({ type: 'SET_ERROR', error: errorMessage(err) })
      throw err
    }
  }, [])

  const clearCompleted = useCallback(async (): Promise<void> => {
    const snapshot = tasksRef.current
    const remaining = snapshot.filter((task) => !task.completed)
    dispatch({ type: 'SET_TASKS', tasks: remaining })
    try {
      await taskRepository.clearCompleted()
    } catch (err) {
      dispatch({ type: 'SET_TASKS', tasks: snapshot })
      dispatch({ type: 'SET_ERROR', error: errorMessage(err) })
      throw err
    }
  }, [])

  const reloadTasks = useCallback(async (): Promise<void> => {
    const tasks = await taskRepository.getAllTasks()
    dispatch({ type: 'LOAD_SUCCESS', tasks })
  }, [])

  const reorderTasks = useCallback(async (orderedVisibleIds: string[]): Promise<void> => {
    const snapshot = tasksRef.current
    // Full task list in current manual order.
    const fullSorted = [...snapshot].sort((a, b) => a.order - b.order)
    const visibleSet = new Set(orderedVisibleIds)
    // Rebuild the full id order, substituting the new arrangement wherever a
    // visible task sits, so hidden/filtered tasks keep their relative slots.
    let cursor = 0
    const newFullIds = fullSorted.map((task) => {
      if (!visibleSet.has(task.id)) return task.id
      const next = orderedVisibleIds[cursor] ?? task.id
      cursor += 1
      return next
    })
    const orderMap = new Map(newFullIds.map((id, index) => [id, index]))
    const optimistic = snapshot.map((task) => ({
      ...task,
      order: orderMap.get(task.id) ?? task.order,
    }))
    dispatch({ type: 'SET_TASKS', tasks: optimistic })
    try {
      await taskRepository.reorderTasks(newFullIds)
    } catch (err) {
      dispatch({ type: 'SET_TASKS', tasks: snapshot })
      dispatch({ type: 'SET_ERROR', error: errorMessage(err) })
      throw err
    }
  }, [])

  const setQuery = useCallback((query: string) => dispatch({ type: 'SET_QUERY', query }), [])
  const setFilters = useCallback(
    (filters: Partial<TaskFilters>) => dispatch({ type: 'SET_FILTERS', filters }),
    [],
  )
  const setSort = useCallback((sort: TaskSort) => dispatch({ type: 'SET_SORT', sort }), [])

  const value = useMemo<TaskContextValue>(
    () => ({
      state,
      createTask,
      updateTask,
      deleteTask,
      toggleTask,
      clearCompleted,
      reorderTasks,
      reloadTasks,
      setQuery,
      setFilters,
      setSort,
    }),
    [state, createTask, updateTask, deleteTask, toggleTask, clearCompleted, reorderTasks, reloadTasks, setQuery, setFilters, setSort],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
