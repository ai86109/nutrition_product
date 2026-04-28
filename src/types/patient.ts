import type { Gender } from './contexts'

// =====================================================================
// 病人 (patients table)
// =====================================================================
export interface Patient {
  id: string
  user_id: string
  name: string
  gender: Gender
  sort_order: number
  created_at: string
  updated_at: string
}

// =====================================================================
// Snapshot 內的 jsonb 欄位 shape
// =====================================================================

// 生理資訊：身高、體重、年齡、性別。BMI/IBW/ABW 為衍生值，存下來方便日後直接顯示
export interface SnapshotBioInfo {
  height: number | null
  weight: number | null
  age: number | null
  gender: Gender | null
  bmi?: number | null
  ibw?: number | null
  abw?: number | null
}

export interface SnapshotProteinRange {
  min: number | null
  max: number | null
}

// 凍結顯示用的選取營養品資訊（即使原始產品被改名/下架也能正確顯示）
export interface SnapshotSelectedProduct {
  license_no?: string
  product_id: string
  variant_id?: string
  name_zh: string
  name_en?: string
  brand?: string
  form?: string           // powder / liquid / lotion ...
  serving_label: string   // 顯示用：「1罐」「1匙」
  serving_amount: number  // 200, 56 ...
  serving_unit: string    // "ml" / "g"
  quantity: number        // 使用者輸入的份數
}

// =====================================================================
// Snapshot (patient_snapshots table)
// =====================================================================
export interface PatientSnapshot {
  id: string
  patient_id: string
  user_id: string
  bio_info: SnapshotBioInfo
  calorie_target: number | null
  protein_range: SnapshotProteinRange | null
  meals_per_day: number | null
  selected_products: SnapshotSelectedProduct[]
  notes: string | null
  created_at: string
}

// 建立用（id / user_id / created_at 由 server 補）
export type PatientSnapshotInput = Omit<
  PatientSnapshot,
  'id' | 'user_id' | 'created_at'
>

// 給 /patients 頁用：病人 + 該病人的 snapshots
export interface PatientWithSnapshots extends Patient {
  snapshots: PatientSnapshot[]
}
