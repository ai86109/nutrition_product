import { toast } from "sonner"
import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { useUserSetting } from "@/hooks/useUserSetting"
import { MAX_NOTE_TEMPLATES } from "@/utils/constants"
import type { NoteTemplate } from "@/types/note-template"

/**
 * 使用者自訂備註模板的 CRUD hook。
 * - 寫入透過 useUserSetting.updateSetting → upsertUserPreferences
 * - 未登入時 updateSetting 會自己 alert（沿用現有 pattern）
 * - 成功 / cap 達標皆在 hook 內 toast；DB 失敗讓 caller 接 catch 自行處理
 */
export function useNoteTemplates() {
  const { noteTemplates } = useUserPreferences()
  const { updateSetting } = useUserSetting()

  const nextSortOrder = () =>
    noteTemplates.length === 0
      ? 0
      : Math.max(...noteTemplates.map((t) => t.sort_order)) + 1

  /** 回傳 true=成功；false=被 cap 擋下（已 toast，caller 不需重複提示） */
  const addTemplate = async (
    title: string,
    content: string
  ): Promise<boolean> => {
    if (noteTemplates.length >= MAX_NOTE_TEMPLATES) {
      toast.error(
        `備註模板已達上限 ${MAX_NOTE_TEMPLATES} 筆，請先移除其他模板`
      )
      return false
    }

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
    toast.success("已新增模板")
    return true
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
    toast.success("已更新模板")
  }

  const removeTemplate = async (id: string) => {
    const next = noteTemplates.filter((t) => t.id !== id)
    await updateSetting("noteTemplates", next)
    toast.success("已刪除模板")
  }

  return {
    templates: noteTemplates,
    addTemplate,
    updateTemplate,
    removeTemplate,
  }
}
