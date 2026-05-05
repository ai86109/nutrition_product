import { createClient } from '@/utils/supabase/client'
import type { PatientSnapshot, PatientSnapshotInput, SnapshotBioInfo, SnapshotCalorieRange, SnapshotProteinRange, SnapshotSelectedProduct } from '@/types/patient'

export interface SnapshotEditableFields {
  bio_info: SnapshotBioInfo
  calorie_range: SnapshotCalorieRange | null
  protein_range: SnapshotProteinRange | null
  meals_per_day: number | null
  actual_calorie: number | null
  actual_protein: number | null
  selected_products: SnapshotSelectedProduct[]
}

/**
 * 建立新的 snapshot。snapshot 設計上不可編輯（DB 層也不開放 UPDATE policy）。
 */
export async function createPatientSnapshot(
  userId: string,
  input: PatientSnapshotInput
): Promise<PatientSnapshot> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('patient_snapshots')
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating snapshot:', error)
    throw error
  }

  return data as PatientSnapshot
}

/**
 * 更新 snapshot 的生理資訊、每日目標、營養品。
 * UPDATE policy 已由 snapshot_notes_editable migration 開放。
 */
export async function updatePatientSnapshot(
  snapshotId: string,
  fields: SnapshotEditableFields
): Promise<PatientSnapshot> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patient_snapshots')
    .update(fields)
    .eq('id', snapshotId)
    .select()
    .single()

  if (error) {
    console.error('Error updating snapshot:', error)
    throw error
  }

  return data as PatientSnapshot
}

/**
 * 刪除 snapshot
 */
export async function deletePatientSnapshot(snapshotId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('patient_snapshots')
    .delete()
    .eq('id', snapshotId)

  if (error) {
    console.error('Error deleting snapshot:', error)
    throw error
  }
}

/**
 * 更新 snapshot 的備註欄位。
 * 設計上 snapshot 其他欄位仍視為凍結，因此這個 mutation 只更新 notes。
 */
export async function updatePatientSnapshotNotes(
  snapshotId: string,
  notes: string | null
): Promise<PatientSnapshot> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patient_snapshots')
    .update({ notes })
    .eq('id', snapshotId)
    .select()
    .single()

  if (error) {
    console.error('Error updating snapshot notes:', error)
    throw error
  }

  return data as PatientSnapshot
}

/**
 * 更新 snapshot 的使用者指定日期 (snapshot_date)。
 *
 * - date 是 YYYY-MM-DD：覆寫顯示與排序日期
 * - date 為 null：清空，回到 created_at 為基準
 *
 * 呼叫端應該檢查 date 不晚於今天（UI 層的 max 限制）。
 */
export async function updatePatientSnapshotDate(
  snapshotId: string,
  date: string | null
): Promise<PatientSnapshot> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patient_snapshots')
    .update({ snapshot_date: date })
    .eq('id', snapshotId)
    .select()
    .single()

  if (error) {
    console.error('Error updating snapshot date:', error)
    throw error
  }

  return data as PatientSnapshot
}
