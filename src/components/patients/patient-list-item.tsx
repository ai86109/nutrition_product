"use client"

import PatientActionsMenu from "./patient-actions-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Patient } from "@/types/patient"
import type { PatientGroup } from "@/types/patient-group"

interface PatientListItemProps {
  patient: Patient
  snapshotCount: number
  isSelected: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  groups: PatientGroup[]
  patientGroupIds: string[]
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onClickGroupTag: (groupId: string) => void
  onChanged: () => void
}

export default function PatientListItem({
  patient,
  snapshotCount,
  isSelected,
  canMoveUp,
  canMoveDown,
  groups,
  patientGroupIds,
  onSelect,
  onMoveUp,
  onMoveDown,
  onClickGroupTag,
  onChanged,
}: PatientListItemProps) {
  // 依 groups 順序顯示，避免 memberships 順序不固定
  const patientGroups = groups.filter((g) => patientGroupIds.includes(g.id))

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors border-b last:border-b-0",
        isSelected && "bg-muted"
      )}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0 pl-1">
        <p className="text-sm font-medium truncate">{patient.name}</p>
        {patientGroups.length > 0 && (
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {patientGroups.map((g) => (
              <Badge
                key={g.id}
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 cursor-pointer hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation()
                  onClickGroupTag(g.id)
                }}
                title={`篩選群組：${g.name}`}
              >
                {g.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <PatientActionsMenu
          patient={patient}
          snapshotCount={snapshotCount}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          groups={groups}
          patientGroupIds={patientGroupIds}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onChanged={onChanged}
        />
      </div>
    </div>
  )
}
