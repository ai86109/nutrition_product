"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  getAdminTotalUnreadCount,
  getMyTotalUnreadCount,
} from "@/lib/supabase/queries/conversation-messages"

interface UnreadContextValue {
  /** 一般使用者未讀總數（admin 寫給自己的） */
  myUnread: number
  /** Admin 未讀總數（user 寫給 admin 的） */
  adminUnread: number
  /** 立即重新 fetch 兩個未讀數（fire-and-forget；可在 markRead 後 call） */
  refresh: () => void
}

const UnreadContext = createContext<UnreadContextValue | undefined>(undefined)

/**
 * 全站共用：使用者 / Admin 的未讀訊息總數。
 * - 登入時會在掛載時 fetch 一次；身份切換時會自動重抓。
 * - 提供 refresh()，當 ConversationSheet 標記某對話已讀後可呼叫，立即更新 nav 紅點。
 * - 不做 polling（避免耗資源）；之後若要上 realtime 再從這裡接。
 */
export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, role } = useAuth()
  const isAdmin = role === "admin"

  const [myUnread, setMyUnread] = useState(0)
  const [adminUnread, setAdminUnread] = useState(0)

  const refresh = useCallback(() => {
    if (!isLoggedIn) {
      setMyUnread(0)
      setAdminUnread(0)
      return
    }
    getMyTotalUnreadCount()
      .then(setMyUnread)
      .catch((err) => console.error("refresh myUnread failed", err))
    if (isAdmin) {
      getAdminTotalUnreadCount()
        .then(setAdminUnread)
        .catch((err) => console.error("refresh adminUnread failed", err))
    } else {
      setAdminUnread(0)
    }
  }, [isLoggedIn, isAdmin])

  // 登入狀態 / 角色變動時重抓
  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo<UnreadContextValue>(
    () => ({ myUnread, adminUnread, refresh }),
    [myUnread, adminUnread, refresh],
  )

  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>
}

export function useUnread() {
  const ctx = useContext(UnreadContext)
  if (ctx === undefined) {
    throw new Error("useUnread must be used within a UnreadProvider")
  }
  return ctx
}
