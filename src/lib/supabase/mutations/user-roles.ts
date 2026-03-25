import { createClient } from '@/utils/supabase/client'
import type { UserRole } from '@/lib/supabase/queries/user-roles'

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = createClient()

  const { error } = await supabase.rpc('update_user_role', {
    target_user_id: userId,
    new_role: role,
  })

  if (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}
