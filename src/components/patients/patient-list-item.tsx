"use client"

import PatientActionsMenu from "./patient-actions-menu"
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
  return (
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
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <PatientActionsMenu
          patient={patient}
          snapshotCount={snapshotCount}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onChanged={onChanged}
        />
      </div>
    </div>
  )
}
