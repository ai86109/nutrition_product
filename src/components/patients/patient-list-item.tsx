"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react"
import RenamePatientDialog from "./rename-patient-dialog"
import ConfirmDialog from "./confirm-dialog"
import { deletePatient } from "@/lib/supabase/mutations/patients"
import { cn } from "@/lib/utils"
import type { Patient } from "@/types/patient"

interface PatientListItemProps {
  patient: Patient
  snapshotCount: number
  isSelected: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onChanged: () => void
}

export default function PatientListItem({
  patient,
  snapshotCount,
  isSelected,
  canMoveUp,
  canMoveDown,
  onSelect,
  onMoveUp,
  onMoveDown,
  onChanged,
}: PatientListItemProps) {
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
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors border-b last:border-b-0",
          isSelected && "bg-muted"
        )}
        onClick={onSelect}
      >
        <span className="flex-1 min-w-0 text-sm font-medium truncate pl-1">
          {patient.name}
        </span>
        <div
          className="flex items-center shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            title="上移"
          >
            <ChevronUp className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            title="下移"
          >
            <ChevronDown className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => setRenameOpen(true)}
            title="重新命名"
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            title="刪除"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

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
