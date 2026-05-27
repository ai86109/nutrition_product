import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Next.js middleware
 *
 * 兩個職責：
 *   1. Refresh Supabase auth session（server-side cookie），這是
 *      @supabase/ssr 官方建議要做的事。原本專案沒做，順手補上。
 *   2. 在登入狀態下，呼叫 record_user_activity RPC，記錄使用者
 *      今日活躍。RPC 內含 1 分鐘 throttle，所以可以放心每個
 *      request 都打。
 *
 * 注意：使用者大部分時間在主頁面內操作，Supabase 查詢直接打
 *      supabase.co 不會經過這支 middleware，所以光靠這裡只能抓
 *      到「初次載入 / 路由切換」。完整活躍紀錄要靠
 *      src/hooks/useActivityHeartbeat.ts client 端 heartbeat
 *      （1 分鐘間隔 + visibility-aware）。
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1) Session refresh
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2) 活動紀錄（只在登入狀態下；失敗不影響 request）
  if (user) {
    try {
      await supabase.rpc('record_user_activity')
    } catch (err) {
      // RPC 失敗（網路、權限、DB 暫時不可用）不應該擋住使用者請求
      console.error('record_user_activity failed:', err)
    }
  }

  return response
}

/**
 * Matcher：排除靜態資源、圖片、favicon、Next.js 內部路徑。
 * - 不排除 /auth/callback，因為登入完成後本來就會走到這支 middleware
 *   並立刻記下當天第一筆活動，這個行為是我們要的。
 * - 不排除 /api/*，目前 NutriBase 的 API route 用得很少且都是登入後
 *   操作，順便算進活躍紀錄沒問題。
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
