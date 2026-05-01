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
  TrendingUp,
  Check,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import SnapshotCard from "./snapshot-card"
import RenamePatientDialog from "./rename-patient-dialog"
import ConfirmDialog from "./confirm-dialog"
import { SnapshotTrendSheet } from "./snapshot-trend-sheet"
import { deletePatient, updatePatientBirthday, updatePatientDiseaseHistory } from "@/lib/supabase/mutations/patients"
import { calculateAgeAt, formatBirthday } from "@/lib/age"
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
  const [trendOpen, setTrendOpen] = useState(false)

  // 生日編輯狀態
  const [isEditingBirthday, setIsEditingBirthday] = useState(false)
  const [draftBirthday, setDraftBirthday] = useState("")
  const [savingBirthday, setSavingBirthday] = useState(false)

  // 疾病史編輯狀態
  const [isEditingDiseaseHistory, setIsEditingDiseaseHistory] = useState(false)
  const [draftDiseaseHistory, setDraftDiseaseHistory] = useState("")
  const [savingDiseaseHistory, setSavingDiseaseHistory] = useState(false)

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

  const handleStartEditBirthday = () => {
    setDraftBirthday(patient.birthday ?? "")
    setIsEditingBirthday(true)
  }

  const handleCancelEditBirthday = () => {
    setIsEditingBirthday(false)
    setDraftBirthday("")
  }

  const handleSaveBirthday = async () => {
    const value = draftBirthday.trim()
    if (value === (patient.birthday ?? "")) {
      setIsEditingBirthday(false)
      return
    }
    setSavingBirthday(true)
    try {
      await updatePatientBirthday(patient.id, value || null)
      onChanged()
      setIsEditingBirthday(false)
    } catch (err) {
      console.error(err)
      alert("儲存生日失敗，請稍後再試")
    } finally {
      setSavingBirthday(false)
    }
  }

  const handleStartEditDiseaseHistory = () => {
    setDraftDiseaseHistory(patient.disease_history ?? "")
    setIsEditingDiseaseHistory(true)
  }

  const handleCancelEditDiseaseHistory = () => {
    setIsEditingDiseaseHistory(false)
    setDraftDiseaseHistory("")
  }

  const handleSaveDiseaseHistory = async () => {
    const value = draftDiseaseHistory.trim()
    const next = value || null
    if (next === (patient.disease_history ?? null)) {
      setIsEditingDiseaseHistory(false)
      return
    }
    setSavingDiseaseHistory(true)
    try {
      await updatePatientDiseaseHistory(patient.id, next)
      onChanged()
      setIsEditingDiseaseHistory(false)
    } catch (err) {
      console.error(err)
      alert("儲存疾病史失敗，請稍後再試")
    } finally {
      setSavingDiseaseHistory(false)
    }
  }

  const handleViewRecord = (snapshotId: string) => {
    // 確保目標 snapshot 是展開狀態
    if (!expandedSnapshotIds.has(snapshotId)) {
      onToggleSnapshot(snapshotId)
    }
    // 關閉 Sheet
    setTrendOpen(false)
    // 等 Sheet 收合動畫結束再捲動到目標卡片
    setTimeout(() => {
      const el = document.getElementById(`snapshot-${snapshotId}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 350)
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
        <div className="border-t bg-muted/30 px-4 py-4 space-y-4">
          {/* 病人資訊 + 查看趨勢 */}
          <div className="flex items-start justify-between gap-3">
            {/* 生日 + 疾病史：統一 info panel */}
            <div className="flex-1 rounded-lg border bg-background px-4 py-3 space-y-3">
              {/* 生日 */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12 shrink-0">生日</span>
                {isEditingBirthday ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="date"
                      value={draftBirthday}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setDraftBirthday(e.target.value)}
                      className="h-7 w-[155px] text-sm"
                      disabled={savingBirthday}
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="size-7" onClick={handleSaveBirthday} disabled={savingBirthday} title="儲存">
                      <Check className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7" onClick={handleCancelEditBirthday} disabled={savingBirthday} title="取消">
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">
                      {patient.birthday
                        ? <><span className="font-medium">{formatBirthday(patient.birthday)}</span><span className="text-muted-foreground ml-1.5">（{calculateAgeAt(patient.birthday)} 歲）</span></>
                        : <span className="text-muted-foreground italic">未設定</span>}
                    </span>
                    <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-foreground" onClick={handleStartEditBirthday} title="編輯生日">
                      <Pencil className="size-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* 疾病史 */}
              <div className="flex items-start gap-3">
                <span className="text-xs text-muted-foreground w-12 shrink-0 mt-0.5">疾病史</span>
                {isEditingDiseaseHistory ? (
                  <div className="flex-1 space-y-1.5">
                    <textarea
                      className="border-input flex w-full min-h-[72px] rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      placeholder="病人的疾病史（選填）"
                      value={draftDiseaseHistory}
                      onChange={(e) => setDraftDiseaseHistory(e.target.value)}
                      disabled={savingDiseaseHistory}
                      autoFocus
                    />
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleCancelEditDiseaseHistory} disabled={savingDiseaseHistory}>取消</Button>
                      <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSaveDiseaseHistory} disabled={savingDiseaseHistory}>
                        {savingDiseaseHistory ? "儲存中..." : "儲存"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="inline-flex items-start gap-1">
                      {patient.disease_history ? (
                        <p className="text-sm whitespace-pre-wrap">{patient.disease_history}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">未設定</p>
                      )}
                      <Button variant="ghost" size="icon" className="size-6 shrink-0 text-muted-foreground hover:text-foreground" onClick={handleStartEditDiseaseHistory} title="編輯疾病史">
                        <Pencil className="size-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 查看趨勢 */}
            {snapshots.length >= 2 && (
              <Button variant="outline" size="sm" onClick={() => setTrendOpen(true)} className="shrink-0">
                <TrendingUp className="size-4" />
                查看趨勢
              </Button>
            )}
          </div>

          {/* Snapshot 卡片列表 */}
          {snapshots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              這位病人還沒有 snapshot 紀錄
            </p>
          ) : (
            <div className="space-y-3">
              {snapshots.map((s) => (
                <div key={s.id} id={`snapshot-${s.id}`}>
                  <SnapshotCard
                    snapshot={s}
                    patient={patient}
                    isExpanded={expandedSnapshotIds.has(s.id)}
                    onToggleExpand={() => onToggleSnapshot(s.id)}
                    onChanged={onChanged}
                  />
                </div>
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

      <SnapshotTrendSheet
        open={trendOpen}
        onOpenChange={setTrendOpen}
        patient={patient}
        snapshots={snapshots}
        onViewRecord={handleViewRecord}
      />
    </Card>
  )
}
