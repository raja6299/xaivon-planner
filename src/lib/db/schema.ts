export const DB_NAME = 'daily-task-reminder'
export const DB_VERSION = 1
export const STORE_TASKS = 'tasks'

export function migrate(db: IDBDatabase, oldVersion: number): void {
  if (oldVersion < 1) {
    const store = db.createObjectStore(STORE_TASKS, { keyPath: 'id' })
    store.createIndex('by-completed', 'completed')
    store.createIndex('by-priority', 'priority')
    store.createIndex('by-category', 'category')
    store.createIndex('by-createdAt', 'createdAt')
    store.createIndex('by-dueDate', 'dueDate')
    store.createIndex('by-reminderTime', 'reminderTime')
  }
}
