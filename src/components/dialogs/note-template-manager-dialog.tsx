"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Pencil, Trash2, Plus, X, Check } from "lucide-react"
import { useNoteTemplates } from "@/hooks/useNoteTemplates"
import { useAuth } from "@/contexts/AuthContext"
import {
  MAX_NOTE_TEMPLATE_TITLE_LENGTH,
  MAX_NOTE_TEMPLATE_CONTENT_LENGTH,
} from "@/utils/constants"
import { cn } from "@/lib/utils"
import type { NoteTemplate } from "@/types/note-template"

interface NoteTemplateManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type DraftMode =
  | { kind: "idle" }
  | { kind: "creating"; title: string; content: string }
  | { kind: "editing"; id: string; title: string; content: string }

export default function NoteTemplateManagerDialog({
  open,
  onOpenChange,
}: NoteTemplateManagerDialogProps) {
  const { isLoggedIn } = useAuth()
  const { templates, addTemplate, updateTemplate, removeTemplate } =
    useNoteTemplates()

  const [draft, setDraft] = useState<DraftMode>({ kind: "idle" })
  const [saving, setSaving] = useState(false)

  const resetDraft = () => setDraft({ kind: "idle" })

  const handleStartCreate = () => {
    setDraft({ kind: "creating", title: "", content: "" })
  }

  const handleStartEdit = (t: NoteTemplate) => {
    setDraft({ kind: "editing", id: t.id, title: t.title, content: t.content })
  }

  const handleDraftSave = async () => {
    if (draft.kind === "idle") return
    const title = draft.title.trim()
    const content = draft.content
    if (title === "") {
      toast.error("請輸入範本標題")
      return
    }
    if (content.trim() === "") {
      toast.error("請輸入範本內容")
      return
    }
    if (title.length > MAX_NOTE_TEMPLATE_TITLE_LENGTH) {
      toast.error(`標題請控制在 ${MAX_NOTE_TEMPLATE_TITLE_LENGTH} 字以內`)
      return
    }
    if (content.length > MAX_NOTE_TEMPLATE_CONTENT_LENGTH) {
      toast.error(`內容請控制在 ${MAX_NOTE_TEMPLATE_CONTENT_LENGTH} 字以內`)
      return
    }
    setSaving(true)
    try {
      if (draft.kind === "creating") {
        const ok = await addTemplate(title, content)
        if (!ok) return // cap 已擋下，hook 內已 toast
      } else {
        await updateTemplate(draft.id, { title, content })
      }
      resetDraft()
    } catch (err) {
      console.error(err)
      toast.error("儲存失敗，請稍後再試")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (t: NoteTemplate) => {
    if (!confirm(`確定要刪除範本「${t.title}」？`)) return
    try {
      await removeTemplate(t.id)
    } catch (err) {
      console.error(err)
      toast.error("刪除失敗，請稍後再試")
    }
  }

  const handleDialogChange = (next: boolean) => {
    if (!next) resetDraft()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>管理備註範本</DialogTitle>
          <DialogDescription>
            建立常用的備註模板，需要時可一鍵附加到備註欄位。
          </DialogDescription>
        </DialogHeader>

        {!isLoggedIn ? (
          <p className="rounded-md bg-muted/50 px-3 py-4 text-sm text-center text-muted-foreground">
            此功能請登入後使用
          </p>
        ) : (
          <div className="space-y-3">
            {/* 範本列表 */}
            {templates.length === 0 && draft.kind === "idle" ? (
              <p className="rounded-md bg-muted/50 px-3 py-4 text-sm text-center text-muted-foreground">
                尚未建立範本
              </p>
            ) : (
              <ul className="space-y-2">
                {templates.map((t) => {
                  const isEditingThis =
                    draft.kind === "editing" && draft.id === t.id
                  if (isEditingThis) {
                    const titleOver =
                      draft.title.length > MAX_NOTE_TEMPLATE_TITLE_LENGTH
                    const contentOver =
                      draft.content.length > MAX_NOTE_TEMPLATE_CONTENT_LENGTH
                    return (
                      <li
                        key={t.id}
                        className="rounded-md border bg-muted/30 p-3 space-y-2"
                      >
                        <Input
                          placeholder="範本標題"
                          value={draft.title}
                          onChange={(e) =>
                            setDraft({ ...draft, title: e.target.value })
                          }
                          maxLength={MAX_NOTE_TEMPLATE_TITLE_LENGTH + 10}
                          autoFocus
                        />
                        <textarea
                          className="border-input flex w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                          placeholder="範本內容"
                          value={draft.content}
                          onChange={(e) =>
                            setDraft({ ...draft, content: e.target.value })
                          }
                          maxLength={MAX_NOTE_TEMPLATE_CONTENT_LENGTH + 10}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className={cn(titleOver && "text-destructive")}>
                            標題 {draft.title.length} /{" "}
                            {MAX_NOTE_TEMPLATE_TITLE_LENGTH}
                          </span>
                          <span
                            className={cn(contentOver && "text-destructive")}
                          >
                            內容 {draft.content.length} /{" "}
                            {MAX_NOTE_TEMPLATE_CONTENT_LENGTH}
                          </span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetDraft}
                            disabled={saving}
                          >
                            <X className="size-3.5" />
                            取消
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleDraftSave}
                            disabled={saving}
                          >
                            <Check className="size-3.5" />
                            {saving ? "儲存中..." : "儲存"}
                          </Button>
                        </div>
                      </li>
                    )
                  }
                  return (
                    <li
                      key={t.id}
                      className="rounded-md border bg-background px-3 py-2 flex items-start gap-2"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-sm font-medium truncate">
                          {t.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                          {t.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleStartEdit(t)}
                          disabled={draft.kind !== "idle"}
                          aria-label="編輯"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(t)}
                          disabled={draft.kind !== "idle"}
                          aria-label="刪除"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* 新增表單 */}
            {draft.kind === "creating" ? (
              <>
                <Separator />
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <Label className="text-sm font-bold">新增範本</Label>
                  <Input
                    placeholder="範本標題（例：進食量不佳）"
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                    maxLength={MAX_NOTE_TEMPLATE_TITLE_LENGTH + 10}
                    autoFocus
                  />
                  <textarea
                    className="border-input flex w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    placeholder="範本內容"
                    value={draft.content}
                    onChange={(e) =>
                      setDraft({ ...draft, content: e.target.value })
                    }
                    maxLength={MAX_NOTE_TEMPLATE_CONTENT_LENGTH + 10}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span
                      className={cn(
                        draft.title.length >
                          MAX_NOTE_TEMPLATE_TITLE_LENGTH &&
                          "text-destructive"
                      )}
                    >
                      標題 {draft.title.length} /{" "}
                      {MAX_NOTE_TEMPLATE_TITLE_LENGTH}
                    </span>
                    <span
                      className={cn(
                        draft.content.length >
                          MAX_NOTE_TEMPLATE_CONTENT_LENGTH &&
                          "text-destructive"
                      )}
                    >
                      內容 {draft.content.length} /{" "}
                      {MAX_NOTE_TEMPLATE_CONTENT_LENGTH}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetDraft}
                      disabled={saving}
                    >
                      <X className="size-3.5" />
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDraftSave}
                      disabled={saving}
                    >
                      <Check className="size-3.5" />
                      {saving ? "儲存中..." : "新增"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              draft.kind === "idle" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleStartCreate}
                >
                  <Plus className="size-3.5" />
                  新增範本
                </Button>
              )
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleDialogChange(false)}>
            關閉
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
