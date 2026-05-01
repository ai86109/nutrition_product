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
import { Separator } from "@/components/ui/separator"
import {
  updatePatientSnapshot,
  type SnapshotEditableFields,
} from "@/lib/supabase/mutations/patient-snapshots"
import type { PatientSnapshot, SnapshotSelectedProduct } from "@/types/patient"

interface EditSnapshotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: PatientSnapshot
  onSaved: () => void
}

export default function EditSnapshotDialog({
  open,
  onOpenChange,
  snapshot,
  onSaved,
}: EditSnapshotDialogProps) {
  // Bio info（性別不可改，從 snapshot 直接取）
  const [height, setHeight] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const gender = snapshot.bio_info.gender

  // Targets
  const [calorieTarget, setCalorieTarget] = useState<string>("")
  const [proteinMin, setProteinMin] = useState<string>("")
  const [proteinMax, setProteinMax] = useState<string>("")
  const [mealsCheck, setMealsCheck] = useState<boolean>(false)
  const [mealsPerDay, setMealsPerDay] = useState<string>("")

  // Products（可調整數量、可移除；不支援新增）
  const [products, setProducts] = useState<SnapshotSelectedProduct[]>([])

  const [saving, setSaving] = useState(false)

  // 開啟時，從 snapshot 載入初始值
  useEffect(() => {
    if (!open) return

    const bi = snapshot.bio_info
    setHeight(bi.height != null ? String(bi.height) : "")
    setWeight(bi.weight != null ? String(bi.weight) : "")

    setCalorieTarget(
      snapshot.calorie_target != null ? String(snapshot.calorie_target) : ""
    )
    setProteinMin(
      snapshot.protein_range?.min != null
        ? String(snapshot.protein_range.min)
        : ""
    )
    setProteinMax(
      snapshot.protein_range?.max != null
        ? String(snapshot.protein_range.max)
        : ""
    )
    const hasMeals = snapshot.meals_per_day != null
    setMealsCheck(hasMeals)
    setMealsPerDay(hasMeals ? String(snapshot.meals_per_day) : "")

    setProducts(snapshot.selected_products)
  }, [open, snapshot])

  const isMealsLocked = products.length !== 1

  const handleProductQuantityChange = (index: number, value: string) => {
    setProducts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, quantity: Number(value) || 0 } : p))
    )
  }

  const handleSave = async () => {
    const heightNum = height === "" ? null : Number(height)
    const weightNum = weight === "" ? null : Number(weight)
    const calorieNum = calorieTarget === "" ? null : Number(calorieTarget)
    const proteinMinNum = proteinMin === "" ? null : Number(proteinMin)
    const proteinMaxNum = proteinMax === "" ? null : Number(proteinMax)
    const hasProtein = proteinMinNum !== null || proteinMaxNum !== null
    const mealsNum =
      !isMealsLocked && mealsCheck && mealsPerDay !== "" && Number(mealsPerDay) > 0
        ? Number(mealsPerDay)
        : null

    const fields: SnapshotEditableFields = {
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
      selected_products: products,
    }

    setSaving(true)
    try {
      await updatePatientSnapshot(snapshot.id, fields)
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      alert("儲存失敗，請稍後再試")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>編輯紀錄</DialogTitle>
          <DialogDescription>修改這筆紀錄的生理資訊、每日目標與營養品。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 生理資訊 */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">生理資訊</Label>
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
            </div>
          </div>

          <Separator />

          {/* 每日目標 */}
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
                id="edit-meals-check"
                checked={mealsCheck}
                disabled={isMealsLocked}
                onCheckedChange={(c) => setMealsCheck(!!c)}
              />
              <Label htmlFor="edit-meals-check">每日</Label>
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

          {/* 營養品 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold">營養品</Label>
              {products.length === 0 && (
                <span className="text-xs text-muted-foreground">（已全部移除）</span>
              )}
            </div>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">目前沒有營養品</p>
            ) : (
              <ul className="space-y-2">
                {products.map((p, i) => (
                  <li
                    key={`${p.product_id}-${i}`}
                    className="flex items-center gap-2 rounded border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name_zh}</p>
                      <p className="text-xs text-muted-foreground">{p.serving_label}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">份數</span>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={p.quantity}
                        onChange={(e) => handleProductQuantityChange(i, e.target.value)}
                        className="w-[64px] h-7 text-sm"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
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
