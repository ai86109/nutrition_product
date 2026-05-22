"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { compressImage } from '@/lib/image-compression'
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
import { useProductOptional } from '@/contexts/ProductContext'
import { CustomProductPayloadSchema } from '@/lib/custom-products/schema'
import {
  CUSTOM_PRODUCT_FORMS,
  CUSTOM_PRODUCT_FORM_WEIGHT_UNIT,
  MAX_CUSTOM_PRODUCT_BRAND_LENGTH,
  MAX_CUSTOM_PRODUCT_NAME_EN_LENGTH,
  MAX_CUSTOM_PRODUCT_NAME_ZH_LENGTH,
} from '@/utils/constants'
import type {
  CustomProductForm,
  CustomProductInput,
  CustomProductVariantInput,
  CustomProductWithVariants,
} from '@/types/custom-product'
import { cn } from '@/lib/utils'

const FORM_LABELS: Record<CustomProductForm, string> = {
  liquid: '液劑',
  powder: '粉劑',
  solid: '固態',
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
  /** 新選並壓縮好的圖片 blob；null/undefined = 沒有新圖 */
  imageBlob?: Blob | null
  /** 使用者清除了原本的圖片（edit 用）；新增時恆 false */
  imageRemoved?: boolean
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
  /**
   * 外部直接提供的品牌建議清單。沒有 ProductProvider 的頁面（例如 /profile 個人中心）
   * 用這個帶入；未提供時退回 ProductContext 的 brandOptions（首頁）。
   */
  brandSuggestions?: string[]
  /** 既有圖片的簽名 URL（edit 用，顯示目前圖片）；新增時不傳。 */
  initialImageUrl?: string
}

export default function CustomProductForm({
  initial,
  onSubmit,
  disabled,
  submitLabel,
  onCancel,
  submittingLabel = '處理中...',
  submitting,
  brandSuggestions: brandSuggestionsProp,
  initialImageUrl,
}: CustomProductFormProps) {
  // 用 optional 版：/profile 沒有 ProductProvider，拿不到就退回 prop 帶入的品牌建議
  const product = useProductOptional()
  const [state, setState] = useState<FormState>(() => initialStateFrom(initial))
  const [errors, setErrors] = useState<string[]>([])

  // 計量單位由劑型決定（液劑→ml、粉劑/固態→g），不再讓使用者手選。
  const weightUnit = CUSTOM_PRODUCT_FORM_WEIGHT_UNIT[state.form]

  // 品牌建議：外部 prop 優先（/profile）；否則退回 context 的 brandOptions（首頁）
  const brandSuggestions = useMemo(() => {
    if (brandSuggestionsProp) {
      return brandSuggestionsProp.filter((name) => name && name !== '全部')
    }
    return (product?.brandOptions ?? [])
      .map((b) => b.name)
      .filter((name) => name && name !== '全部')
  }, [brandSuggestionsProp, product?.brandOptions])

  // ---- 產品圖片（單張，選填）----
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [compressing, setCompressing] = useState(false)

  // 卸載時釋放 object URL，避免記憶體洩漏
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  // 預覽：移除後為 null；否則新選的優先，其次是既有圖（edit）
  const previewUrl = imageRemoved ? null : imagePreview ?? initialImageUrl ?? null

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 清掉才能再次選同一個檔也觸發 onChange
    if (!file) return
    setCompressing(true)
    try {
      const { blob } = await compressImage(file)
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      const url = URL.createObjectURL(blob)
      objectUrlRef.current = url
      setImageBlob(blob)
      setImagePreview(url)
      setImageRemoved(false)
    } catch (err) {
      console.error('Image compress failed:', err)
      toast.error('圖片處理失敗，請換一張試試')
    } finally {
      setCompressing(false)
    }
  }

  const handleRemoveImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setImageBlob(null)
    setImagePreview(null)
    setImageRemoved(true)
  }

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
    await onSubmit({
      product,
      variants: variantsInput,
      imageBlob,
      imageRemoved,
    })
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

      {/* 產品圖片 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold">產品圖片</Label>
          <span className="text-xs text-muted-foreground">選填，單張</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
          disabled={isLocked || compressing}
        />

        {previewUrl ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="產品圖片預覽"
              className="h-20 w-20 rounded-md border object-cover"
            />
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLocked || compressing}
                className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent disabled:opacity-50"
              >
                {compressing ? '處理中...' : '更換圖片'}
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isLocked || compressing}
                className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
              >
                移除圖片
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLocked || compressing}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:bg-accent/50 disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[11px]">{compressing ? '處理中' : '上傳'}</span>
          </button>
        )}
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
