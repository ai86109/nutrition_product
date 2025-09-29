import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CALC_UNIT_MAPPINGS } from "@/utils/constants"
import type { SelectOption, SelectData, ProductData } from "@/types/nutrition"
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"
import { getLinkPath } from "@/utils/external-links"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { useProductCalculationEvents } from "@/hooks/useProductCalculationEvents"

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

function GetProductTypeBlock({ selectData, handleValueChange, productId }: GetProductTypeBlockProps): React.ReactElement {
  const { selectOptions } = selectData
  if (isSelectBlock(selectOptions)) return <GetSelectBlock selectData={selectData} handleValueChange={handleValueChange} productId={productId} />
  else return <GetSingleTypeBlock selectData={selectData} />
}

function GetSelectBlock({ selectData, handleValueChange, productId }: GetProductTypeBlockProps): React.ReactElement {
  const { rounding } = useNutritionCalculations()
  const { selectedId, selectOptions } = selectData
  return (
    <Select value={selectedId} onValueChange={(value: string) => handleValueChange(value, productId)}>
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      {selectOptions && (
        <SelectContent>
          {selectOptions.map((unit) => {
            const hasMultiUnitOptions = selectOptions.length > 1
            if (hasMultiUnitOptions) {
              return (
                <SelectGroup key={unit.unit}>
                  <SelectLabel>{unit.unit}</SelectLabel>
                  {unit.products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.defaultAmount}{unit.unit} = {rounding(product.defaultAmount * product.volume)}{CALC_UNIT_MAPPINGS[unit.unit]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )
            }
            
            return unit.products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.defaultAmount}{unit.unit} = {rounding(product.defaultAmount * product.volume)}{CALC_UNIT_MAPPINGS[unit.unit]}
              </SelectItem>
            ))
          })}
        </SelectContent>
      )}
    </Select>
  )
}

interface GetSingleTypeBlockProps {
  selectData: SelectData
}

function GetSingleTypeBlock({ selectData }: GetSingleTypeBlockProps): React.ReactElement {
  const { rounding } = useNutritionCalculations()
  const { selectOptions } = selectData
  const { unit, products } = selectOptions[0]
  const { defaultAmount, volume } = products[0]
  return (
    <p>{defaultAmount}{unit} = {rounding(defaultAmount * volume)}{CALC_UNIT_MAPPINGS[unit]}</p>
  )
}

const getProductUnit = ({ selectedId, selectOptions }: SelectData) => {
  const result = selectOptions.map((type) => {
    const { unit, products } = type
    if (products.find((product) => selectedId === product.id)) return unit
    return null
  }).filter((item) => item !== null)

  return result[0]
}

interface ProteinRangeBlockProps {
  proteinPerMeal: number
  mealsPerDay: number | string
}

function ProteinRangeBlock({ proteinPerMeal, mealsPerDay }: ProteinRangeBlockProps): React.ReactElement | null {
  const { rounding } = useNutritionCalculations()
  const { proteinRange } = useBioInfo();
  const { min, max } = proteinRange
  const minValue = Number(Math.min(Number(min), Number(max)))
  const maxValue = Number(Math.max(Number(min), Number(max)))
  if (minValue <= 0 && maxValue <= 0) return null

  const totalProtein = proteinPerMeal * Number(mealsPerDay)
  const isProteinInRange: boolean = totalProtein >= minValue && totalProtein <= maxValue
  let proteinRangeText = ''
  if (!isProteinInRange) {
    if (totalProtein < minValue) proteinRangeText = `低於`
    else if (totalProtein > maxValue) proteinRangeText = `高於`
  }

  return (
    <p>
      <span className="mr-1">含蛋白質：{rounding(proteinPerMeal)}g</span>
      <span className={`text-xs ${proteinRangeText ? 'text-red-700' : 'text-green-700'}`}>
        <span>({proteinRangeText}蛋白質設定範圍:{rounding(minValue / Number(mealsPerDay))}g - {rounding(maxValue / Number(mealsPerDay))}g / 餐)</span>
      </span>
    </p>
  )
}

interface CalculateDailyServingsPerMealProps {
  mealsPerDay: number | string
  item: ProductData
}

function CalculateDailyServingsPerMeal({ mealsPerDay, item }: CalculateDailyServingsPerMealProps): React.ReactElement {
  const { rounding } = useNutritionCalculations()
  const { tdee } = useBioInfo();

  // get current ratio
  const { select, defaultAmount, ingredients } = item
  const { selectedId, selectOptions } = select
  const currentAmount: number = selectOptions.map((type) => {
    const { products } = type
    return products.find((product) => selectedId === product.id)?.volume || null
  }).filter((item) => item !== null)[0] || 0

  const ratio = currentAmount / defaultAmount

  // calculate servings per meal
  const servingsPerMeal = ((Number(tdee)) / Number(mealsPerDay)) / (ingredients.calories * ratio)
  const unit = getProductUnit(select)
  const proteinPerMeal = (ingredients.protein * ratio) * servingsPerMeal

  return (
    <div className="bg-blue-50 p-2 rounded w-[200px] text-wrap lg:w-auto">
      <p>
        <span className="font-bold">每餐需要 {rounding(servingsPerMeal)} {unit} = {rounding(currentAmount * servingsPerMeal)}{CALC_UNIT_MAPPINGS[unit]}</span>
        <span>（總共 {rounding(servingsPerMeal * Number(mealsPerDay))} {unit} = {rounding(currentAmount * servingsPerMeal * Number(mealsPerDay))}{CALC_UNIT_MAPPINGS[unit]}）</span>
      </p>
      <ProteinRangeBlock proteinPerMeal={proteinPerMeal} mealsPerDay={mealsPerDay} />
    </div>
  )
}

export default function ProductTable({
  listData,
  isServingsCanBeUsed, 
  isShowServings, 
  mealsPerDay, 
  setProductList,
  setUserInputs
}: {
  listData: ProductData[],
  isServingsCanBeUsed: boolean,
  isShowServings: boolean,
  mealsPerDay: number | string,
  setProductList: React.Dispatch<React.SetStateAction<string[]>>
  setUserInputs: React.Dispatch<React.SetStateAction<{ [key: string]: { quantity: number | string; selectedId: string; checked: boolean } }>>
}) {
  const { handleCheck, handleInputChange, handleValueChange, handleRemoveProduct } = useProductCalculationEvents(listData, setProductList, setUserInputs)
  return (
    <Table>
      <TableBody>
        {listData.map((item) => (
          <>
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox id={`check-${item.id}`} checked={item.checked} onCheckedChange={(checked) => handleCheck(item.id, !!checked)} />
              </TableCell>
              <TableCell className="text-wrap lg:text-nowrap">
                <Link href={getLinkPath(item.id)} target="_blank">
                  <p className="text-wrap w-[200px] lg:w-auto">{item.name}</p>
                  {item.engName && <p className="text-xs text-wrap w-[200px] lg:w-auto">{item.engName}</p>}
                  {item.categories && item.categories.length > 0 && item.categories.map((category) => (
                    <Badge key={category} className="mt-1 mr-1" variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Input id={item.id} className="w-[70px]" type="number" placeholder="數量" value={item.quantity} onChange={handleInputChange} />
                  <span>{getProductUnit(item.select)}</span>
                </div>
              </TableCell>
              <TableCell>
                <GetProductTypeBlock selectData={item.select} handleValueChange={handleValueChange} productId={item.id} />
              </TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => handleRemoveProduct(item.id)}>移除</Button>
              </TableCell>
            </TableRow>

            {isServingsCanBeUsed && isShowServings && item.checked && (
              <TableRow key={`${item.id}-meals`}>
                <TableCell></TableCell>
                <TableCell>
                  <CalculateDailyServingsPerMeal mealsPerDay={mealsPerDay} item={item} />
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  )
}