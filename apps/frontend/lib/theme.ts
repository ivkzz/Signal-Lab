export const THEME_STORAGE_KEY = 'signal-lab-theme'

export type Theme = 'light' | 'dark'

export function readThemeFromDocument(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* ignore quota / private mode */
  }
}

export function toggleTheme(): Theme {
  const next: Theme = readThemeFromDocument() === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}

/** Inline snippet for <script> in layout — runs before paint to avoid flash. */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);return}}catch(e){}var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',d?'dark':'light')})()`
