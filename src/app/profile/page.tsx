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
import { useAuth } from "@/contexts/AuthContext"
import { listMyWishes } from "@/lib/supabase/queries/wishes"
import { listMyProductReports } from "@/lib/supabase/queries/product-reports"
import MyWishesList from "@/components/profile/my-wishes-list"
import MyProductReportsList from "@/components/profile/my-product-reports-list"
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
      listMyWishes(userId),
      listMyProductReports(userId),
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

  return (
    <>
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">個人中心</h1>

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
            </TabsTrigger>
            <TabsTrigger value="wishes">
              許願池
              {wishes.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {wishes.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <MyProductReportsList reports={reports} />
          </TabsContent>

          <TabsContent value="wishes">
            <MyWishesList wishes={wishes} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
