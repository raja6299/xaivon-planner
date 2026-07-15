/// <reference types="vite/client" />

// Injected at build time via Vite `define` (see vite.config.ts).
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt: () => Promise<void>
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent
}

declare module '*.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const src: string
  export default src
}