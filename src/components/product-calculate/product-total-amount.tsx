import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations"
import { ProductData, SelectData } from "@/types/nutrition"
import { CALC_UNIT_MAPPINGS } from "@/utils/constants"

const getSelectedProductInfo = ({ selectedId, selectOptions }: SelectData) => {
  for (const type of selectOptions) {
    const matched = type.products.find((product) => product.id === selectedId)
    if (matched) return { unit: type.unit, volume: matched.volume }
  }
  return null
}

export function ProductTotalAmount({ item }: { item: ProductData }) {
  const { rounding } = useBioInfoCalculations()
  const selected = getSelectedProductInfo(item.select)

  const quantity = Number(item.quantity)
  if (!selected || !isFinite(quantity) || quantity <= 0) {
    return <span className="text-muted-foreground">—</span>
  }

  const total = rounding(quantity * selected.volume)
  return (
    <span className="text-nowrap">
      ≈
      {total}
      {CALC_UNIT_MAPPINGS[selected.unit] ?? ""}
    </span>
  )
}
