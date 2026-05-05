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
import { updatePatientSnapshotDate } from "@/lib/supabase/mutations/patient-snapshots"
import { getEffectiveDate } from "@/lib/snapshot-date"
import type { PatientSnapshot } from "@/types/patient"

function getTodayLocalDate(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface EditSnapshotDateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: PatientSnapshot
  onChanged: () => void
}

/**
 * 編輯 snapshot 日期的 Dialog（取代原本的 Popover），
 * 讓日期編輯入口可以從 DropdownMenu item 觸發。
 */
export default function EditSnapshotDateDialog({
  open,
  onOpenChange,
  snapshot,
  onChanged,
}: EditSnapshotDateDialogProps) {
  const effectiveDate = getEffectiveDate(snapshot)
  const hasDateOverride = snapshot.snapshot_date !== null
  const todayMax = getTodayLocalDate()

  const [draftDate, setDraftDate] = useState(effectiveDate)
  const [saving, setSaving] = useState(false)

  // open 切換時把 draft 重設成目前 effective date
  useEffect(() => {
    if (open) setDraftDate(effectiveDate)
  }, [open, effectiveDate])

  const isSaveDisabled =
    saving ||
    draftDate === "" ||
    draftDate > todayMax ||
    draftDate === effectiveDate

  const handleSave = async () => {
    if (!draftDate || draftDate === snapshot.snapshot_date) {
      onOpenChange(false)
      return
    }
    setSaving(true)
    try {
      await updatePatientSnapshotDate(snapshot.id, draftDate)
      onChanged()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      alert("儲存日期失敗，請稍後再試")
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (!hasDateOverride) {
      onOpenChange(false)
      return
    }
    setSaving(true)
    try {
      await updatePatientSnapshotDate(snapshot.id, null)
      onChanged()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      alert("清空日期失敗，請稍後再試")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>編輯日期</DialogTitle>
          <DialogDescription>
            目前：{effectiveDate}
            {!hasDateOverride && "（自動）"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="snapshot-date-input">日期</Label>
          <Input
            id="snapshot-date-input"
            type="date"
            value={draftDate}
            max={todayMax}
            onChange={(e) => setDraftDate(e.target.value)}
            aria-label="snapshot 日期"
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={saving || !hasDateOverride}
            title={
              hasDateOverride ? "復原後回到系統建立日" : "目前已是系統建立日"
            }
          >
            復原
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button onClick={handleSave} disabled={isSaveDisabled}>
              {saving ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
