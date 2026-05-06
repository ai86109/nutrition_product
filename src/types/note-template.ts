/**
 * 使用者自訂的備註模板。
 * 存於 user_preferences.note_templates (jsonb 陣列)。
 */
export type NoteTemplate = {
  id: string
  title: string
  content: string
  sort_order: number
}
