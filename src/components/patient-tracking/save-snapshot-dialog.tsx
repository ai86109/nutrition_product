"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import PatientSelector, {
  type PatientMode,
} from "./patient-selector"
import { getPatients } from "@/lib/supabase/queries/patients"
import { createPatient } from "@/lib/supabase/mutations/patients"
import { createPatientSnapshot } from "@/lib/supabase/mutations/patient-snapshots"
import { useAuth } from "@/contexts/AuthContext"
import { calculateAgeAt, formatBirthday } from "@/lib/age"
import type { Patient, PatientSnapshotInput } from "@/types/patient"
import type { Gender } from "@/types"

interface SaveSnapshotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 由 useCurrentSnapshot 產生的預設值，不含 patient_id */
  initialValues: Omit<PatientSnapshotInput, "patient_id">
}

export default function SaveSnapshotDialog({
  open,
  onOpenChange,
  initialValues,
}: SaveSnapshotDialogProps) {
  const { session } = useAuth()
  const userId = session?.user?.id

  // 病人列表 + 選擇狀態
  const [patients, setPatients] = useState<Patient[]>([])
  const [mode, setMode] = useState<PatientMode>("new")
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [newPatientName, setNewPatientName] = useState<string>("")
  const [newPatientBirthday, setNewPatientBirthday] = useState<string>("")
  const [patientError, setPatientError] = useState<string | null>(null)

  // Bio info（可編輯）
  const [height, setHeight] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const [gender, setGender] = useState<Gender>("man")

  // Targets
  const [calorieTarget, setCalorieTarget] = useState<string>("")
  const [proteinMin, setProteinMin] = useState<string>("")
  const [proteinMax, setProteinMax] = useState<string>("")
  const [mealsCheck, setMealsCheck] = useState<boolean>(false)
  const [mealsPerDay, setMealsPerDay] = useState<string>("")

  // Notes
  const [notes, setNotes] = useState<string>("")

  // Saving state
  const [saving, setSaving] = useState(false)

  // 開啟 dialog 時：載入病人 + 用 initialValues 重置欄位
  useEffect(() => {
    if (!open || !userId) return

    let cancelled = false
    getPatients(userId).then((list) => {
      if (cancelled) return
      setPatients(list)
      // 沒有既有病人 → 預設「新增」；有則預設「既有」並選第一位
      if (list.length === 0) {
        setMode("new")
        setSelectedPatientId("")
      } else {
        setMode("existing")
        setSelectedPatientId(list[0].id)
      }
    })
    return () => {
      cancelled = true
    }
  }, [open, userId])

  // 切到既有病人 / 換選病人時，gender 鎖到該病人的 gender
  useEffect(() => {
    if (mode !== "existing" || !selectedPatientId) return
    const patient = patients.find((p) => p.id === selectedPatientId)
    if (patient) {
      setGender(patient.gender)
    }
  }, [mode, selectedPatientId, patients])

  useEffect(() => {
    if (!open) return

    // 用 initialValues 重置表單
    const bi = initialValues.bio_info
    setHeight(bi.height != null ? String(bi.height) : "")
    setWeight(bi.weight != null ? String(bi.weight) : "")
    setGender((bi.gender ?? "man") as Gender)

    setCalorieTarget(
      initialValues.calorie_target != null
        ? String(initialValues.calorie_target)
        : ""
    )
    setProteinMin(
      initialValues.protein_range?.min != null
        ? String(initialValues.protein_range.min)
        : ""
    )
    setProteinMax(
      initialValues.protein_range?.max != null
        ? String(initialValues.protein_range.max)
        : ""
    )
    setMealsCheck(initialValues.meals_per_day != null)
    setMealsPerDay(
      initialValues.meals_per_day != null
        ? String(initialValues.meals_per_day)
        : ""
    )
    setNotes(initialValues.notes ?? "")
    setNewPatientName("")
    setNewPatientBirthday("")
    setPatientError(null)
  }, [open, initialValues])

  // 目前選中的既有病人資訊
  const selectedPatient =
    mode === "existing"
      ? patients.find((p) => p.id === selectedPatientId) ?? null
      : null

  const handleSave = async () => {
    if (!userId) {
      alert("請先登入")
      return
    }

    // Validate patient
    let patientId = selectedPatientId
    if (mode === "new") {
      const trimmedName = newPatientName.trim()
      if (!trimmedName) {
        setPatientError("請輸入病人名稱")
        return
      }
      if (!newPatientBirthday) {
        setPatientError("請輸入病人生日")
        return
      }
      try {
        const created = await createPatient(userId, trimmedName, gender, newPatientBirthday)
        patientId = created.id
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code
        if (code === "23505") {
          setPatientError("已存在同名病人")
        } else {
          setPatientError("建立病人失敗，請稍後再試")
        }
        return
      }
    } else {
      if (!patientId) {
        setPatientError("請選擇病人")
        return
      }
    }

    // 組 snapshot input
    const heightNum = height === "" ? null : Number(height)
    const weightNum = weight === "" ? null : Number(weight)
    const calorieNum = calorieTarget === "" ? null : Number(calorieTarget)
    const proteinMinNum = proteinMin === "" ? null : Number(proteinMin)
    const proteinMaxNum = proteinMax === "" ? null : Number(proteinMax)
    const hasProtein = proteinMinNum !== null || proteinMaxNum !== null
    const mealsNum =
      !isMealsLocked &&
      mealsCheck &&
      mealsPerDay !== "" &&
      Number(mealsPerDay) > 0
        ? Number(mealsPerDay)
        : null

    const input: PatientSnapshotInput = {
      patient_id: patientId,
      bio_info: {
        height: heightNum,
        weight: weightNum,
        gender,
      },
      calorie_target: calorieNum,
      protein_range: hasProtein
        ? { min: proteinMinNum, max: proteinMaxNum }
        : null,
      meals_per_day: mealsNum,
      selected_products: initialValues.selected_products,
      notes: notes.trim() === "" ? null : notes.trim(),
      // 新建時不指定 snapshot_date，由使用者之後在病人頁編輯
      snapshot_date: null,
    }

    setSaving(true)
    try {
      await createPatientSnapshot(userId, input)
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      alert("儲存失敗，請稍後再試")
    } finally {
      setSaving(false)
    }
  }

  const selectedProducts = initialValues.selected_products
  // 與計算機右下區塊一致：只有恰好選一個營養品時才能用「每日 N 餐」
  const isMealsLocked = selectedProducts.length !== 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>儲存病人紀錄</DialogTitle>
          <DialogDescription>
            將目前的配置儲存為病人的歷史紀錄。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 病人選擇 */}
          <PatientSelector
            patients={patients}
            mode={mode}
            onModeChange={(m) => {
              setMode(m)
              setPatientError(null)
            }}
            selectedPatientId={selectedPatientId}
            onSelectedPatientIdChange={(id) => {
              setSelectedPatientId(id)
              setPatientError(null)
            }}
            newPatientName={newPatientName}
            onNewPatientNameChange={(n) => {
              setNewPatientName(n)
              setPatientError(null)
            }}
            errorMessage={patientError}
          />

          <Separator />

          {/* Bio info */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">生理資訊</Label>

            {/* 新增病人：生日欄位（必填） */}
            {mode === "new" && (
              <div className="flex items-center gap-2">
                <span className="text-sm w-[60px] shrink-0">生日</span>
                <Input
                  type="date"
                  value={newPatientBirthday}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setNewPatientBirthday(e.target.value)
                    setPatientError(null)
                  }}
                  className="w-[180px]"
                />
                {newPatientBirthday && (
                  <span className="text-sm text-muted-foreground">
                    {calculateAgeAt(newPatientBirthday)} 歲
                  </span>
                )}
              </div>
            )}

            {/* 既有病人：顯示生日 + 年齡（唯讀） */}
            {selectedPatient && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
                <span>生日：{formatBirthday(selectedPatient.birthday)}</span>
                {selectedPatient.birthday && (
                  <span>（{calculateAgeAt(selectedPatient.birthday)} 歲）</span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm w-[60px]">身高(cm)</span>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm w-[60px]">體重(kg)</span>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div
                className={`flex items-center gap-2 ${
                  mode === "existing" ? "opacity-50" : ""
                }`}
              >
                <span className="text-sm w-[60px]">性別</span>
                <RadioGroup
                  value={gender}
                  onValueChange={(v) => setGender(v as Gender)}
                  disabled={mode === "existing"}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-1">
                    <RadioGroupItem
                      id="dialog-gender-man"
                      value="man"
                      disabled={mode === "existing"}
                    />
                    <Label htmlFor="dialog-gender-man">男</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem
                      id="dialog-gender-woman"
                      value="woman"
                      disabled={mode === "existing"}
                    />
                    <Label htmlFor="dialog-gender-woman">女</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Separator />

          {/* Targets */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">每日目標</Label>

            <div className="flex items-center gap-2">
              <span className="text-sm w-[80px]">熱量(kcal)</span>
              <Input
                type="number"
                className="w-[120px]"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm w-[80px]">蛋白質(g)</span>
              <Input
                type="number"
                step="0.1"
                placeholder="最小值"
                className="w-[100px]"
                value={proteinMin}
                onChange={(e) => setProteinMin(e.target.value)}
              />
              <span>-</span>
              <Input
                type="number"
                step="0.1"
                placeholder="最大值"
                className="w-[100px]"
                value={proteinMax}
                onChange={(e) => setProteinMax(e.target.value)}
              />
            </div>

            <div
              className={`flex items-center gap-2 text-sm ${
                isMealsLocked ? "opacity-50" : ""
              }`}
            >
              <Checkbox
                id="dialog-meals-check"
                checked={mealsCheck}
                disabled={isMealsLocked}
                onCheckedChange={(c) => setMealsCheck(!!c)}
              />
              <Label htmlFor="dialog-meals-check">每日</Label>
              <Input
                type="number"
                step={1}
                disabled={isMealsLocked || !mealsCheck}
                className="w-[60px] h-[26px]"
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(e.target.value)}
              />
              <span>餐</span>
            </div>
          </div>

          <Separator />

          {/* 選取的營養品（唯讀） */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">選取的營養品</Label>
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                目前沒有勾選的營養品
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {selectedProducts.map((p, i) => (
                  <li
                    key={`${p.product_id}-${i}`}
                    className="flex justify-between rounded border px-3 py-2"
                  >
                    <span className="truncate max-w-[60%]">{p.name_zh}</span>
                    <span className="text-muted-foreground">
                      {p.quantity} × {p.serving_label}
                      {p.serving_amount > 0 && p.serving_unit
                        ? `（${p.serving_amount}${p.serving_unit}）`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="dialog-notes" className="text-sm font-bold">
              備註
            </Label>
            <textarea
              id="dialog-notes"
              className="border-input flex w-full min-h-[80px] rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              placeholder="想記下的細節（選填）"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "儲存中..." : "儲存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
