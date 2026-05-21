"use client"

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

/**
 * Local-only variant row 形狀。submit 時轉成 CustomProductVariantInput。
 * value 用 string 是因為 number input 在「清空」時會回 NaN，用 string 才能保留空值狀態。
 */
export interface VariantRow {
  quantity: string
  volume: string
  unit: string
  is_default: boolean
}

export function emptyVariantRow(isDefault = false): VariantRow {
  return { quantity: '', volume: '', unit: '', is_default: isDefault }
}

interface VariantsFieldsProps {
  variants: VariantRow[]
  onChange: (variants: VariantRow[]) => void
  /** 預設單位（ml / g），會顯示在 volume 欄旁邊提示 */
  defaultUnit: string
  disabled?: boolean
}

export default function VariantsFields({
  variants,
  onChange,
  defaultUnit,
  disabled,
}: VariantsFieldsProps) {
  const defaultIndex = variants.findIndex((v) => v.is_default)

  const updateRow = (index: number, patch: Partial<VariantRow>) => {
    const next = variants.map((v, i) => (i === index ? { ...v, ...patch } : v))
    onChange(next)
  }

  const setDefault = (index: number) => {
    const next = variants.map((v, i) => ({ ...v, is_default: i === index }))
    onChange(next)
  }

  const addRow = () => {
    onChange([...variants, emptyVariantRow(variants.length === 0)])
  }

  const removeRow = (index: number) => {
    const removingDefault = variants[index]?.is_default
    let next = variants.filter((_, i) => i !== index)
    // 移除的是 default 時，把第一筆變成 default
    if (removingDefault && next.length > 0) {
      next = next.map((v, i) => ({ ...v, is_default: i === 0 }))
    }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <RadioGroup
        value={defaultIndex >= 0 ? String(defaultIndex) : ''}
        onValueChange={(v) => setDefault(Number(v))}
        disabled={disabled}
      >
        <ul className="space-y-2">
          {variants.map((row, idx) => (
            <li
              key={idx}
              className={cn(
                'flex flex-wrap items-center gap-2 rounded-md border p-2',
                row.is_default ? 'border-primary/40 bg-primary/5' : 'border-border'
              )}
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="份數"
                  className="w-[80px]"
                  value={row.quantity}
                  onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                  disabled={disabled}
                />
                <Input
                  type="text"
                  placeholder="罐/包/匙"
                  className="w-[80px]"
                  value={row.unit}
                  onChange={(e) => updateRow(idx, { unit: e.target.value })}
                  disabled={disabled}
                />
                <span className="text-sm text-muted-foreground">=</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="容量"
                  className="w-[90px]"
                  value={row.volume}
                  onChange={(e) => updateRow(idx, { volume: e.target.value })}
                  disabled={disabled}
                />
                <span className="text-xs text-muted-foreground">{defaultUnit}</span>
              </div>

              <div className="flex items-center gap-1 ml-auto">
                <RadioGroupItem
                  value={String(idx)}
                  id={`variant-default-${idx}`}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`variant-default-${idx}`}
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  預設
                </Label>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => removeRow(idx)}
                disabled={disabled || variants.length === 1}
                title={variants.length === 1 ? '至少需要一組' : '移除'}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </RadioGroup>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        disabled={disabled}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4" />
        新增包裝規格
      </Button>
    </div>
  )
}
