import { createClient } from '@/utils/supabase/client'
import type { PatientSnapshot } from '@/types/patient'
import { compareByEffectiveDateDesc } from '@/lib/snapshot-date'

/**
 * 單一病人的 snapshots，依 effective date 由新到舊。
 *
 * Server-side 先以 created_at desc 拉資料（Supabase JS 不支援 COALESCE 排序），
 * client-side 用 stable sort 重排成 effective date desc，
 * 同日的 created_at 順序由原本的 desc 保留下來當 tiebreaker。
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

  const snapshots = (data ?? []) as PatientSnapshot[]
  return [...snapshots].sort(compareByEffectiveDateDesc)
}

/**
 * 使用者所有 snapshots（給 /patients 頁一次撈，前端再分組到對應病人）。
 * 排序邏輯同上。
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

  const snapshots = (data ?? []) as PatientSnapshot[]
  return [...snapshots].sort(compareByEffectiveDateDesc)
}
