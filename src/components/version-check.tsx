'use client'

import { useVersionCheck } from '@/hooks/useVersionCheck'

/**
 * 用來讓 useVersionCheck 能掛在 RootLayout（server component）裡。
 * 本身不 render 任何 DOM。
 */
export function VersionCheck() {
  useVersionCheck()
  return null
}
