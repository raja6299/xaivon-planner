import { ThemeProvider } from './context/ThemeProvider'
import { PreferencesProvider } from './context/PreferencesProvider'
import { TaskProvider } from './state/TaskProvider'
import TaskManager from './components/TaskManager'
import UpdatePrompt from './components/UpdatePrompt'
import InstallPrompt from './components/InstallPrompt'

export default function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <TaskProvider>
          <TaskManager />
          <UpdatePrompt />
          <InstallPrompt />
        </TaskProvider>
      </PreferencesProvider>
    </ThemeProvider>
  )
}
