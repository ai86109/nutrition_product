"use client"

import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { FileText, Settings2 } from "lucide-react"
import { useNoteTemplates } from "@/hooks/useNoteTemplates"
import { useAuth } from "@/contexts/AuthContext"
import NoteTemplateManagerDialog from "@/components/dialogs/note-template-manager-dialog"

interface NoteTemplatePickerProps {
  /** 使用者選了某個範本時呼叫，傳入範本內容（純文字）。 */
  onPick: (content: string) => void
}

/**
 * 顯示在備註 textarea 旁邊的小按鈕：
 * - 未登入：點擊 alert 提示登入
 * - 已登入：開 Popover 列出範本，點擊回呼後關閉；底部有「管理範本」入口
 */
export default function NoteTemplatePicker({ onPick }: NoteTemplatePickerProps) {
  const { isLoggedIn } = useAuth()
  const { templates } = useNoteTemplates()
  const [open, setOpen] = useState(false)
  const [managerOpen, setManagerOpen] = useState(false)

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      alert("此功能請登入後使用")
    }
  }

  const handlePick = (content: string) => {
    onPick(content)
    setOpen(false)
  }

  const openManager = () => {
    setOpen(false)
    setManagerOpen(true)
  }

  return (
    <>
      <Popover open={isLoggedIn && open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleTriggerClick}
          >
            <FileText className="size-3.5" />
            範本
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          {templates.length === 0 ? (
            <div className="space-y-2">
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                尚未建立範本
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={openManager}
              >
                建立第一個範本
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              <ul className="space-y-0.5 max-h-[240px] overflow-y-auto">
                {templates.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => handlePick(t.content)}
                      className="w-full text-left rounded px-2 py-1.5 text-sm hover:bg-muted truncate"
                      title={t.content}
                    >
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-1">
                <button
                  type="button"
                  onClick={openManager}
                  className="w-full flex items-center gap-1.5 rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                >
                  <Settings2 className="size-3.5" />
                  管理範本
                </button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <NoteTemplateManagerDialog
        open={managerOpen}
        onOpenChange={setManagerOpen}
      />
    </>
  )
}
