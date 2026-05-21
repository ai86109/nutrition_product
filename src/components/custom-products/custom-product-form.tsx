"use client"

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import VariantsFields, {
  emptyVariantRow,
  type VariantRow,
} from './variants-fields'
import NutritionFields, {
  factsToNutritionState,
  nutritionStateToFacts,
  type NutritionState,
} from './nutrition-fields'
import { useProduct } from '@/contexts/ProductContext'
import { CustomProductPayloadSchema } from '@/lib/custom-products/schema'
import {
  CUSTOM_PRODUCT_FORMS,
  MAX_CUSTOM_PRODUCT_BRAND_LENGTH,
  MAX_CUSTOM_PRODUCT_NAME_EN_LENGTH,
  MAX_CUSTOM_PRODUCT_NAME_ZH_LENGTH,
} from '@/utils/constants'
import type {
  CustomProductForm,
  CustomProductInput,
  CustomProductVariantInput,
  CustomProductWeightUnit,
  CustomProductWithVariants,
} from '@/types/custom-product'
import { cn } from '@/lib/utils'

const FORM_LABELS: Record<CustomProductForm, string> = {
  liquid: '液劑',
  powder: '粉劑',
  solid: '固態',
}

/** 劑型決定計量單位：液劑用 ml，粉劑 / 固態用 g。使用者不需另外選單位。 */
const FORM_WEIGHT_UNIT: Record<CustomProductForm, CustomProductWeightUnit> = {
  liquid: 'ml',
  powder: 'g',
  solid: 'g',
}

/** 表單內部使用的 state；submit 時轉成 mutation input。 */
interface FormState {
  name_zh: string
  name_en: string
  brand: string
  form: CustomProductForm
  standard_weight: string
  variants: VariantRow[]
  nutrition: NutritionState
}

function initialStateFrom(
  existing?: CustomProductWithVariants
): FormState {
  if (!existing) {
    return {
      name_zh: '',
      name_en: '',
      brand: '',
      form: 'liquid',
      standard_weight: '',
      variants: [emptyVariantRow(true)],
      nutrition: {},
    }
  }
  return {
    name_zh: existing.name_zh,
    name_en: existing.name_en ?? '',
    brand: existing.brand,
    form: existing.form,
    standard_weight: String(existing.standard_weight),
    variants:
      existing.variants.length > 0
        ? existing.variants.map((v) => ({
            quantity: String(v.quantity),
            volume: String(v.volume),
            unit: v.unit,
            is_default: v.is_default,
          }))
        : [emptyVariantRow(true)],
    nutrition: factsToNutritionState(existing.nutrition_facts),
  }
}

export interface CustomProductFormSubmitPayload {
  product: CustomProductInput
  variants: CustomProductVariantInput[]
}

interface CustomProductFormProps {
  /** 給 edit dialog 用 — 帶入現有資料初始化欄位 */
  initial?: CustomProductWithVariants
  onSubmit: (payload: CustomProductFormSubmitPayload) => Promise<void> | void
  /** 是否禁用整個表單（submitting 中） */
  disabled?: boolean
  /** Submit 按鈕的文字（新增 / 儲存） */
  submitLabel: string
  /** 取消按鈕的 onClick */
  onCancel: () => void
  /** Submit 按鈕在送出時顯示的 loading 文字 */
  submittingLabel?: string
  submitting?: boolean
}

export default function CustomProductForm({
  initial,
  onSubmit,
  disabled,
  submitLabel,
  onCancel,
  submittingLabel = '處理中...',
  submitting,
}: CustomProductFormProps) {
  const { brandOptions } = useProduct()
  const [state, setState] = useState<FormState>(() => initialStateFrom(initial))
  const [errors, setErrors] = useState<string[]>([])

  // 計量單位由劑型決定（液劑→ml、粉劑/固態→g），不再讓使用者手選。
  const weightUnit = FORM_WEIGHT_UNIT[state.form]

  // 把 brandOptions 過濾掉「全部」，取出去重後的純品牌名清單給 datalist 用
  const brandSuggestions = useMemo(
    () =>
      brandOptions
        .map((b) => b.name)
        .filter((name) => name && name !== '全部'),
    [brandOptions]
  )

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled || submitting) return

    // 把表單 state 轉成 mutation input shape
    const variantsInput: CustomProductVariantInput[] = state.variants.map(
      (v, idx) => ({
        quantity: Number(v.quantity),
        volume: Number(v.volume),
        unit: v.unit,
        is_default: v.is_default,
        sort_order: idx,
      })
    )

    const product: CustomProductInput = {
      name_zh: state.name_zh,
      name_en: state.name_en.trim() === '' ? null : state.name_en,
      brand: state.brand,
      form: state.form,
      standard_weight: Number(state.standard_weight),
      weight_unit: weightUnit,
      nutrition_facts: nutritionStateToFacts(state.nutrition),
    }

    // Zod 驗證
    const parsed = CustomProductPayloadSchema.safeParse({
      product,
      variants: variantsInput,
    })

    if (!parsed.success) {
      const msgs = parsed.error.issues.map((iss) => iss.message)
      setErrors(msgs)
      return
    }

    setErrors([])
    await onSubmit({ product, variants: variantsInput })
  }

  const isLocked = disabled || submitting

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 基本資訊 */}
      <div className="space-y-2">
        <Label className="text-sm font-bold">基本資訊</Label>

        <div className="flex items-center gap-2">
          <Label htmlFor="cp-name-zh" className="text-sm w-[80px] shrink-0">
            產品名稱<span className="text-destructive ml-0.5">*</span>
          </Label>
          <Input
            id="cp-name-zh"
            value={state.name_zh}
            onChange={(e) => patch('name_zh', e.target.value)}
            maxLength={MAX_CUSTOM_PRODUCT_NAME_ZH_LENGTH + 10}
            disabled={isLocked}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="cp-name-en" className="text-sm w-[80px] shrink-0">
            英文名稱
          </Label>
          <Input
            id="cp-name-en"
            value={state.name_en}
            onChange={(e) => patch('name_en', e.target.value)}
            maxLength={MAX_CUSTOM_PRODUCT_NAME_EN_LENGTH + 10}
            placeholder="選填"
            disabled={isLocked}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="cp-brand" className="text-sm w-[80px] shrink-0">
            品牌<span className="text-destructive ml-0.5">*</span>
          </Label>
          <Input
            id="cp-brand"
            value={state.brand}
            onChange={(e) => patch('brand', e.target.value)}
            list="cp-brand-suggestions"
            maxLength={MAX_CUSTOM_PRODUCT_BRAND_LENGTH + 10}
            placeholder="可從下拉選現有品牌或自行輸入"
            disabled={isLocked}
          />
          <datalist id="cp-brand-suggestions">
            {brandSuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm w-[80px] shrink-0">
            劑型<span className="text-destructive ml-0.5">*</span>
          </Label>
          <Select
            value={state.form}
            onValueChange={(v) => patch('form', v as CustomProductForm)}
            disabled={isLocked}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOM_PRODUCT_FORMS.map((f) => (
                <SelectItem key={f} value={f}>
                  {FORM_LABELS[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            單位：{weightUnit}（自動帶入）
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="cp-std-weight" className="text-sm w-[80px] shrink-0">
            預設重量<span className="text-destructive ml-0.5">*</span>
          </Label>
          <Input
            id="cp-std-weight"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={state.standard_weight}
            onChange={(e) => patch('standard_weight', e.target.value)}
            className="w-[140px]"
            placeholder="100"
            disabled={isLocked}
          />
          <span className="text-xs text-muted-foreground">
            {weightUnit}（下方營養成分依此標準填入）
          </span>
        </div>
      </div>

      <Separator />

      {/* 包裝規格 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold">
            包裝規格<span className="text-destructive ml-0.5">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">
            至少需要一組，選擇一組作為預設
          </span>
        </div>
        <VariantsFields
          variants={state.variants}
          onChange={(v) => patch('variants', v)}
          defaultUnit={weightUnit}
          disabled={isLocked}
        />
      </div>

      <Separator />

      {/* 營養成分 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold">營養成分</Label>
          <span className="text-xs text-muted-foreground">
            每 {state.standard_weight || '?'} {weightUnit} 的含量
          </span>
        </div>
        <NutritionFields
          value={state.nutrition}
          onChange={(n) => patch('nutrition', n)}
          disabled={isLocked}
        />
      </div>

      {/* Error 區 */}
      {errors.length > 0 && (
        <div
          className={cn(
            'rounded-md border border-destructive/30 bg-destructive/5 p-3',
            'text-sm text-destructive space-y-1'
          )}
        >
          {errors.map((msg, i) => (
            <p key={i}>・{msg}</p>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent disabled:opacity-50"
          disabled={isLocked}
        >
          取消
        </button>
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50"
          disabled={isLocked}
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}
