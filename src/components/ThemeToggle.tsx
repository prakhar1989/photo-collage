import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'collage-theme'

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
  return mediaQuery?.matches ? 'dark' : 'light'
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme())

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    root.dataset.theme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mediaQuery) return undefined

    const handler = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-accent/60 hover:text-slate-900 dark:border-border/60 dark:bg-surface/60 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100"
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span aria-hidden="true" className="text-base">
        {isDark ? '🌙' : '☀️'}
      </span>
      <span className="whitespace-nowrap">{isDark ? 'Dark' : 'Light'} mode</span>
    </button>
  )
}
