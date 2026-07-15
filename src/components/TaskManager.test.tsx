import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import App from '../App'

afterEach(cleanup)

// Let the optimistic create fully settle (temp id -> persisted id) so that a
// subsequent edit targets the real, persisted task rather than the temp row.
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25))
  })
}

async function addTask(title: string) {
  const titleInput = screen.getByPlaceholderText('What needs to be done?')
  fireEvent.change(titleInput, { target: { value: title } })
  fireEvent.click(screen.getByRole('button', { name: 'Add task' }))
  await screen.findByText(title)
  await settle()
}

describe('TaskManager integration', () => {
  it('creates, edits, completes, searches and deletes a task', async () => {
    render(<App />)

    // Create
    await addTask('Buy milk')
    expect(screen.getByText('Buy milk')).toBeInTheDocument()

    // Edit (open modal, change title, save)
    fireEvent.click(screen.getByRole('button', { name: 'Edit task Buy milk' }))
    const dialog = await screen.findByRole('dialog')
    const editTitle = within(dialog).getByDisplayValue('Buy milk')
    fireEvent.change(editTitle, { target: { value: 'Buy oat milk' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText('Buy oat milk')).toBeInTheDocument()

    // Complete (toggle checkbox)
    const checkbox = screen.getByRole('checkbox', { name: /Mark "Buy oat milk" as completed/ })
    fireEvent.click(checkbox)
    expect(
      await screen.findByRole('checkbox', { name: /Mark "Buy oat milk" as pending/ }),
    ).toBeInTheDocument()

    // Search filter
    await addTask('Walk the dog')
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search tasks' }), {
      target: { value: 'dog' },
    })
    await waitFor(() => expect(screen.queryByText('Buy oat milk')).not.toBeInTheDocument())
    expect(screen.getByText('Walk the dog')).toBeInTheDocument()

    // Clear search, then delete
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search tasks' }), {
      target: { value: '' },
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Delete task Buy oat milk' }))
    await waitFor(() => expect(screen.queryByText('Buy oat milk')).not.toBeInTheDocument())
  })
})
