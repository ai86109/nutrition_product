"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X, TrendingUp, Pencil } from "lucide-react"
import { SnapshotTrendSheet } from "./snapshot-trend-sheet"
import {
  updatePatientBirthday,
  updatePatientDiseaseHistory,
} from "@/lib/supabase/mutations/patients"
import { calculateAgeAt, formatBirthday } from "@/lib/age"
import type { Patient, PatientSnapshot } from "@/types/patient"

interface PatientInfoPanelProps {
  patient: Patient
  snapshots: PatientSnapshot[]
  onChanged: () => void
  onViewRecord: (snapshotId: string) => void
}

export default function PatientInfoPanel({
  patient,
  snapshots,
  onChanged,
  onViewRecord,
}: PatientInfoPanelProps) {
  // 生日編輯狀態
  const [isEditingBirthday, setIsEditingBirthday] = useState(false)
  const [draftBirthday, setDraftBirthday] = useState("")
  const [savingBirthday, setSavingBirthday] = useState(false)

  // 疾病史編輯狀態
  const [isEditingDiseaseHistory, setIsEditingDiseaseHistory] = useState(false)
  const [draftDiseaseHistory, setDraftDiseaseHistory] = useState("")
  const [savingDiseaseHistory, setSavingDiseaseHistory] = useState(false)

  // 趨勢 Sheet
  const [trendOpen, setTrendOpen] = useState(false)

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
    onViewRecord(snapshotId)
    setTrendOpen(false)
  }

  return (
    <div className="rounded-lg border bg-background px-4 py-3 space-y-3 shrink-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0 space-y-2">
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={handleSaveBirthday}
                  disabled={savingBirthday}
                  title="儲存"
                >
                  <Check className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setIsEditingBirthday(false)}
                  disabled={savingBirthday}
                  title="取消"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm">
                  {patient.birthday ? (
                    <>
                      <span className="font-medium">
                        {formatBirthday(patient.birthday)}
                      </span>
                      <span className="text-muted-foreground ml-1.5">
                        （{calculateAgeAt(patient.birthday)} 歲）
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic">未設定</span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setDraftBirthday(patient.birthday ?? "")
                    setIsEditingBirthday(true)
                  }}
                  title="編輯生日"
                >
                  <Pencil className="size-3" />
                </Button>
              </div>
            )}
          </div>

          {/* 疾病史 */}
          <div className="flex items-start gap-3">
            <span className="text-xs text-muted-foreground w-12 shrink-0 mt-0.5">
              疾病史
            </span>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setIsEditingDiseaseHistory(false)}
                    disabled={savingDiseaseHistory}
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleSaveDiseaseHistory}
                    disabled={savingDiseaseHistory}
                  >
                    {savingDiseaseHistory ? "儲存中..." : "儲存"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <div className="inline-flex items-start gap-1">
                  {patient.disease_history ? (
                    <p className="text-sm whitespace-pre-wrap">
                      {patient.disease_history}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      未設定
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setDraftDiseaseHistory(patient.disease_history ?? "")
                      setIsEditingDiseaseHistory(true)
                    }}
                    title="編輯疾病史"
                  >
                    <Pencil className="size-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 查看趨勢按鈕 — 手機全寬置底，桌面右上 */}
        {snapshots.length >= 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTrendOpen(true)}
            className="w-full md:w-auto md:shrink-0"
          >
            <TrendingUp className="size-4" />
            查看趨勢
          </Button>
        )}
      </div>

      <SnapshotTrendSheet
        open={trendOpen}
        onOpenChange={setTrendOpen}
        patient={patient}
        snapshots={snapshots}
        onViewRecord={handleViewRecord}
      />
    </div>
  )
}
