"use client"

import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CUSTOM_PRODUCT_REQUIRED_NUTRIENTS,
  MACRO_MINERALS,
  MACRO_NUTRIENTS,
  NUTRIENTS_GROUP,
  NUTRIENT_LABELS,
  NUTRIENT_UNITS,
  TRACE_MINERALS,
  VITAMINS,
} from '@/utils/constants'

/**
 * Local-only nutrition state：key = nutrient token (calories / protein / ...)，
 * value = 字串（保留空欄位狀態）。submit 時轉成 NutritionFacts 結構。
 */
export type NutritionState = Record<string, string>

/**
 * 把 NutritionState 轉成 DB 用的 NutritionFacts shape。
 * 空字串會被略過（不寫入 jsonb）；非數值（NaN）也會略過。
 */
export function nutritionStateToFacts(state: NutritionState) {
  const out: Record<string, { unit: string; value: number }> = {}
  for (const [key, raw] of Object.entries(state)) {
    if (raw.trim() === '') continue
    const value = Number(raw)
    if (!Number.isFinite(value)) continue
    const unit = NUTRIENT_UNITS[key] ?? ''
    out[key] = { unit, value }
  }
  return out
}

/** 由 DB 的 NutritionFacts 反向轉成 NutritionState（給 edit dialog 用）。 */
export function factsToNutritionState(
  facts: Record<string, { unit: string; value: number }> | undefined
): NutritionState {
  const out: NutritionState = {}
  if (!facts) return out
  for (const [key, entry] of Object.entries(facts)) {
    if (entry && Number.isFinite(entry.value)) {
      out[key] = String(entry.value)
    }
  }
  return out
}

interface NutritionFieldsProps {
  value: NutritionState
  onChange: (next: NutritionState) => void
  disabled?: boolean
}

const REQUIRED_KEYS = CUSTOM_PRODUCT_REQUIRED_NUTRIENTS

const OPTIONAL_GROUPS: { key: keyof typeof NUTRIENTS_GROUP; keys: readonly string[] }[] = [
  // macroNutrients 內把 4 個必填去掉，剩下 dietary_fiber 之類列在「巨量營養素 (其他)」
  {
    key: 'macroNutrients',
    keys: MACRO_NUTRIENTS.filter((k) => !REQUIRED_KEYS.includes(k as never)),
  },
  { key: 'macroMinerals', keys: MACRO_MINERALS },
  { key: 'traceMinerals', keys: TRACE_MINERALS },
  { key: 'vitamins', keys: VITAMINS },
  {
    key: 'others',
    keys: Object.keys(NUTRIENT_LABELS).filter((k) => {
      const known = new Set<string>([
        ...MACRO_NUTRIENTS,
        ...MACRO_MINERALS,
        ...TRACE_MINERALS,
        ...VITAMINS,
      ])
      return !known.has(k)
    }),
  },
]

export default function NutritionFields({
  value,
  onChange,
  disabled,
}: NutritionFieldsProps) {
  const [expanded, setExpanded] = useState(false)

  const setField = (key: string, raw: string) => {
    onChange({ ...value, [key]: raw })
  }

  const renderRow = (key: string, required: boolean) => {
    const label = NUTRIENT_LABELS[key] ?? key
    const unit = NUTRIENT_UNITS[key] ?? ''
    return (
      <div key={key} className="flex items-center gap-2">
        <Label
          htmlFor={`nutrition-${key}`}
          className="text-sm w-[110px] shrink-0"
        >
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <Input
          id={`nutrition-${key}`}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          className="flex-1 max-w-[140px]"
          value={value[key] ?? ''}
          onChange={(e) => setField(key, e.target.value)}
          disabled={disabled}
        />
        <span className="text-xs text-muted-foreground w-[50px]">{unit}</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 必填區 */}
      <div className="space-y-2">
        {REQUIRED_KEYS.map((k) => renderRow(k, true))}
      </div>

      {/* 選填區（展開/收合） */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:bg-muted/50"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        {expanded ? '收合更多營養素' : '新增更多營養素（選填）'}
      </Button>

      {expanded && (
        <div className="space-y-4">
          {OPTIONAL_GROUPS.map((group) => {
            const visibleKeys = group.keys.filter((k) => NUTRIENT_LABELS[k])
            if (visibleKeys.length === 0) return null
            return (
              <div key={group.key} className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {NUTRIENTS_GROUP[group.key]}
                </p>
                <div className="space-y-1.5">
                  {visibleKeys.map((k) => renderRow(k, false))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
