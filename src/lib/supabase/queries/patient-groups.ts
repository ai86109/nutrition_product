import { createClient } from '@/utils/supabase/client'
import type { GroupMembershipMap, PatientGroup } from '@/types/patient-group'

/**
 * 取得使用者所有的群組，按 sort_order asc, created_at asc。
 */
export async function getPatientGroups(userId: string): Promise<PatientGroup[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patient_groups')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching patient groups:', error)
    return []
  }

  return data ?? []
}

/**
 * 一次取出該使用者所有 memberships，回傳 { [patientId]: groupId[] } 方便前端 join。
 *
 * RLS：membership 的 select 限制是 patient.user_id = auth.uid()，
 *      所以這裡不需要再用 user_id 過濾——但仍 join patients 以得到歸屬資訊。
 */
export async function getGroupMembershipsByUser(
  userId: string
): Promise<GroupMembershipMap> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patient_group_memberships')
    .select('patient_id, group_id, patients!inner(user_id)')
    .eq('patients.user_id', userId)

  if (error) {
    console.error('Error fetching group memberships:', error)
    return {}
  }

  const map: GroupMembershipMap = {}
  for (const row of data ?? []) {
    const r = row as { patient_id: string; group_id: string }
    if (!map[r.patient_id]) map[r.patient_id] = []
    map[r.patient_id].push(r.group_id)
  }
  return map
}
