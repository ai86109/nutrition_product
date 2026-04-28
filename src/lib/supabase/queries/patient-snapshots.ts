import { createClient } from '@/utils/supabase/client'
import type { PatientSnapshot } from '@/types/patient'

/**
 * 單一病人的 snapshots，最新在最上
 */
export async function getSnapshotsByPatient(
  patientId: string
): Promise<PatientSnapshot[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patient_snapshots')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching snapshots:', error)
    return []
  }

  return (data ?? []) as PatientSnapshot[]
}

/**
 * 使用者所有 snapshots（給 /patients 頁一次撈，前端再分組到對應病人）
 */
export async function getAllSnapshotsByUser(
  userId: string
): Promise<PatientSnapshot[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patient_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching snapshots:', error)
    return []
  }

  return (data ?? []) as PatientSnapshot[]
}
