import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "NutriBase 隱私權政策。",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">隱私權政策</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-3">
          <p>本頁內容準備中。完整版隱私權政策將於正式上線前公告。</p>
          <p>
            <Link
              href="/"
              className="underline underline-offset-2 hover:text-gray-900"
            >
              ← 返回首頁
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
