"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, User, Target, Pill, StickyNote } from "lucide-react"
import EditSnapshotDialog from "./edit-snapshot-dialog"
import { updatePatientSnapshotNotes } from "@/lib/supabase/mutations/patient-snapshots"
import { getEffectiveDate } from "@/lib/snapshot-date"
import { formatNumber } from "@/lib/utils"
import { calculateAgeAt } from "@/lib/age"
import { calcBMI, calcABW } from "@/utils/nutrition-calculations"
import type { Patient, PatientSnapshot } from "@/types/patient"

interface StatProps {
  label: string
  value: string | number | null | undefined
  unit?: string
  suffix?: string
}

function Stat({ label, value, unit, suffix }: StatProps) {
  const isEmpty = value === null || value === undefined || value === ""
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2 min-w-0">
      <div className="text-xs text-muted-foreground truncate">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1 flex-nowrap overflow-hidden">
        <span className="text-base font-semibold tabular-nums truncate">
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

interface SnapshotDetailPanelProps {
  snapshot: PatientSnapshot
  patient: Patient
  onChanged: () => void
}

export default function SnapshotDetailPanel({
  snapshot,
  patient,
  onChanged,
}: SnapshotDetailPanelProps) {
  const [editOpen, setEditOpen] = useState(false)

  // 備註編輯狀態
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [draftNotes, setDraftNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)

  const effectiveDate = getEffectiveDate(snapshot)

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
    calorie_range,
    protein_range,
    meals_per_day,
    selected_products,
    notes,
  } = snapshot

  const genderLabel =
    bio_info.gender === "man" ? "男" : bio_info.gender === "woman" ? "女" : null

  const calorieDisplay =
    calorie_range && (calorie_range.min !== null || calorie_range.max !== null)
      ? `${calorie_range.min ?? "—"} ~ ${calorie_range.max ?? "—"}`
      : null

  const proteinDisplay =
    protein_range && (protein_range.min !== null || protein_range.max !== null)
      ? `${protein_range.min ?? "—"} ~ ${protein_range.max ?? "—"}`
      : null

  const bmi = calcBMI(bio_info.height ?? 0, bio_info.weight ?? 0)
  const abw = calcABW(bio_info.height ?? 0, bio_info.weight ?? 0)

  return (
    <div className="flex-1 flex flex-col rounded-lg border bg-background overflow-hidden min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
        <span className="text-sm font-medium tabular-nums">{effectiveDate}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-3.5" />
          編輯
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto space-y-5 px-4 py-4">
        {/* 生理資訊 */}
        <div className="space-y-2">
          <SectionHeader icon={<User />} label="生理資訊" />
          <div className="grid grid-cols-6 gap-2">
            <Stat label="身高" value={bio_info.height} unit="cm" />
            <Stat
              label="體重"
              value={bio_info.weight}
              unit="kg"
              suffix={bio_info.edema ? "(水腫)" : undefined}
            />
            <Stat
              label="年齡"
              value={calculateAgeAt(patient.birthday, effectiveDate)}
              unit="歲"
            />
            <Stat label="性別" value={genderLabel} />
            <Stat label="BMI" value={bmi} />
            <Stat label="調整體重" value={abw} unit="kg" />
          </div>
          {(bio_info.edema || bio_info.pressure_sore) && (
            <div className="flex flex-wrap gap-2 mt-1">
              {bio_info.edema && (
                <div className="rounded-md bg-muted/50 border px-3 py-1.5 text-sm">
                  <span className="font-medium">水腫</span>
                  {bio_info.edema_note && (
                    <span className="text-muted-foreground ml-1.5">
                      {bio_info.edema_note}
                    </span>
                  )}
                </div>
              )}
              {bio_info.pressure_sore && (
                <div className="rounded-md bg-muted/50 border px-3 py-1.5 text-sm">
                  <span className="font-medium">壓瘡</span>
                  {bio_info.pressure_sore_note && (
                    <span className="text-muted-foreground ml-1.5">
                      {bio_info.pressure_sore_note}
                    </span>
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
            <Stat label="目標熱量範圍" value={calorieDisplay} unit="kcal" />
            <Stat label="蛋白質範圍" value={proteinDisplay} unit="g" />
            <Stat label="每日餐數" value={meals_per_day} unit="餐" />
            <Stat label="實際熱量" value={snapshot.actual_calorie} unit="kcal" />
            <Stat label="實際蛋白質" value={snapshot.actual_protein} unit="g" />
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

        {/* 備註 */}
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
                <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
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

      <EditSnapshotDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        snapshot={snapshot}
        onSaved={onChanged}
      />
    </div>
  )
}
