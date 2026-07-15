# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Vision
Build a **personal, offline-first Progressive Web App (PWA)** for daily task planning. One-tap task completion, zero authentication, zero backend, fully offline via LocalStorage. Mobile-first, dark-mode default, 60fps scrolling, large touch targets.

## Tech Stack
- **React 18** + **TypeScript** (strict)
- **Vite 5** for dev/build
- **Tailwind CSS 3** (dark mode default, class strategy)
- **LocalStorage** for persistence (no backend)
- **Vite PWA Plugin** (Workbox) for offline support
- **@dnd-kit** for drag-and-drop reordering
- **Lucide React** for icons
- **Vitest + React Testing Library** for unit tests
- **ESLint (Airbnb/TypeScript)** + **Prettier**

## Architecture Decisions
- **Single-page React app** — no router needed.
- **Context + custom hooks** for state (no Redux/Zustand).
- **LocalStorage wrapper** with typed schemas and versioned schema migration.
- **CSS Grid** for planner grid; sticky columns via `position: sticky`.
- **CSS custom properties** for theming (dark/light).
- **Workbox** precache + runtime caching for full offline.
- **Vite PWA plugin** generates manifest + SW automatically.
- **@dnd-kit/core + @dnd-kit/sortable** for drag-and-drop reorder.
- **Lucide React** icons (tree-shakeable, lightweight).

## Folder Conventions
```
src/
├─ components/       # Reusable UI components (Button, Checkbox, Modal, etc.)
├─ features/         # Feature-scoped modules (planner, tasks, settings)
│  ├─ planner/       # Planner grid, day columns, progress ring
│  ├─ tasks/         # Task CRUD, drag-drop, editor modal
│  └─ settings/      # Theme toggle, column visibility, PWA install
├─ hooks/            # Shared hooks (useLocalStorage, useTasks, useTheme, etc.)
├─ context/          # React Context providers (ThemeProvider, TaskProvider)
├─ utils/            # Pure utilities (date, storage, id, validation)
├─ types/            # Shared TypeScript interfaces/types
├─ styles/           # Global CSS, Tailwind layers, CSS variables
├─ App.tsx           # Root component
├─ main.tsx          # Entry point
└─ vite-env.d.ts     # Vite types
```

## Coding Standards
- **TypeScript strict mode** — no `any`, explicit return types on exported functions.
- **ESLint (Airbnb + TypeScript)** + **Prettier** — run `npm run lint` before commit.
- **Functional components** with hooks; no class components.
- **Named exports** for components, default export only for pages/entry.
- **Component naming**: PascalCase file + default export named same (`TaskRow.tsx` → `export default function TaskRow()`).
- **Hook naming**: `useCamelCase` in `hooks/`.
- **Type naming**: PascalCase interfaces (`Task`, `DayCompletion`), types in `types/`.
- **CSS**: Tailwind utilities first; custom CSS only in `styles/globals.css` for CSS variables and global resets.
- **Dark mode default**: `class="dark"` on `<html>`; light mode via `.light` class toggle.

## UI Rules
- **Dark mode default** — `class="dark"` on `<html>`.
- **Rounded corners**: `rounded-xl` for cards, `rounded-full` for pills.
- **Shadows**: `shadow-lg` for elevated cards, `shadow-xl` for modals.
- **Typography**: `font-sans` (Inter via Tailwind), `text-base` base size.
- **Touch targets**: minimum `44x44px` (`min-h-[44px] min-w-[44px]`).
- **Checkboxes**: custom SVG check, `w-10 h-10` tap target, instant check animation (`transition-transform duration-150`).
- **Sticky columns**: `left-0` / `left-[60px]` with `z-10` and `bg-background/95 backdrop-blur`.
- **Horizontal scroll**: `overflow-x-auto` on grid container, `scrollbar-hide` utility.
- **Progress ring**: SVG `stroke-dasharray` animated via CSS variable.

## Mobile-First Principles
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`.
- Base styles target ≤ 480px; enhance upward.
- Sticky header (`top-0 z-20`), sticky time/task columns.
- No hover-only interactions; all actions work on tap.
- Large tap targets (≥ 44px).
- `touch-action: manipulation` on interactive elements.
- Prevent double-tap zoom: `touch-action: manipulation` on buttons/checkboxes.

## PWA Requirements
- **Manifest**: `manifest.webmanifest` with `display: standalone`, `theme_color: #0f172a`, `background_color: #0f172a`, icons 192/512.
- **Service Worker**: Workbox `GenerateSW` with `precacheManifest`, `runtimeCaching` for `/*` (NetworkFirst), `navigateFallback: '/index.html'`.
- **Offline-first**: All assets cached; LocalStorage works offline automatically.
- **Install prompt**: Custom `beforeinstallprompt` handler in `Settings` component.
- **No external network requests** at runtime (except SW update check).

## LocalStorage Rules
- Single key: `dtr:v1` (versioned namespace).
- Schema versioned; migration function in `utils/storage.ts`.
- All writes debounced 150 ms (via `useDebouncedCallback`).
- Never block UI on write; fire-and-forget with `localStorage.setItem`.
- On load, parse JSON, run migrations, hydrate context.

## TypeScript Standards
- `strict: true`, `noUncheckedIndexedAccess: true`.
- Shared types in `src/types/index.ts`.
- Branded types for IDs: `type TaskId = string & { __brand: 'TaskId' }`.
- Discriminated unions for task status: `type TaskStatus = 'pending' | 'completed'`.

## Component Naming Conventions
- UI primitives: `Button`, `Checkbox`, `Modal`, `Sheet`, `ProgressRing`.
- Feature components: `PlannerGrid`, `DayColumn`, `TaskRow`, `TaskEditor`, `SettingsPanel`.
- Hooks: `useTasks`, `useTheme`, `useLocalStorage`, `useDebouncedCallback`.
- Context: `ThemeProvider`, `TaskProvider`.

## Performance Goals
- **TTI < 2s** on cold load (mobile 4G).
- **60 fps** horizontal scroll on grid (GPU-accelerated `transform`).
- **< 100 ms** LocalStorage write latency (debounced).
- **< 50 KB** gzipped JS (tree-shaken, code-split editor modal).
- **Lighthouse PWA score ≥ 90**.

## Things AI Must Never Change Without Approval
- **Tech stack** (React/Vite/Tailwind/PWA).
- **Offline-only, no-backend architecture**.
- **Single-tap checkbox UX** (no modals on complete).
- **Dark-mode-default design system**.
- **LocalStorage schema versioning strategy**.
- **Folder structure conventions**.
- **TypeScript strictness settings**.
- **PWA offline-first caching strategy**.

## Common Commands
```bash
# Install dependencies
npm install

# Development server (HTTPS for PWA testing)
npm run dev

# Type-check + lint
npm run lint

# Format with Prettier
npm run format

# Build for production
npm run build

# Preview production build
npm run preview

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate PWA icons (run once)
npm run pwa:generate-icons
```

## Architecture Overview (High-Level)
1. **App.tsx** wraps providers: `ThemeProvider` → `TaskProvider` → `PlannerGrid`.
2. **TaskProvider** loads LocalStorage once, exposes `tasks`, `completions`, `addTask`, `updateTask`, `deleteTask`, `toggleCompletion`, `reorderTasks`.
3. **PlannerGrid** renders month header, progress ring, and horizontal scroll container with sticky columns.
4. **DayColumn** renders 31 day cells + bottom "Day Complete" checkbox; computes completion % per day.
5. **TaskRow** renders time, name, notes, reminder, duration, and 31 one-tap checkboxes.
6. **TaskEditor** (modal/sheet) handles create/edit/duplicate; uses `react-hook-form` + `zod`.
7. **SettingsSheet** toggles theme, time-column visibility, PWA install prompt.
8. **Service Worker** (generated) precaches all assets; runtime caches navigation.

## Migration Strategy (LocalStorage)
- Version key: `dtr:schemaVersion`.
- On load, if version mismatch, run migration functions sequentially.
- Current version: `1` (initial).
- Migrations stored in `utils/migrations.ts`.

## Testing Strategy
- **Unit**: `useTasks`, `useLocalStorage`, date utils, storage migrations.
- **Component**: `TaskRow` (toggle), `DayColumn` (completion), `PlannerGrid` (scroll).
- **Integration**: full create/edit/delete/reorder flow in `TaskProvider` test.
- **E2E (optional)**: Playwright for PWA install + offline load.

---

*Update this file whenever architecture, conventions, or tooling change.*