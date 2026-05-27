'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

const HEARTBEAT_INTERVAL_MS = 1 * 60 * 1000 // 1 分鐘（與 DB throttle 對齊）

/**
 * useActivityHeartbeat
 *
 * 在登入狀態下，定期呼叫 record_user_activity RPC，補足 middleware
 * 抓不到的「使用者一直停在主頁面內 client-side 操作」的情境。
 *
 * 行為：
 *   - 只有 tab visible 且使用者已登入時才會打。
 *   - 登入後立刻打一次（拿到使用者第一次活動時間）。
 *   - 之後每 1 分鐘打一次。
 *   - 從隱藏切回顯示時補打一次（接續中斷的記錄）。
 *
 * Heartbeat 間隔與 DB throttle 對齊（都是 1 分鐘），這樣 hit_count
 * 約等於「該日活躍的 1 分鐘區段數」，乘以 1 分鐘就是估計活躍時間。
 * 失敗只 console.error，不影響使用者操作。
 */
export function useActivityHeartbeat() {
  const { isLoggedIn } = useAuth()
  // 用 ref 保證 effect 內取到最新值，但不會因為值變化重跑 effect
  const isLoggedInRef = useRef(isLoggedIn)
  isLoggedInRef.current = isLoggedIn

  useEffect(() => {
    if (!isLoggedIn) return

    const supabase = createClient()
    let intervalId: ReturnType<typeof setInterval> | null = null

    const ping = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      if (!isLoggedInRef.current) return
      try {
        await supabase.rpc('record_user_activity')
      } catch (err) {
        console.error('record_user_activity heartbeat failed:', err)
      }
    }

    const start = () => {
      if (intervalId !== null) return
      ping()
      intervalId = setInterval(ping, HEARTBEAT_INTERVAL_MS)
    }

    const stop = () => {
      if (intervalId === null) return
      clearInterval(intervalId)
      intervalId = null
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 從背景回來：補打一次並重啟 interval
        start()
      } else {
        // 進背景：停掉 interval，省掉沒意義的 RPC
        stop()
      }
    }

    // 初次掛載：visible 才啟動
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      start()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [isLoggedIn])
}
