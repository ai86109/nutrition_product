"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Send } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { useUnread } from "@/contexts/UnreadContext"
import {
  listConversationMessagesAdmin,
  listMyConversationMessages,
} from "@/lib/supabase/queries/conversation-messages"
import {
  createAdminConversationMessage,
  createMyConversationMessage,
  markConversationRead,
} from "@/lib/supabase/mutations/conversation-messages"
import MessageBubble from "@/components/conversation/message-bubble"
import type {
  ConversationKind,
  ConversationMessageAdmin,
} from "@/types/conversation"

const MAX_LENGTH = 1000

interface ConversationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: ConversationKind
  id: string
  /** 'user' | 'admin'：決定視角（誰是「我」、走哪個 query/mutation） */
  viewerRole: "user" | "admin"
  /** 對話是否已鎖定（status === 'completed'）。鎖定時禁用輸入。 */
  locked: boolean
  /** 抽屜上方標題（例如「對話：產品 X」或「對話：xxx@example.com」） */
  title: string
  /** 抽屜上方副標題（例如 wish 內容預覽 / 回報內容預覽） */
  subtitle?: string
  /** 抽屜首次開啟並 mark read 後通知 parent 刷新 unread_count */
  onUnreadCleared?: () => void
}

/** 內部用：admin/user 訊息的最小公因數渲染型 */
type DisplayMessage = ConversationMessageAdmin

export default function ConversationSheet({
  open,
  onOpenChange,
  kind,
  id,
  viewerRole,
  locked,
  title,
  subtitle,
  onUnreadCleared,
}: ConversationSheetProps) {
  const { session } = useAuth()
  const { refresh: refreshGlobalUnread } = useUnread()
  const myId = session?.user?.id

  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  // 用 ref 接住可能每 render 都換 reference 的 callback，避免 useEffect 重跑導致 loading 閃爍
  const onUnreadClearedRef = useRef(onUnreadCleared)
  const refreshGlobalUnreadRef = useRef(refreshGlobalUnread)
  useEffect(() => {
    onUnreadClearedRef.current = onUnreadCleared
    refreshGlobalUnreadRef.current = refreshGlobalUnread
  })

  const fetchMessages = useCallback(async () => {
    if (viewerRole === "admin") {
      return listConversationMessagesAdmin(kind, id)
    }
    const list = await listMyConversationMessages(kind, id)
    // user 端沒有 sender_email；補成 null 對齊 DisplayMessage 型別
    return list.map<DisplayMessage>((m) => ({ ...m, sender_email: null }))
  }, [viewerRole, kind, id])

  // 開啟時：fetch + mark read + 通知 parent
  // 依賴只放真正會改變對話身份的 [open, kind, id, viewerRole]；fetchMessages 也只依賴這幾個
  useEffect(() => {
    if (!open) return
    let cancelled = false

    setLoading(true)
    setDraft("")
    fetchMessages()
      .then((list) => {
        if (cancelled) return
        setMessages(list)
      })
      .catch((err) => {
        if (cancelled) return
        console.error(err)
        toast.error("載入訊息失敗，請稍後再試")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    // mark read 與 fetch 並行；失敗不擋使用者
    // 注意：標讀的 server side effect 已經發生，**不**受 cancelled 影響：
    //   即使使用者瞬間關掉 sheet，parent 仍應收到通知去更新 unread_count。
    // 必須傳 viewerRole，server 才知道要更新哪條指針（admin 帳號也可能以 user 視角看自己的對話）。
    markConversationRead(kind, id, viewerRole)
      .then(() => {
        onUnreadClearedRef.current?.()
        refreshGlobalUnreadRef.current()
      })
      .catch((err) => {
        console.error("mark read failed:", err)
      })

    return () => {
      cancelled = true
    }
  }, [open, kind, id, viewerRole, fetchMessages])

  // 訊息變動時自動捲到底
  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (!el) return
    // 等下一個 frame 再捲，確保新訊息已上 DOM
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
  }, [messages, open])

  const trimmedLen = draft.trim().length
  const overLimit = draft.length > MAX_LENGTH
  const canSend =
    !locked && !sending && trimmedLen > 0 && !overLimit && !!myId

  const handleSend = async () => {
    if (!canSend || !myId) return
    setSending(true)
    try {
      if (viewerRole === "admin") {
        await createAdminConversationMessage(kind, id, draft)
      } else {
        await createMyConversationMessage(kind, id, myId, draft)
      }
      setDraft("")
      // 重撈一次（簡單可靠；訊息少不會慢）
      const next = await fetchMessages()
      setMessages(next)
      // 自己送的訊息也算一次「讀過」最新狀態 → 刷新全站未讀數
      refreshGlobalUnreadRef.current()
    } catch (err) {
      console.error(err)
      toast.error("送出失敗，請稍後再試")
    } finally {
      setSending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="truncate">{title}</SheetTitle>
          {subtitle && (
            <SheetDescription className="text-xs whitespace-pre-wrap line-clamp-3">
              {subtitle}
            </SheetDescription>
          )}
        </SheetHeader>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-2/3 ml-auto" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              還沒有任何訊息。{locked ? "" : "在下方輸入第一則訊息吧。"}
            </div>
          ) : (
            messages.map((m) => {
              const isMine =
                viewerRole === "admin"
                  ? m.sender_role === "admin"
                  : m.sender_role === "user"
              const senderLabel =
                viewerRole === "admin"
                  ? m.sender_email ?? "（已刪除帳號）"
                  : "管理員"
              return (
                <MessageBubble
                  key={m.id}
                  isMine={isMine}
                  senderLabel={senderLabel}
                  content={m.content}
                  createdAt={m.created_at}
                />
              )
            })
          )}
        </div>

        <div className="border-t p-3 space-y-2">
          {locked ? (
            <div className="text-center text-xs text-muted-foreground py-2">
              此對話已標記為「已完成」，無法再送出新訊息。
            </div>
          ) : (
            <>
              <textarea
                className="border-input flex w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                placeholder="輸入訊息..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <div className="flex items-center justify-between gap-2">
                <span
                  className={
                    overLimit
                      ? "text-xs text-destructive"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {draft.length} / {MAX_LENGTH}
                </span>
                <Button
                  size="sm"
                  className="cursor-pointer"
                  onClick={handleSend}
                  disabled={!canSend}
                >
                  <Send className="size-4" />
                  {sending ? "送出中..." : "送出"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
