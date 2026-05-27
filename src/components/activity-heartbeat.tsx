'use client'

import { useActivityHeartbeat } from '@/hooks/useActivityHeartbeat'

/**
 * 用來讓 useActivityHeartbeat 能掛在 RootLayout（server component）裡。
 * 本身不 render 任何 DOM。
 */
export function ActivityHeartbeat() {
  useActivityHeartbeat()
  return null
}
