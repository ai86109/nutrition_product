"use client"

// kcal 模式下顯示「對應到原始單位」的小字。
//
// 計算邏輯：
//   factor = kcal / caloriesPer100
//   mass   = factor * 100        // g（粉劑）或 ml（液劑）
//   count  = mass / volume       // volume = 選定變體的「每單位 g/ml」
//
// 變體：來自 ApiProductData.spec[]。每筆 { unit, defaultAmount, volume }，
//       同一個 unit 下可能有多筆（不同匙規）。多變體時用 Select 切換，
//       單一變體則純文字顯示。

import { useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProcessedSpec } from "@/types/api"
import { CALC_UNIT_MAPPINGS, UNIT_MAPPINGS } from "@/utils/constants"
import { cn } from "@/lib/utils"

interface SpecVariantOption {
  key: string
  unit: string
  defaultAmount: number
  volume: number
}

const buildSpecVariantOptions = (
  spec: ProcessedSpec[] | undefined,
): SpecVariantOption[] => {
  if (!spec || spec.length === 0) return []
  const counters: Record<string, number> = {}
  return spec
    .map((s) => {
      const unit = s.unit ?? ""
      const defaultAmount = Number(s.defaultAmount)
      const volume = Number(s.volume)
      if (!unit || !isFinite(defaultAmount) || !isFinite(volume) || volume <= 0) {
        return null
      }
      const slug = UNIT_MAPPINGS[unit] ?? unit
      counters[slug] = (counters[slug] ?? 0) + 1
      return {
        key: `${slug}-${counters[slug]}`,
        unit,
        defaultAmount,
        volume,
      } as SpecVariantOption
    })
    .filter((v): v is SpecVariantOption => v !== null)
}

// 把同 unit 的變體聚合成 Select 用的群組
const groupSpecVariants = (
  options: SpecVariantOption[],
): { unit: string; items: SpecVariantOption[] }[] => {
  const groups: { unit: string; items: SpecVariantOption[] }[] = []
  for (const o of options) {
    const last = groups[groups.length - 1]
    if (last && last.unit === o.unit) last.items.push(o)
    else groups.push({ unit: o.unit, items: [o] })
  }
  return groups
}

// 顯示用的小數處理：去尾零、最多保留 1 位（與 250kcal→55.1g 描述一致）
const formatAmount = (value: number): string => {
  if (!isFinite(value) || isNaN(value)) return "-"
  return Number(value.toFixed(1)).toString()
}

// 根據劑型決定 mass 顯示單位（ml / g / g/ml fallback）
const getMassUnit = (type: string): string =>
  type === "液劑" ? "ml" : type === "粉劑" ? "g" : "g/ml"

interface KcalUnitDisplayProps {
  spec: ProcessedSpec[] | undefined
  type: string
  caloriesPer100: number
  kcalInput: string
  selectedKey: string | null
  onSelectedKeyChange: (key: string) => void
  className?: string
}

export function KcalUnitDisplay({
  spec,
  type,
  caloriesPer100,
  kcalInput,
  selectedKey,
  onSelectedKeyChange,
  className,
}: KcalUnitDisplayProps) {
  const variants = useMemo(() => buildSpecVariantOptions(spec), [spec])
  const groups = useMemo(() => groupSpecVariants(variants), [variants])

  const kcal = parseFloat(kcalInput)
  if (!kcal || kcal <= 0 || isNaN(kcal)) return null
  if (!caloriesPer100 || caloriesPer100 <= 0) return null

  const massUnit = getMassUnit(type)
  const mass = (kcal / caloriesPer100) * 100

  // 找到目前選定的變體；若 selectedKey 不在 variants 內（例如剛切換產品）就退回第一筆
  const selected =
    variants.find((v) => v.key === selectedKey) ?? variants[0] ?? null

  // 沒有任何變體 → 只顯示 mass，無 count、無括號
  if (!selected) {
    return (
      <div className={cn("text-xs text-muted-foreground", className)}>
        ≈ {formatAmount(mass)}
        {massUnit}
      </div>
    )
  }

  const count = mass / selected.volume
  const refTotal = selected.defaultAmount * selected.volume
  const refUnit = CALC_UNIT_MAPPINGS[selected.unit] ?? massUnit
  const isMultiVariant = variants.length > 1

  // 共用：括號內單一變體時的純文字
  const refText = (v: SpecVariantOption) =>
    `${formatAmount(v.defaultAmount)}${v.unit}=${formatAmount(
      v.defaultAmount * v.volume
    )}${CALC_UNIT_MAPPINGS[v.unit] ?? getMassUnit(type)}`

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground",
        className
      )}
    >
      <span className="tabular-nums">
        {formatAmount(mass)}
        {massUnit}
      </span>
      <span>≈</span>
      <span className="tabular-nums">
        {formatAmount(count)}
        {selected.unit}
      </span>
      {isMultiVariant ? (
        <span className="flex items-center gap-1">
          <span>（以</span>
          <Select value={selected.key} onValueChange={onSelectedKeyChange}>
            <SelectTrigger
              size="sm"
              className="h-6 px-2 py-0 text-xs gap-1 w-auto min-w-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) =>
                groups.length > 1 ? (
                  <SelectGroup key={g.unit}>
                    <SelectLabel>{g.unit}</SelectLabel>
                    {g.items.map((v) => (
                      <SelectItem key={v.key} value={v.key}>
                        {refText(v)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : (
                  g.items.map((v) => (
                    <SelectItem key={v.key} value={v.key}>
                      {refText(v)}
                    </SelectItem>
                  ))
                )
              )}
            </SelectContent>
          </Select>
          <span>）</span>
        </span>
      ) : (
        <span>
          （以 {formatAmount(selected.defaultAmount)}
          {selected.unit}={formatAmount(refTotal)}
          {refUnit}）
        </span>
      )}
    </div>
  )
}
