import type { Task, TaskFilters, TaskSort } from '../types/task'

export type TaskStatus = 'idle' | 'loading' | 'ready' | 'error'

export type TaskState = {
  tasks: Task[]
  status: TaskStatus
  error: string | null
  filters: TaskFilters
  sort: TaskSort
  query: string
}

export const initialTaskState: TaskState = {
  tasks: [],
  status: 'idle',
  error: null,
  filters: { status: 'all', category: null, priority: null },
  sort: { field: 'priority', direction: 'asc' },
  query: '',
}

export type TaskAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; tasks: Task[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'UPSERT_TASK'; task: Task }
  | { type: 'REMOVE_TASK'; id: string }
  | { type: 'SET_TASKS'; tasks: Task[] }
  | { type: 'SET_QUERY'; query: string }
  | { type: 'SET_FILTERS'; filters: Partial<TaskFilters> }
  | { type: 'SET_SORT'; sort: TaskSort }
  | { type: 'SET_ERROR'; error: string }

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null }
    case 'LOAD_SUCCESS':
      return { ...state, status: 'ready', tasks: action.tasks, error: null }
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.error }
    case 'UPSERT_TASK': {
      const exists = state.tasks.some((task) => task.id === action.task.id)
      return {
        ...state,
        tasks: exists
          ? state.tasks.map((task) => (task.id === action.task.id ? action.task : task))
          : [...state.tasks, action.task],
      }
    }
    case 'REMOVE_TASK':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) }
    case 'SET_TASKS':
      return { ...state, tasks: action.tasks }
    case 'SET_QUERY':
      return { ...state, query: action.query }
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters } }
    case 'SET_SORT':
      return { ...state, sort: action.sort }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    default:
      return state
  }
}
