import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { useUserSetting } from "@/hooks/useUserSetting"
import type { NoteTemplate } from "@/types/note-template"

/**
 * 使用者自訂備註模板的 CRUD hook。
 * - 寫入透過 useUserSetting.updateSetting → upsertUserPreferences
 * - 未登入時 updateSetting 會自己 alert（沿用現有 pattern）
 */
export function useNoteTemplates() {
  const { noteTemplates } = useUserPreferences()
  const { updateSetting } = useUserSetting()

  const nextSortOrder = () =>
    noteTemplates.length === 0
      ? 0
      : Math.max(...noteTemplates.map((t) => t.sort_order)) + 1

  const addTemplate = async (title: string, content: string) => {
    const newTemplate: NoteTemplate = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: title.trim(),
      content,
      sort_order: nextSortOrder(),
    }
    await updateSetting("noteTemplates", [...noteTemplates, newTemplate])
  }

  const updateTemplate = async (
    id: string,
    patch: { title?: string; content?: string }
  ) => {
    const next = noteTemplates.map((t) =>
      t.id === id
        ? {
            ...t,
            ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
            ...(patch.content !== undefined ? { content: patch.content } : {}),
          }
        : t
    )
    await updateSetting("noteTemplates", next)
  }

  const removeTemplate = async (id: string) => {
    const next = noteTemplates.filter((t) => t.id !== id)
    await updateSetting("noteTemplates", next)
  }

  return {
    templates: noteTemplates,
    addTemplate,
    updateTemplate,
    removeTemplate,
  }
}
