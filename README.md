# Daily Task Reminder - PWA

A complete, production-quality Progressive Web App (PWA) for personal daily planning.

## Tech Stack
- **React** + **Vite** + **TypeScript**
- **Tailwind CSS** (dark mode default, light optional)
- **LocalStorage** (offline-first, no backend)
- **PWA** (manifest + service worker, installable, offline)

## Folder Structure

```
daily-task-reminder/
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/                 # placeholder icons (192 / 512)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx        # month selector + date + settings + progress
│   │   │   └── PlannerGrid.tsx   # the big scrolling grid
│   │   ├── tasks/
│   │   │   ├── TaskRow.tsx       # one task: time + name + day checkboxes
│   │   │   ├── TaskEditor.tsx    # create/edit modal sheet
│   │   │   └── TaskMenu.tsx      # duplicate / delete / drag handle
│   │   ├── day/
│   │   │   ├── DayHeader.tsx     # Day 1..31 sticky header
│   │   │   ├── DayCell.tsx       # one-tap checkbox
│   │   │   └── DayComplete.tsx   # big bottom checkbox, auto-highlights
│   │   ├── ui/
│   │   │   ├── OneTapCheckbox.tsx# animated, no popup
│   │   │   ├── ProgressRing.tsx  # today's progress
│   │   │   ├── Sheet.tsx         # bottom sheet for settings/editor
│   │   │   └── IconButton.tsx
│   │   └── settings/
│   │       └── SettingsSheet.tsx # theme, show/hide time column
│   ├── hooks/
│   │   ├── useTasks.ts          # CRUD + reorder (localStorage-backed)
│   │   ├── useCompletions.ts    # day/task completion state
│   │   ├── useTheme.ts
│   │   └── useInstallPrompt.ts
│   ├── lib/
│   │   ├── storage.ts          # safe localStorage read/write
│   │   ├── types.ts
│   │   ├── date.ts             # month/days helpers
│   │   └── id.ts
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
└── postcss.config.js
```

## Data Model

```ts
type Task = {
  id: string;
  name: string;
  time?: string;        // "07:30"
  notes?: string;
  reminderTime?: string;
  durationMin?: number;
  order: number;        // for drag & drop
};

// keyed by `${taskId}:${dayNumber}` (1..31)
type CompletionMap = Record<string, boolean>;

type Settings = {
  theme: 'dark' | 'light';
  showTimeColumn: boolean;
};
```

Stored in LocalStorage under versioned keys:
- `drawer.tasks.v1`
- `drawer.completions.v1`
- `drawer.settings.v1`

## Component Tree

```
App
├── TopBar
│   ├── MonthSelector
│   ├── CurrentDate
│   ├── ProgressRing        (today's progress)
│   └── IconButton (settings) -> SettingsSheet
└── PlannerGrid (horizontal scroll, sticky)
    ├── (sticky left) TimeColumn + TaskColumn header
    ├── DayHeader[]          (Day 1..31, sticky top)
    └── TaskRow[]
        ├── TimeCell (optional)
        ├── TaskCell (name + notes + TaskMenu)
        └── DayCell[] -> OneTapCheckbox
    └── DayComplete[]        (bottom of each day column)
```

## Core Behaviors
- **One-tap checkbox:** `onClick` flips boolean in `CompletionMap`, persists to localStorage, instant CSS transition. No reload, no modal.
- **Day complete auto-highlight:** derived from `every task in that day === true`.
- **Today's progress:** `completedTodayTasks / totalTasks`.
- **Reorder:** HTML5 drag-and-drop on TaskRow handle, writes new `order`.
- **Offline:** service worker caches app shell; all data is local.

## UI Mockup (ASCII)

```
┌──────────────────────────────────────────────────────────┐
│  ‹ Jul 2026 ›     Tue 14            ◉ 6/9     ⚙           │  <- TopBar sticky
├──────────┬──────────────┬─────┬─────┬─────┬─────┬─────────┤
│ Time     │ Task         │ D1  │ D2  │ D3  │ …   │ D31     │  <- Day headers sticky
├──────────┼──────────────┼─────┼─────┼─────┼─────┼─────────┤
│ 07:30    │ Wake up      │ [✓] │ [ ] │ [✓] │ …   │ [ ]     │
│ 08:00    │ Morning run  │ [ ] │ [✓] │ [ ] │ …   │ [✓]     │
│ 09:00    │ Standup      │ [✓] │ [✓] │ [✓] │ …   │ [ ]     │
│          │ (notes…)     │     │     │     │     │         │
│          │ ⋮ ⧉ 🗑       │     │     │     │     │         │  <- TaskMenu
├──────────┼──────────────┼─────┼─────┼─────┼─────┼─────────┤
│          │ DAY DONE     │ [✓] │ [ ] │ [✓] │ …   │ [ ]     │  <- DayComplete
└──────────┴──────────────┴─────┴─────┴─────┴─────┴─────────┘
        (horizontal scroll → for Day columns)
```

## Next Steps (after approval)
1. Scaffold Vite + React + TS, install Tailwind, configure PWA.
2. Implement data layer (`lib/` + hooks).
3. Build UI components.
4. Wire one-tap checkbox + auto day-complete.
5. Add settings, drag & drop, install prompt.
6. PWA manifest + service worker + icons.
7. Test offline + mobile.
