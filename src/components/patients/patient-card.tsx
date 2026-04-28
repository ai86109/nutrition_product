"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  User,
  Pencil,
  Trash2,
} from "lucide-react"
import SnapshotCard from "./snapshot-card"
import RenamePatientDialog from "./rename-patient-dialog"
import ConfirmDialog from "./confirm-dialog"
import { deletePatient } from "@/lib/supabase/mutations/patients"
import type { Patient, PatientSnapshot } from "@/types/patient"

interface PatientCardProps {
  patient: Patient
  snapshots: PatientSnapshot[]
  isExpanded: boolean
  onToggleExpand: () => void
  expandedSnapshotIds: Set<string>
  onToggleSnapshot: (snapshotId: string) => void
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onChanged: () => void
}

export default function PatientCard({
  patient,
  snapshots,
  isExpanded,
  onToggleExpand,
  expandedSnapshotIds,
  onToggleSnapshot,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onChanged,
}: PatientCardProps) {
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
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-3 flex-1 text-left cursor-pointer rounded-md -mx-1 px-1 py-1 hover:bg-muted/60 transition-colors"
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          )}
          <div className="flex items-center justify-center size-9 rounded-full bg-muted shrink-0">
            <User className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold truncate">{patient.name}</h2>
              <Badge variant="secondary" className="font-normal">
                {snapshots.length} 筆紀錄
              </Badge>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            title="上移"
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            title="下移"
          >
            <ChevronDown className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRenameOpen(true)}
            title="重新命名"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            title="刪除"
            className="hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Snapshots */}
      {isExpanded && (
        <div className="border-t bg-muted/30 px-4 py-4">
          {snapshots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              這位病人還沒有 snapshot 紀錄
            </p>
          ) : (
            <div className="space-y-3">
              {snapshots.map((s) => (
                <SnapshotCard
                  key={s.id}
                  snapshot={s}
                  isExpanded={expandedSnapshotIds.has(s.id)}
                  onToggleExpand={() => onToggleSnapshot(s.id)}
                  onChanged={onChanged}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
        description={`會一併刪除這位病人的所有歷史紀錄，共 ${snapshots.length} 筆，無法復原。`}
        confirmText="刪除"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </Card>
  )
}
