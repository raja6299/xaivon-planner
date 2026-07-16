# Xaivon Planner (Daily Task Reminder) - Version 1.0.0

A complete, production-quality Progressive Web App (PWA) for personal daily planning.

## Tech Stack
- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS** (Dark mode default, light and system themes available)
- **IndexedDB** & **LocalStorage** (Offline-first architecture, no backend required)
- **PWA** (Manifest + Service Worker, installable, offline capabilities)
- **@dnd-kit** (For accessible drag-and-drop task reordering)

## Architecture Overview

The application is entirely client-side, designed to function offline without a backend. 

### Storage Layer
The application uses a hybrid local storage approach:
*   **IndexedDB**: Stores all task data asynchronously. This provides a robust storage engine capable of scaling far beyond LocalStorage limits and handles frequent read/write operations without blocking the main UI thread.
*   **LocalStorage**: Stores user preferences (default sorting, default priority, default reminder times) and UI theme settings (dark, light, system). 

### State Management
React Context handles global state, optimizing re-renders with strict memoization (`useCallback`, `memo`). The state is divided into logical providers (`TaskProvider`, `PreferencesProvider`, `ThemeProvider`) to prevent unnecessary renders across the component tree.

### Offline-First PWA
A Service Worker caches all static assets (`vite-plugin-pwa`), enabling instant loading on return visits and full functionality without an internet connection. The app includes native install prompts for Android and Desktop.

## Directory Structure

```text
daily-task-reminder/
├── public/                 # Static assets (PWA icons, manifest)
├── src/
│   ├── components/         # React Components
│   │   ├── ui/             # Reusable UI elements (Button, Modal, Checkbox)
│   │   ├── ErrorBoundary.tsx
│   │   ├── InstallPrompt.tsx
│   │   ├── SettingsSheet.tsx
│   │   ├── TaskEditor.tsx
│   │   ├── TaskManager.tsx
│   │   └── UpdatePrompt.tsx
│   ├── context/            # React Contexts (Theme, Preferences)
│   ├── hooks/              # Custom React Hooks
│   ├── lib/
│   │   ├── db/             # IndexedDB Connection & Schema
│   │   ├── tasks/          # Task Repository (CRUD operations)
│   │   └── utils/          # Helpers (Date, Validation, LocalStorage, IDs)
│   ├── pwa/                # Service Worker and Install Prompt logic
│   ├── state/              # Global Task State Reducer & Provider
│   ├── styles/             # Tailwind & Global CSS
│   ├── App.tsx             # Root Component with ErrorBoundary
│   └── main.tsx            # Entry Point & SW Registration
├── index.html              # HTML Shell
├── package.json            # Dependencies & Scripts
├── tailwind.config.js      # Tailwind Configuration
└── vite.config.ts          # Vite & PWA Configuration
```

## Component Tree

```text
App
└── ErrorBoundary
    └── ThemeProvider
        └── PreferencesProvider
            └── TaskProvider
                ├── TaskManager
                │   ├── Top Bar (Search, Filters, Sort)
                │   ├── TaskList (Draggable)
                │   │   └── TaskRow (w/ Checkbox & Actions)
                │   ├── SettingsSheet
                │   └── TaskEditor
                ├── UpdatePrompt
                └── InstallPrompt
```

## Implemented Features

-   **Task Management**: Create, edit, complete, delete, and duplicate tasks.
-   **Categories & Priorities**: Organize tasks using categories and priorities (Low, Medium, High).
-   **Reminders & Due Dates**: Set specific due dates and time reminders.
-   **Repeating Tasks**: Configure tasks to repeat daily, weekly, monthly, or on custom weekdays.
-   **Drag and Drop**: Reorder tasks intuitively with `@dnd-kit`.
-   **Filtering & Sorting**: Instantly search, filter by status/category, and sort by various criteria.
-   **Dark/Light Mode**: Full theme support respecting system preferences.
-   **Data Portability**: Export and import your entire task database as JSON.
-   **Installable PWA**: Works as a standalone app on Android, iOS, and Desktop via PWA standards.
-   **Error Handling**: Global ErrorBoundary catches runtime crashes and allows safe local-data resets.

## Installation & Development

Ensure you have Node.js (v18+) installed.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests
npm run test

# Lint code
npm run lint

# Build for production
npm run build
```

## Deployment

The app is configured to be deployed to GitHub Pages.

1.  The `vite.config.ts` includes `base: '/xaivon-planner/'`.
2.  Run `npm run build`.
3.  Deploy the `/dist` folder to your `gh-pages` branch or via a GitHub Action.

## Known Limitations

*   **Cross-Device Sync**: Since all data is stored locally in IndexedDB, data does not sync across different devices or browsers natively.
*   **Push Notifications**: Reminders are strictly visual/in-app. Background OS-level push notifications are not supported without a backend push service.

## Keyboard Shortcuts
*   **Ctrl/Cmd + Enter**: Save task while in the Edit Task modal.
*   **Tab / Shift+Tab**: Fully accessible keyboard navigation through all interactive elements (buttons, inputs, checkboxes) via visible focus rings.
