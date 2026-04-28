"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Target,
  Pill,
  StickyNote,
  Pencil,
} from "lucide-react"
import ConfirmDialog from "./confirm-dialog"
import {
  deletePatientSnapshot,
  updatePatientSnapshotNotes,
} from "@/lib/supabase/mutations/patient-snapshots"
import type { PatientSnapshot } from "@/types/patient"

interface SnapshotCardProps {
  snapshot: PatientSnapshot
  isExpanded: boolean
  onToggleExpand: () => void
  /** 刪除 / 編輯成功後讓父層重新載入 */
  onChanged: () => void
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface StatProps {
  label: string
  value: string | number | null | undefined
  unit?: string
}

function Stat({ label, value, unit }: StatProps) {
  const isEmpty = value === null || value === undefined || value === ""
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-base font-semibold tabular-nums">
          {isEmpty ? "—" : value}
        </span>
        {!isEmpty && unit && (
          <span className="text-xs text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  )
}

interface SectionHeaderProps {
  icon: React.ReactNode
  label: string
  hint?: string
}

function SectionHeader({ icon, label, hint }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <span className="[&>svg]:size-3.5">{icon}</span>
      <span>{label}</span>
      {hint && <span className="font-normal normal-case">{hint}</span>}
    </div>
  )
}

export default function SnapshotCard({
  snapshot,
  isExpanded,
  onToggleExpand,
  onChanged,
}: SnapshotCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 備註編輯狀態
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [draftNotes, setDraftNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)

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

  const handleStartEditNotes = () => {
    setDraftNotes(snapshot.notes ?? "")
    setIsEditingNotes(true)
  }

  const handleCancelEditNotes = () => {
    setIsEditingNotes(false)
    setDraftNotes("")
  }

  const handleSaveNotes = async () => {
    const trimmed = draftNotes.trim()
    const next = trimmed === "" ? null : trimmed
    if (next === (snapshot.notes ?? null)) {
      setIsEditingNotes(false)
      return
    }
    setSavingNotes(true)
    try {
      await updatePatientSnapshotNotes(snapshot.id, next)
      onChanged()
      setIsEditingNotes(false)
    } catch (err) {
      console.error(err)
      alert("儲存備註失敗，請稍後再試")
    } finally {
      setSavingNotes(false)
    }
  }

  const {
    bio_info,
    calorie_target,
    protein_range,
    meals_per_day,
    selected_products,
    notes,
  } = snapshot

  const genderLabel =
    bio_info.gender === "man" ? "男" : bio_info.gender === "woman" ? "女" : null

  const proteinDisplay =
    protein_range && (protein_range.min !== null || protein_range.max !== null)
      ? `${protein_range.min ?? "—"} ~ ${protein_range.max ?? "—"}`
      : null

  return (
    <Card className="overflow-hidden p-0">
      {/* Header — 點擊切換展開 */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-2 flex-1 text-left cursor-pointer rounded-md -mx-1 px-1 py-0.5 hover:bg-muted/60 transition-colors"
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium tabular-nums">
            {formatDateTime(snapshot.created_at)}
          </span>
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmOpen(true)}
        >
          刪除
        </Button>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="space-y-5 border-t bg-background px-4 py-4">
          {/* 生理資訊 */}
          <div className="space-y-2">
            <SectionHeader icon={<User />} label="生理資訊" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="身高" value={bio_info.height} unit="cm" />
              <Stat label="體重" value={bio_info.weight} unit="kg" />
              <Stat label="年齡" value={bio_info.age} unit="歲" />
              <Stat label="性別" value={genderLabel} />
            </div>
          </div>

          {/* 每日目標 */}
          <div className="space-y-2">
            <SectionHeader icon={<Target />} label="每日目標" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="熱量" value={calorie_target} unit="kcal" />
              <Stat label="蛋白質範圍" value={proteinDisplay} unit="g" />
              <Stat label="每日餐數" value={meals_per_day} unit="餐" />
            </div>
          </div>

          {/* 營養品 */}
          {selected_products.length > 0 && (
            <div className="space-y-2">
              <SectionHeader
                icon={<Pill />}
                label="營養品"
                hint={`(${selected_products.length})`}
              />
              <ul className="overflow-hidden rounded-md border divide-y">
                {selected_products.map((p, i) => (
                  <li
                    key={`${p.product_id}-${i}`}
                    className="flex items-center justify-between gap-3 bg-background px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{p.name_zh}</div>
                      {p.name_en && (
                        <div className="truncate text-xs text-muted-foreground">
                          {p.name_en}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm tabular-nums shrink-0">
                      <span className="font-semibold">{p.quantity}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        × {p.serving_label}
                      </span>
                      {p.serving_amount > 0 && p.serving_unit && (
                        <div className="text-xs text-muted-foreground">
                          ({p.serving_amount}
                          {p.serving_unit})
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 備註 — 永遠顯示，可編輯 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <SectionHeader icon={<StickyNote />} label="備註" />
              {!isEditingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEditNotes}
                  className="h-7 px-2 text-xs"
                >
                  <Pencil className="size-3.5" />
                  編輯
                </Button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  className="border-input flex w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  placeholder="想記下的細節（選填）"
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEditNotes}
                    disabled={savingNotes}
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                  >
                    {savingNotes ? "儲存中..." : "儲存"}
                  </Button>
                </div>
              </div>
            ) : notes ? (
              <p className="rounded-md bg-muted/50 px-3 py-2 text-sm whitespace-pre-wrap">
                {notes}
              </p>
            ) : (
              <p className="rounded-md bg-muted/50 px-3 py-2 text-sm italic text-muted-foreground">
                尚無備註
              </p>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="刪除這筆 snapshot？"
        description="刪除後無法復原。"
        confirmText="刪除"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </Card>
  )
}
