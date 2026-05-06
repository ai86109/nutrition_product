"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Users,
} from "lucide-react"
import RenamePatientDialog from "./rename-patient-dialog"
import ConfirmDialog from "./confirm-dialog"
import GroupCreateDialog from "./group-create-dialog"
import GroupManageDialog from "./group-manage-dialog"
import { deletePatient } from "@/lib/supabase/mutations/patients"
import {
  addPatientToGroup,
  removePatientFromGroup,
} from "@/lib/supabase/mutations/patient-groups"
import type { Patient } from "@/types/patient"
import type { PatientGroup } from "@/types/patient-group"

interface PatientActionsMenuProps {
  patient: Patient
  snapshotCount: number
  canMoveUp: boolean
  canMoveDown: boolean
  groups: PatientGroup[]
  patientGroupIds: string[]
  onMoveUp: () => void
  onMoveDown: () => void
  onChanged: () => void
}

/**
 * 病人列表項目的動作選單（三點 icon → DropdownMenu）。
 * 整合：上移、下移、群組（子選單）、重新命名、刪除。
 */
export default function PatientActionsMenu({
  patient,
  snapshotCount,
  canMoveUp,
  canMoveDown,
  groups,
  patientGroupIds,
  onMoveUp,
  onMoveDown,
  onChanged,
}: PatientActionsMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [groupCreateOpen, setGroupCreateOpen] = useState(false)
  const [groupManageOpen, setGroupManageOpen] = useState(false)
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

  const handleToggleGroup = async (groupId: string, nextChecked: boolean) => {
    try {
      if (nextChecked) {
        await addPatientToGroup(patient.id, groupId)
      } else {
        await removePatientFromGroup(patient.id, groupId)
      }
      onChanged()
    } catch (err) {
      console.error(err)
      alert("更新群組失敗，請稍後再試")
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
          className="w-40"
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

          {/* 群組子選單 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Users className="size-4" />
              群組
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48 max-h-72 overflow-y-auto">
              {groups.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  尚未建立任何群組
                </div>
              ) : (
                groups.map((g) => {
                  const checked = patientGroupIds.includes(g.id)
                  return (
                    <DropdownMenuCheckboxItem
                      key={g.id}
                      checked={checked}
                      // 阻止選單關閉，方便連續勾選多個群組
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(next) =>
                        handleToggleGroup(g.id, next === true)
                      }
                    >
                      <span className="truncate">{g.name}</span>
                    </DropdownMenuCheckboxItem>
                  )
                })
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setGroupCreateOpen(true)}>
                <Plus />
                新增群組…
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setGroupManageOpen(true)}>
                <Settings2 />
                管理群組…
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

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

      <GroupCreateDialog
        open={groupCreateOpen}
        onOpenChange={setGroupCreateOpen}
        autoAssignPatientId={patient.id}
        onCreated={onChanged}
      />

      <GroupManageDialog
        open={groupManageOpen}
        onOpenChange={setGroupManageOpen}
        groups={groups}
        onChanged={onChanged}
      />
    </>
  )
}
