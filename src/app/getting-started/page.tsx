import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listPublishedTutorials } from "@/lib/supabase/queries/tutorials"

export const metadata: Metadata = {
  title: "新手上路",
  description: "NutriBase 功能教學，協助營養師快速上手產品查詢、計算與比較。",
}

export const dynamic = "force-dynamic"

export default async function GettingStartedPage() {
  const tutorials = await listPublishedTutorials()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">新手上路</CardTitle>
        </CardHeader>
        <CardContent className="text-sm sm:text-base text-gray-700 leading-relaxed">
          <p className="mb-6">
            以下是此網站的功能教學文章，持續更新中。
          </p>

          {tutorials.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              （目前尚無教學文章）
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tutorials.map((tutorial) => (
                <li key={tutorial.id}>
                  <a
                    href={tutorial.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                        {tutorial.title}
                        <ExternalLink className="size-4 text-gray-500" />
                      </div>
                      {tutorial.description && (
                        <p className="mt-1 text-sm text-gray-600">{tutorial.description}</p>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 pt-4 border-t flex justify-end text-xs sm:text-sm text-gray-500">
            <Link
              href="/"
              className="hover:text-gray-900 hover:underline underline-offset-2"
            >
              ← 返回首頁
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
