import { requireAdmin } from '@/lib/admin'
import Link from 'next/link'
import AdminSidebar from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top header */}
      <header className="bg-white border-b shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">管理後台</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← 返回首頁
          </Link>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
