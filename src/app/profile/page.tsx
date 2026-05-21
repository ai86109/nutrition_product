"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { listMyWishes } from "@/lib/supabase/queries/wishes"
import { listMyProductReports } from "@/lib/supabase/queries/product-reports"
import MyWishesList from "@/components/profile/my-wishes-list"
import MyProductReportsList from "@/components/profile/my-product-reports-list"
import MyCustomProductsList from "@/components/profile/my-custom-products-list"
import type { MyWish } from "@/types/wish"
import type { MyProductReport } from "@/types/product-report"

type ProfileTab = "reports" | "wishes"

export default function ProfilePage() {
  const { session, loading: authLoading, isLoggedIn } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<ProfileTab>("reports")
  const [wishes, setWishes] = useState<MyWish[]>([])
  const [reports, setReports] = useState<MyProductReport[]>([])
  const [loading, setLoading] = useState(true)

  // 未登入導去 /auth（與 /patients 一致的 pattern）
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace("/auth")
    }
  }, [authLoading, isLoggedIn, router])

  const userId = session?.user?.id

  const reload = useCallback(async () => {
    if (!userId) return
    const [w, r] = await Promise.all([
      listMyWishes(),
      listMyProductReports(),
    ])
    setWishes(w)
    setReports(r)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    reload().finally(() => setLoading(false))
  }, [userId, reload])

  if (authLoading || loading) {
    return (
      <>
        <Navigation />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">個人中心</h1>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </>
    )
  }

  if (!isLoggedIn) return null

  // tab 上的未讀數 = 該類型所有 ticket 的 unread_count 加總
  const reportsUnread = reports.reduce((sum, r) => sum + r.unread_count, 0)
  const wishesUnread = wishes.reduce((sum, w) => sum + w.unread_count, 0)

  // optimistic：開啟對話 sheet 並標讀後，立即把該筆 unread_count 設為 0
  // （不等 reload round-trip）
  const markReportRead = (id: string) =>
    setReports((list) =>
      list.map((r) => (r.id === id ? { ...r, unread_count: 0 } : r)),
    )
  const markWishRead = (id: string) =>
    setWishes((list) =>
      list.map((w) => (w.id === id ? { ...w, unread_count: 0 } : w)),
    )

  return (
    <>
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">個人中心</h1>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-bold">自訂營養品</h2>
            <p className="text-sm text-muted-foreground">
              建立未收錄或自家配方的營養品，可在搜尋、計算與收藏中使用。
            </p>
          </div>
          <MyCustomProductsList />
        </section>

        <Separator className="my-6" />

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as ProfileTab)}
          className="flex flex-col gap-4"
        >
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="reports">
              已回報的問題
              {reports.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {reports.length}
                </Badge>
              )}
              {reportsUnread > 0 && (
                <span
                  className="ml-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-[18px] text-center"
                  aria-label={`${reportsUnread} 則未讀`}
                >
                  {reportsUnread > 99 ? "99+" : reportsUnread}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="wishes">
              許願池
              {wishes.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {wishes.length}
                </Badge>
              )}
              {wishesUnread > 0 && (
                <span
                  className="ml-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-[18px] text-center"
                  aria-label={`${wishesUnread} 則未讀`}
                >
                  {wishesUnread > 99 ? "99+" : wishesUnread}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <MyProductReportsList
              reports={reports}
              onMarkRead={markReportRead}
            />
          </TabsContent>

          <TabsContent value="wishes">
            <MyWishesList wishes={wishes} onMarkRead={markWishRead} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
