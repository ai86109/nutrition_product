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
import { renamePatient } from "@/lib/supabase/mutations/patients"

interface RenamePatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  currentName: string
  onRenamed: () => void
}

export default function RenamePatientDialog({
  open,
  onOpenChange,
  patientId,
  currentName,
  onRenamed,
}: RenamePatientDialogProps) {
  const [name, setName] = useState(currentName)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(currentName)
      setError(null)
    }
  }, [open, currentName])

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("請輸入病人名稱")
      return
    }
    if (trimmed === currentName) {
      onOpenChange(false)
      return
    }
    setSaving(true)
    try {
      await renamePatient(patientId, trimmed)
      onRenamed()
      onOpenChange(false)
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === "23505") {
        setError("已存在同名病人")
      } else {
        setError("重新命名失敗，請稍後再試")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>重新命名病人</DialogTitle>
          <DialogDescription>輸入新的病人名稱</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="rename-input">名稱</Label>
          <Input
            id="rename-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
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
            {saving ? "儲存中..." : "儲存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
