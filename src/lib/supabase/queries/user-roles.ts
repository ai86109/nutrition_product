import { createClient } from '@/utils/supabase/client'
import { createClientForServer } from '@/utils/supabase/server'

export type UserRole = 'admin' | 'premium' | 'member'

export interface AdminUserListItem {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
  last_sign_in_at: string | null
  role: UserRole
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user role:', error)
    return 'member'
  }

  return data.role as UserRole
}

export async function getAdminUserList(): Promise<AdminUserListItem[]> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('get_admin_user_list')

  if (error) {
    console.error('Error fetching admin user list:', error)
    return []
  }

  return data as AdminUserListItem[]
}
