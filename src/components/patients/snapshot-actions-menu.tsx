"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarDays, MoreVertical, Trash2 } from "lucide-react"
import ConfirmDialog from "./confirm-dialog"
import EditSnapshotDateDialog from "./edit-snapshot-date-dialog"
import { deletePatientSnapshot } from "@/lib/supabase/mutations/patient-snapshots"
import type { PatientSnapshot } from "@/types/patient"

interface SnapshotActionsMenuProps {
  snapshot: PatientSnapshot
  onChanged: () => void
}

/**
 * Snapshot 列表項目的動作選單（三點 icon → DropdownMenu）。
 * 整合：編輯日期、刪除。
 */
export default function SnapshotActionsMenu({
  snapshot,
  onChanged,
}: SnapshotActionsMenuProps) {
  const [editDateOpen, setEditDateOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="更多動作"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-36"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem onSelect={() => setEditDateOpen(true)}>
            <CalendarDays />
            編輯日期
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 />
            刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditSnapshotDateDialog
        open={editDateOpen}
        onOpenChange={setEditDateOpen}
        snapshot={snapshot}
        onChanged={onChanged}
      />

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
