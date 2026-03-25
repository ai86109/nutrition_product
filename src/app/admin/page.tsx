import { requireAdmin } from '@/lib/admin'
import { getAdminUserList } from '@/lib/supabase/queries/user-roles'
import AdminUserTable from '@/components/admin/admin-user-table'

export default async function AdminPage() {
  const session = await requireAdmin()
  const users = await getAdminUserList()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">會員管理</h2>
        <p className="text-muted-foreground">管理用戶的會員等級與權限</p>
      </div>
      <AdminUserTable users={users} currentUserId={session.user.id} />
    </div>
  )
}
