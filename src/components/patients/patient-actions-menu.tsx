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
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react"
import RenamePatientDialog from "./rename-patient-dialog"
import ConfirmDialog from "./confirm-dialog"
import { deletePatient } from "@/lib/supabase/mutations/patients"
import type { Patient } from "@/types/patient"

interface PatientActionsMenuProps {
  patient: Patient
  snapshotCount: number
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onChanged: () => void
}

/**
 * 病人列表項目的動作選單（三點 icon → DropdownMenu）。
 * 整合：上移、下移、重新命名、刪除。
 */
export default function PatientActionsMenu({
  patient,
  snapshotCount,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onChanged,
}: PatientActionsMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deletePatient(patient.id)
      onChanged()
      setDeleteOpen(false)
    } catch (err) {
      console.error(err)
      alert("刪除病人失敗，請稍後再試")
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
          <DropdownMenuItem onSelect={onMoveUp} disabled={!canMoveUp}>
            <ChevronUp />
            上移
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onMoveDown} disabled={!canMoveDown}>
            <ChevronDown />
            下移
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Pencil />
            重新命名
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 />
            刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenamePatientDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        patientId={patient.id}
        currentName={patient.name}
        onRenamed={onChanged}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`你要刪除病人「${patient.name}」嗎？`}
        description={`會一併刪除這位病人的所有歷史紀錄，共 ${snapshotCount} 筆，無法復原。`}
        confirmText="刪除"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  )
}
