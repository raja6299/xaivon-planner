# Xaivon Planner (Daily Task Reminder) - Version 1.0.0

A complete, production-quality Progressive Web App (PWA) for personal daily planning.

## Tech Stack
- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS** (Dark mode default, light and system themes available)
- **IndexedDB** (Offline-first architecture, no backend required)
- **PWA** (Manifest + Service Worker, installable, offline capabilities)
- **@dnd-kit** (For accessible drag-and-drop task reordering)

## Architecture Overview

The app is entirely client-side. Tasks, preferences, and theme settings are persisted locally in the browser. 

*   **Storage Layer**: IndexedDB provides a robust asynchronous storage engine capable of scaling beyond LocalStorage limits. 
*   **State Management**: React Context (`TaskProvider`, `PreferencesProvider`, `ThemeProvider`) handles global state, optimizing re-renders with Memoization (`useCallback`, `memo`).
*   **Offline-First**: Service Worker caches all static assets (`vite-plugin-pwa`) enabling instant loading on return visits and full functionality without an internet connection.

## Directory Structure

```text
daily-task-reminder/
├── public/                 # Static assets (PWA icons, manifest)
├── src/
│   ├── components/         # React Components
│   │   ├── layout/         # TopBar, Layout shells
│   │   ├── tasks/          # TaskRow, TaskEditor, TaskMenu
│   │   ├── settings/       # SettingsSheet
│   │   └── ui/             # Reusable UI elements (Button, Modal, Checkbox)
│   ├── context/            # React Contexts (Theme, Preferences)
│   ├── hooks/              # Custom React Hooks
│   ├── lib/
│   │   ├── db/             # IndexedDB Connection & Schema
│   │   ├── tasks/          # Task Repository (CRUD operations)
│   │   └── utils/          # Helpers (Date, Validation, IDs)
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

## Features

-   **Task Management**: Create, edit, complete, delete, and duplicate tasks.
-   **Categories & Priorities**: Organize tasks using categories and priorities (Low, Medium, High).
-   **Reminders & Due Dates**: Set specific due dates and time reminders.
-   **Repeating Tasks**: Configure tasks to repeat daily, weekly, monthly, or on custom weekdays.
-   **Drag and Drop**: Reorder tasks intuitively with `@dnd-kit`.
-   **Filtering & Sorting**: Instantly search, filter by status/category, and sort by various criteria.
-   **Dark/Light Mode**: Full theme support respecting system preferences.
-   **Data Portability**: Export and import your entire task database as JSON.
-   **Installable**: Works as a standalone app on Android, iOS, and Desktop via PWA standards.

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

## Known Limitations & Future Roadmap

*   **Cross-Device Sync**: Since all data is stored locally in IndexedDB, data does not sync across different devices or browsers natively.
*   **Push Notifications**: Currently uses in-app reminders; future roadmap includes Push API for background notifications.
*   **Calendar Integration**: Future integration with Google Calendar or generic iCal feeds.

## Keyboard Shortcuts
*   **Ctrl/Cmd + Enter**: Save task while in the Edit Task modal.
*   **Tab / Shift+Tab**: Fully accessible keyboard navigation through all interactive elements (buttons, inputs, checkboxes) via visible focus rings.
