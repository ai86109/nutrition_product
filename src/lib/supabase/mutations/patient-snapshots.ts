import { createClient } from '@/utils/supabase/client'
import type { PatientSnapshot, PatientSnapshotInput } from '@/types/patient'

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
