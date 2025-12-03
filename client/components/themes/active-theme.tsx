"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

const DEFAULT_THEME = "blue"
const THEME_STORAGE_KEY = "maktab-theme"

type ThemeContextType = {
  activeTheme: string
  setActiveTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ActiveThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveThemeState] = useState<string>(DEFAULT_THEME)
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored) {
      setActiveThemeState(stored)
    }
    setMounted(true)
  }, [])

  // Update body classes and save to localStorage when theme changes
  useEffect(() => {
    if (!mounted) return

    Array.from(document.body.classList)
      .filter((className) => className.startsWith("theme-"))
      .forEach((className) => {
        document.body.classList.remove(className)
      })
    document.body.classList.add(`theme-${activeTheme}`)
    if (activeTheme.endsWith("-scaled")) {
      document.body.classList.add("theme-scaled")
    }

    localStorage.setItem(THEME_STORAGE_KEY, activeTheme)
  }, [activeTheme, mounted])

  const setActiveTheme = (theme: string) => {
    setActiveThemeState(theme)
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeConfig() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useThemeConfig must be used within an ActiveThemeProvider")
  }
  return context
}
