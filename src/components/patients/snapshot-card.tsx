"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import EditSnapshotDialog from "./edit-snapshot-dialog"
import {
  deletePatientSnapshot,
  updatePatientSnapshotDate,
  updatePatientSnapshotNotes,
} from "@/lib/supabase/mutations/patient-snapshots"
import { getEffectiveDate } from "@/lib/snapshot-date"
import { formatNumber } from "@/lib/utils"
import { calculateAgeAt, formatBirthday } from "@/lib/age"
import type { Patient, PatientSnapshot } from "@/types/patient"

interface SnapshotCardProps {
  snapshot: PatientSnapshot
  patient: Patient
  isExpanded: boolean
  onToggleExpand: () => void
  /** 刪除 / 編輯成功後讓父層重新載入 */
  onChanged: () => void
}

function getTodayLocalDate(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface StatProps {
  label: string
  value: string | number | null | undefined
  unit?: string
  suffix?: string
}

function Stat({ label, value, unit, suffix }: StatProps) {
  const isEmpty = value === null || value === undefined || value === ""
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1 flex-wrap">
        <span className="text-base font-semibold tabular-nums">
          {isEmpty ? "—" : value}
        </span>
        {!isEmpty && unit && (
          <span className="text-xs text-muted-foreground">{unit}</span>
        )}
        {!isEmpty && suffix && (
          <span className="text-xs font-medium">{suffix}</span>
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
  patient,
  isExpanded,
  onToggleExpand,
  onChanged,
}: SnapshotCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  // 備註編輯狀態
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [draftNotes, setDraftNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)

  // 日期編輯 Popover 狀態
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [draftDate, setDraftDate] = useState("")
  const [savingDate, setSavingDate] = useState(false)

  const todayMax = getTodayLocalDate()
  const effectiveDate = getEffectiveDate(snapshot)
  const hasDateOverride = snapshot.snapshot_date !== null

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

  const handleDatePopoverOpenChange = (open: boolean) => {
    if (open) {
      // 開啟時初始化 draft 為目前 effective date
      setDraftDate(effectiveDate)
    }
    setDatePopoverOpen(open)
  }

  const handleSaveDate = async () => {
    if (!draftDate) return
    if (draftDate > todayMax) return // UI 已用 max 限制，這層是保險
    if (draftDate === snapshot.snapshot_date) {
      // 沒變化就不打 API
      setDatePopoverOpen(false)
      return
    }
    setSavingDate(true)
    try {
      await updatePatientSnapshotDate(snapshot.id, draftDate)
      onChanged()
      setDatePopoverOpen(false)
    } catch (err) {
      console.error(err)
      alert("儲存日期失敗，請稍後再試")
    } finally {
      setSavingDate(false)
    }
  }

  const handleClearDate = async () => {
    if (!hasDateOverride) {
      setDatePopoverOpen(false)
      return
    }
    setSavingDate(true)
    try {
      await updatePatientSnapshotDate(snapshot.id, null)
      onChanged()
      setDatePopoverOpen(false)
    } catch (err) {
      console.error(err)
      alert("清空日期失敗，請稍後再試")
    } finally {
      setSavingDate(false)
    }
  }

  const isSaveDisabled =
    savingDate ||
    draftDate === "" ||
    draftDate > todayMax ||
    draftDate === effectiveDate

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
      {/* Header — 點擊切換展開；旁邊有編輯日期、刪除 */}
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
            {effectiveDate}
          </span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Popover
            open={datePopoverOpen}
            onOpenChange={handleDatePopoverOpenChange}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" title="編輯日期">
                <Pencil className="size-4" />
                <span className="hidden sm:inline">編輯日期</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold">編輯日期</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    目前：{effectiveDate}
                    {!hasDateOverride && "（自動）"}
                  </p>
                </div>

                <Input
                  type="date"
                  value={draftDate}
                  max={todayMax}
                  onChange={(e) => setDraftDate(e.target.value)}
                  aria-label="snapshot 日期"
                />

                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDate}
                    disabled={savingDate || !hasDateOverride}
                    title={
                      hasDateOverride
                        ? "復原後回到系統建立日"
                        : "目前已是系統建立日"
                    }
                  >
                    復原
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePopoverOpen(false)}
                      disabled={savingDate}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveDate}
                      disabled={isSaveDisabled}
                    >
                      {savingDate ? "儲存中..." : "儲存"}
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            編輯
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            刪除
          </Button>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="space-y-5 border-t bg-background px-4 py-4">
          {/* 生理資訊 */}
          <div className="space-y-2">
            <SectionHeader icon={<User />} label="生理資訊" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="身高" value={bio_info.height} unit="cm" />
              <Stat
                label="體重"
                value={bio_info.weight}
                unit="kg"
                suffix={bio_info.edema ? "(有水腫)" : undefined}
              />
              <Stat
                label="年齡"
                value={calculateAgeAt(patient.birthday, effectiveDate)}
                unit="歲"
              />
              <Stat label="性別" value={genderLabel} />
            </div>
            {(bio_info.edema || bio_info.pressure_sore) && (
              <div className="flex flex-wrap gap-2 mt-1">
                {bio_info.edema && (
                  <div className="rounded-md bg-muted/50 border px-3 py-1.5 text-sm">
                    <span className="font-medium">水腫</span>
                    {bio_info.edema_note && (
                      <span className="text-muted-foreground ml-1.5">{bio_info.edema_note}</span>
                    )}
                  </div>
                )}
                {bio_info.pressure_sore && (
                  <div className="rounded-md bg-muted/50 border px-3 py-1.5 text-sm">
                    <span className="font-medium">壓瘡</span>
                    {bio_info.pressure_sore_note && (
                      <span className="text-muted-foreground ml-1.5">{bio_info.pressure_sore_note}</span>
                    )}
                  </div>
                )}
              </div>
            )}
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
                          ({formatNumber(p.serving_amount)}
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
        title="你要刪除這筆紀錄嗎？"
        description="刪除後將無法復原。"
        confirmText="刪除"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />

      <EditSnapshotDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        snapshot={snapshot}
        onSaved={onChanged}
      />
    </Card>
  )
}
