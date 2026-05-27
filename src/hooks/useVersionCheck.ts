'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const VERSION_ENDPOINT = '/api/version'
const POLL_INTERVAL_MS = 10 * 60 * 1000 // 10 分鐘
const TOAST_ID = 'app-version-update' // 固定 id 避免重複跳
const DEV_VERSION = 'dev'

type VersionResponse = { version: string }

async function fetchVersion(): Promise<string | null> {
  try {
    const res = await fetch(VERSION_ENDPOINT, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as VersionResponse
    return typeof data.version === 'string' ? data.version : null
  } catch {
    return null
  }
}

function showUpdateToast() {
  toast.info('有新版本可以使用', {
    id: TOAST_ID,
    description: '建議重新整理以套用最新功能與修正',
    duration: Infinity,
    action: {
      label: '重新整理',
      onClick: () => window.location.reload(),
    },
    cancel: {
      label: '稍後',
      onClick: () => toast.dismiss(TOAST_ID),
    },
  })
}

/**
 * useVersionCheck
 *
 * 偵測前端 bundle 與目前部署版本不一致，提示使用者重新整理。
 *
 * 策略：
 *   - 初次掛載：fetch /api/version，記下「載入當下」的版本
 *   - 之後每 10 分鐘輪詢一次；切回分頁 (visibilitychange visible) 也補一次
 *   - 拿到的版本與初次不同 → 跳 sonner toast（含「重新整理」/「稍後」）
 *   - 兜底：監聽 ChunkLoadError，若舊 client 嘗試載入新部署刪掉的 chunk，
 *           也立即提示（被動 fallback，用在輪詢間隔內就剛好發生部署的情境）
 *
 * 本地開發 (version === 'dev')：略過所有檢查，避免熱重載時亂跳 toast。
 */
export function useVersionCheck() {
  // 用 ref 紀錄「初次載入的版本」，避免之後重 render 改變比對基準
  const initialVersionRef = useRef<string | null>(null)
  // 已經提示過就不要再打 API、不要再跳 toast
  const notifiedRef = useRef(false)

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    let cancelled = false

    const check = async () => {
      if (cancelled || notifiedRef.current) return
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return

      const current = await fetchVersion()
      if (cancelled || current === null) return

      // 本地 dev:不檢查
      if (current === DEV_VERSION) return

      if (initialVersionRef.current === null) {
        initialVersionRef.current = current
        return
      }

      if (current !== initialVersionRef.current) {
        notifiedRef.current = true
        showUpdateToast()
        stop()
      }
    }

    const start = () => {
      if (intervalId !== null) return
      intervalId = setInterval(check, POLL_INTERVAL_MS)
    }

    const stop = () => {
      if (intervalId === null) return
      clearInterval(intervalId)
      intervalId = null
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        check()
        start()
      } else {
        stop()
      }
    }

    // ChunkLoadError 兜底:舊 client 拿不到新部署刪掉的 chunk 時觸發
    const onError = (event: ErrorEvent) => {
      if (notifiedRef.current) return
      const name = event.error?.name
      const message = event.message ?? ''
      if (name === 'ChunkLoadError' || /Loading chunk [\w-]+ failed/i.test(message)) {
        notifiedRef.current = true
        showUpdateToast()
        stop()
      }
    }

    // 初次:先記版本
    check()
    start()
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('error', onError)

    return () => {
      cancelled = true
      stop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('error', onError)
    }
  }, [])
}
