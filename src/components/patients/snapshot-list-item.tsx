"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Pencil, Trash2 } from "lucide-react"
import ConfirmDialog from "./confirm-dialog"
import {
  deletePatientSnapshot,
  updatePatientSnapshotDate,
} from "@/lib/supabase/mutations/patient-snapshots"
import { getEffectiveDate } from "@/lib/snapshot-date"
import { cn } from "@/lib/utils"
import type { PatientSnapshot } from "@/types/patient"

function getTodayLocalDate(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface SnapshotListItemProps {
  snapshot: PatientSnapshot
  isSelected: boolean
  onSelect: () => void
  onChanged: () => void
}

export default function SnapshotListItem({
  snapshot,
  isSelected,
  onSelect,
  onChanged,
}: SnapshotListItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [draftDate, setDraftDate] = useState("")
  const [savingDate, setSavingDate] = useState(false)

  const effectiveDate = getEffectiveDate(snapshot)
  const hasDateOverride = snapshot.snapshot_date !== null
  const todayMax = getTodayLocalDate()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deletePatientSnapshot(snapshot.id)
      onChanged()
      setConfirmOpen(false)
    } catch (err) {
      console.error(err)
      alert("刪除失敗，請稍後再試")
    } finally {
      setDeleting(false)
    }
  }

  const handleDatePopoverOpenChange = (open: boolean) => {
    if (open) setDraftDate(effectiveDate)
    setDatePopoverOpen(open)
  }

  const isSaveDisabled =
    savingDate ||
    draftDate === "" ||
    draftDate > todayMax ||
    draftDate === effectiveDate

  const handleSaveDate = async () => {
    if (!draftDate || draftDate === snapshot.snapshot_date) {
      setDatePopoverOpen(false)
      return
    }
    setSavingDate(true)
    try {
      await updatePatientSnapshotDate(snapshot.id, draftDate)
      onChanged()
      setDatePopoverOpen(false)
    } catch (err) {
      console.error(err)
      alert("儲存日期失敗，請稍後再試")
    } finally {
      setSavingDate(false)
    }
  }

  const handleClearDate = async () => {
    if (!hasDateOverride) {
      setDatePopoverOpen(false)
      return
    }
    setSavingDate(true)
    try {
      await updatePatientSnapshotDate(snapshot.id, null)
      onChanged()
      setDatePopoverOpen(false)
    } catch (err) {
      console.error(err)
      alert("清空日期失敗，請稍後再試")
    } finally {
      setSavingDate(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors border-b last:border-b-0",
          isSelected && "bg-muted"
        )}
        onClick={onSelect}
      >
        <span className="flex-1 min-w-0 text-sm tabular-nums truncate pl-1">
          {effectiveDate}
        </span>
        <div
          className="flex items-center shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Popover
            open={datePopoverOpen}
            onOpenChange={handleDatePopoverOpenChange}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                title="編輯日期"
              >
                <Pencil className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold">編輯日期</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    目前：{effectiveDate}
                    {!hasDateOverride && "（自動）"}
                  </p>
                </div>
                <Input
                  type="date"
                  value={draftDate}
                  max={todayMax}
                  onChange={(e) => setDraftDate(e.target.value)}
                  aria-label="snapshot 日期"
                />
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDate}
                    disabled={savingDate || !hasDateOverride}
                    title={
                      hasDateOverride
                        ? "復原後回到系統建立日"
                        : "目前已是系統建立日"
                    }
                  >
                    復原
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePopoverOpen(false)}
                      disabled={savingDate}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveDate}
                      disabled={isSaveDisabled}
                    >
                      {savingDate ? "儲存中..." : "儲存"}
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="size-6 hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
            title="刪除"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="刪除這筆紀錄？"
        description="此操作無法復原。"
        confirmText="刪除"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  )
}
