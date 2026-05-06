import { createClient } from '@/utils/supabase/client'
import type { PatientGroup } from '@/types/patient-group'

/**
 * 建立新群組。sort_order 自動接在現有最大值之後。
 * 同名（UNIQUE(user_id, name)）會 throw（PG code 23505），由前端 catch。
 */
export async function createPatientGroup(
  userId: string,
  name: string
): Promise<PatientGroup> {
  const supabase = createClient()

  const { data: maxRow } = await supabase
    .from('patient_groups')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextSortOrder = (maxRow?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('patient_groups')
    .insert({
      user_id: userId,
      name: name.trim(),
      sort_order: nextSortOrder,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating patient group:', error)
    throw error
  }

  return data
}

/**
 * 重新命名群組
 */
export async function renamePatientGroup(
  groupId: string,
  name: string
): Promise<PatientGroup> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patient_groups')
    .update({ name: name.trim() })
    .eq('id', groupId)
    .select()
    .single()

  if (error) {
    console.error('Error renaming patient group:', error)
    throw error
  }

  return data
}

/**
 * 刪除群組（memberships 由 DB cascade 清掉）
 */
export async function deletePatientGroup(groupId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('patient_groups')
    .delete()
    .eq('id', groupId)

  if (error) {
    console.error('Error deleting patient group:', error)
    throw error
  }
}

/**
 * 把病人加入群組。若已加入則無動作（用 upsert 避免 PK 衝突）。
 */
export async function addPatientToGroup(
  patientId: string,
  groupId: string
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('patient_group_memberships')
    .upsert(
      { patient_id: patientId, group_id: groupId },
      { onConflict: 'patient_id,group_id', ignoreDuplicates: true }
    )

  if (error) {
    console.error('Error adding patient to group:', error)
    throw error
  }
}

/**
 * 把病人從群組移除（若不存在亦不會錯）
 */
export async function removePatientFromGroup(
  patientId: string,
  groupId: string
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('patient_group_memberships')
    .delete()
    .eq('patient_id', patientId)
    .eq('group_id', groupId)

  if (error) {
    console.error('Error removing patient from group:', error)
    throw error
  }
}
