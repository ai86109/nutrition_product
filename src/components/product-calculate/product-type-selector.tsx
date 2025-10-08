import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations"
import { SelectData, SelectOption } from "@/types/nutrition"
import { CALC_UNIT_MAPPINGS } from "@/utils/constants"

interface GetSingleTypeBlockProps {
  selectData: SelectData
}

function GetSingleTypeBlock({ selectData }: GetSingleTypeBlockProps): React.ReactElement {
  const { rounding } = useBioInfoCalculations()
  const { selectOptions } = selectData
  const { unit, products } = selectOptions[0]
  const { defaultAmount, volume } = products[0]
  return (
    <p>{defaultAmount}{unit} = {rounding(defaultAmount * volume)}{CALC_UNIT_MAPPINGS[unit]}</p>
  )
}

const isSelectBlock = (selectOptions: SelectOption[]): boolean => {
  const hasMultiUnitOptions = selectOptions.length > 1
  if (hasMultiUnitOptions) return true

  const hasMultiProductsOptions = selectOptions[0].products.length > 1
  return hasMultiProductsOptions
}

interface GetProductTypeBlockProps {
  selectData: SelectData
  handleValueChange: (value: string, productId: string) => void
  productId: string
}

export function ProductTypeSelector({ selectData, handleValueChange, productId }: GetProductTypeBlockProps) {
  const { rounding } = useBioInfoCalculations()
  const { selectedId, selectOptions } = selectData

  if(!isSelectBlock(selectOptions)) {
    return <GetSingleTypeBlock selectData={selectData} />
  }

  return (
    <Select value={selectedId} onValueChange={(value: string) => handleValueChange(value, productId)}>
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      {selectOptions && (
        <SelectContent>
          {selectOptions.map((unit) => {
            const hasMultiUnitOptions = selectOptions.length > 1
            const { unit: unitName, products } = unit

            if (hasMultiUnitOptions) {
              return (
                <SelectGroup key={unitName}>
                  <SelectLabel>{unitName}</SelectLabel>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.defaultAmount}{unitName} = {rounding(product.defaultAmount * product.volume)}{CALC_UNIT_MAPPINGS[unitName]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )
            }

            return products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.defaultAmount}{unitName} = {rounding(product.defaultAmount * product.volume)}{CALC_UNIT_MAPPINGS[unitName]}
              </SelectItem>
            ))
          })}
        </SelectContent>
      )}
    </Select>
  )
}