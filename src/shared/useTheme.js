import { useState } from 'react'

const THEMES = ['theme-dark', 'theme-light', 'theme-sage']
const STORAGE_KEY = 'homeos-theme'

function applyTheme(theme) {
  const html = document.documentElement
  THEMES.forEach(t => html.classList.remove(t))
  html.classList.add(theme)
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  const theme = THEMES.includes(saved) ? saved : 'theme-dark'
  document.documentElement.classList.remove('dark')
  applyTheme(theme)
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(saved) ? saved : 'theme-dark'
  })

  function cycleTheme() {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
    localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
    setTheme(next)
  }

  return { theme, cycleTheme }
}
