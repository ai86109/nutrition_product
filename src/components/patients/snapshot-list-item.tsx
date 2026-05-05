"use client"

import SnapshotActionsMenu from "./snapshot-actions-menu"
import { getEffectiveDate } from "@/lib/snapshot-date"
import { cn } from "@/lib/utils"
import type { PatientSnapshot } from "@/types/patient"

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
  const effectiveDate = getEffectiveDate(snapshot)

  return (
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
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <SnapshotActionsMenu snapshot={snapshot} onChanged={onChanged} />
      </div>
    </div>
  )
}
