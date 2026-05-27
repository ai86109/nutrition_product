import { NextResponse } from 'next/server'

/**
 * GET /api/version
 *
 * 回傳目前部署的版本識別字串，前端定期輪詢後與初次載入時的版本比對，
 * 不同就提示使用者重新整理。
 *
 * 來源優先順序：
 *   1. VERCEL_GIT_COMMIT_SHA — Vercel 部署時自動帶入，最直覺好除錯
 *   2. VERCEL_DEPLOYMENT_ID  — 沒接 Git 時的 fallback
 *   3. 'dev'                 — 本地開發；前端會把 'dev' 當作「不檢查」
 *
 * 設為 force-dynamic 確保每次請求都回最新值（避免 build-time 快取住）。
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_DEPLOYMENT_ID ??
    'dev'

  return NextResponse.json(
    { version },
    {
      headers: {
        // 雙保險：避免任何中間層快取
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}
