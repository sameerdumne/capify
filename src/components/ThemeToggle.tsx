"use client"

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'dark' | 'light'

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem('capify-theme')

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    window.localStorage.setItem('capify-theme', nextTheme)
    applyTheme(nextTheme)
  }

  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? 'night' : 'day'} mode`}
      title={`Switch to ${isLight ? 'night' : 'day'} mode`}
      className="relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-white/10 bg-white/10 p-1 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-accent/70"
    >
      <span
        className={`absolute left-1 flex size-7 items-center justify-center rounded-full bg-gradient-to-r from-neon to-accent text-black shadow-sm transition-transform ${
          isLight ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isLight ? <Sun size={16} /> : <Moon size={16} />}
      </span>
    </button>
  )
}
