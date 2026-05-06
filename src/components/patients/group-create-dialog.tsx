"use client"

import { useEffect, useState } from "react"
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
import { useAuth } from "@/contexts/AuthContext"
import {
  addPatientToGroup,
  createPatientGroup,
} from "@/lib/supabase/mutations/patient-groups"

interface GroupCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 若有指定，新增成功後會把該病人自動加入新群組 */
  autoAssignPatientId?: string
  onCreated: () => void
}

export default function GroupCreateDialog({
  open,
  onOpenChange,
  autoAssignPatientId,
  onCreated,
}: GroupCreateDialogProps) {
  const { session } = useAuth()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName("")
      setError(null)
    }
  }, [open])

  const handleSave = async () => {
    const userId = session?.user?.id
    if (!userId) return

    const trimmed = name.trim()
    if (!trimmed) {
      setError("請輸入群組名稱")
      return
    }

    setSaving(true)
    try {
      const created = await createPatientGroup(userId, trimmed)
      if (autoAssignPatientId) {
        await addPatientToGroup(autoAssignPatientId, created.id)
      }
      onCreated()
      onOpenChange(false)
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === "23505") {
        setError("已存在同名群組")
      } else {
        setError("新增群組失敗，請稍後再試")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>新增群組</DialogTitle>
          <DialogDescription>
            {autoAssignPatientId
              ? "建立後會把此病人加入新群組"
              : "建立一個新的病人群組"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="group-create-name">群組名稱</Label>
          <Input
            id="group-create-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            placeholder="例如：糖尿病、洗腎、住院"
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "建立中..." : "建立"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
