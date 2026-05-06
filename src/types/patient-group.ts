// =====================================================================
// 病人群組（patient_groups + patient_group_memberships）
// =====================================================================

export interface PatientGroup {
  id: string
  user_id: string
  name: string
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * 一次撈出整個使用者底下所有 memberships 後，前端 join 用的 map：
 *   { [patientId]: groupId[] }
 */
export type GroupMembershipMap = Record<string, string[]>
