'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const onToggle = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  const isDark = resolvedTheme === 'dark'
  // До mount `resolvedTheme` на сервере и при гидратации может не совпасть с клиентом — держим aria/title стабильными.
  const ariaLabel = mounted
    ? isDark
      ? 'Включить светлую тему'
      : 'Включить тёмную тему'
    : 'Переключить тему'
  const title = mounted ? (isDark ? 'Светлая тема' : 'Тёмная тема') : 'Тема'

  return (
    <Button
      type="button"
      variant="ghost"
      className="size-9 shrink-0 px-0 text-muted-foreground hover:text-foreground"
      onClick={onToggle}
      aria-label={ariaLabel}
      title={title}
    >
      {!mounted ? (
        <span className="size-4" aria-hidden />
      ) : isDark ? (
        <Sun className="size-4" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="size-4" strokeWidth={1.75} aria-hidden />
      )}
    </Button>
  )
}
