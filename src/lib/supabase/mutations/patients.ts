import { createClient } from '@/utils/supabase/client'
import type { Patient } from '@/types/patient'
import type { Gender } from '@/types'

/**
 * 建立新病人。sort_order 自動接在現有最大值之後。
 * 若同名（UNIQUE(user_id, name)）會 throw，由前端 catch 並提示使用者。
 */
export async function createPatient(
  userId: string,
  name: string,
  gender: Gender,
  birthday: string   // 'YYYY-MM-DD'
): Promise<Patient> {
  const supabase = createClient()

  // 取目前最大的 sort_order
  const { data: maxRow } = await supabase
    .from('patients')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextSortOrder = (maxRow?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('patients')
    .insert({
      user_id: userId,
      name: name.trim(),
      gender,
      birthday,
      sort_order: nextSortOrder,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating patient:', error)
    throw error
  }

  return data
}

/**
 * 更新病人生日
 */
export async function updatePatientBirthday(
  patientId: string,
  birthday: string | null  // 'YYYY-MM-DD' or null to clear
): Promise<Patient> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .update({ birthday })
    .eq('id', patientId)
    .select()
    .single()

  if (error) {
    console.error('Error updating patient birthday:', error)
    throw error
  }

  return data
}

/**
 * 重新命名病人
 */
export async function renamePatient(
  patientId: string,
  name: string
): Promise<Patient> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .update({ name: name.trim() })
    .eq('id', patientId)
    .select()
    .single()

  if (error) {
    console.error('Error renaming patient:', error)
    throw error
  }

  return data
}

/**
 * 刪除病人。底下 snapshots 會 cascade delete（DB 層處理）。
 */
export async function deletePatient(patientId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId)

  if (error) {
    console.error('Error deleting patient:', error)
    throw error
  }
}

/**
 * 批次更新多個病人的 sort_order（前端上下移完後一次寫入）
 */
export async function updatePatientSortOrders(
  updates: Array<{ id: string; sort_order: number }>
): Promise<void> {
  if (updates.length === 0) return

  const supabase = createClient()
  const results = await Promise.all(
    updates.map((u) =>
      supabase
        .from('patients')
        .update({ sort_order: u.sort_order })
        .eq('id', u.id)
    )
  )

  const failures = results.filter((r) => r.error)
  if (failures.length > 0) {
    console.error('Error updating patient sort orders:', failures.map((f) => f.error))
    throw failures[0].error
  }
}
