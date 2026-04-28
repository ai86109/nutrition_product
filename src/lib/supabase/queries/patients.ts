import { createClient } from '@/utils/supabase/client'
import type { Patient } from '@/types/patient'

/**
 * 取得使用者所有的病人，按使用者自訂排序（sort_order asc, created_at asc）
 */
export async function getPatients(userId: string): Promise<Patient[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching patients:', error)
    return []
  }

  return data ?? []
}
