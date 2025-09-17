"use client"

import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Separator } from "@/components/ui/separator"
import { useProduct } from "@/contexts/ProductContext"
import { useMemo, useState } from "react";
import ChartSection from "@/components/section/product-calculate-section/chart-section"
import Link from "next/link"
import { getLinkPath } from "@/utils/external-links"
import { UNIT_MAPPINGS, CALC_UNIT_MAPPINGS } from "@/utils/constants"
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"
import { Badge } from "@/components/ui/badge"
import type { SelectOption, SelectData, IngredientsData, ProductData } from "@/types/nutrition"
import { useBioInfo } from "@/contexts/BioInfoContext"
import BioSettings from "./bio-settings";

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
  mealsPerDay: number
}

function ProteinRangeBlock({ proteinPerMeal, mealsPerDay }: ProteinRangeBlockProps): React.ReactElement | null {
  const { rounding } = useNutritionCalculations()
  const { proteinRange } = useBioInfo();
  const { min, max } = proteinRange
  const minValue = Number(Math.min(Number(min), Number(max)))
  const maxValue = Number(Math.max(Number(min), Number(max)))
  if (minValue <= 0 && maxValue <= 0) return null

  const totalProtein = proteinPerMeal * mealsPerDay
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
        <span>({proteinRangeText}蛋白質設定範圍:{rounding(minValue / mealsPerDay)}g - {rounding(maxValue / mealsPerDay)}g / 餐)</span>
      </span>
    </p>
  )
}

interface CalculateDailyServingsPerMealProps {
  mealsPerDay: number
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
  const servingsPerMeal = ((Number(tdee)) / mealsPerDay) / (ingredients.calories * ratio)
  const unit = getProductUnit(select)
  const proteinPerMeal = (ingredients.protein * ratio) * servingsPerMeal

  return (
    <div className="bg-blue-50 p-2 rounded w-[200px] text-wrap lg:w-auto">
      <p>
        <span className="font-bold">每餐需要 {rounding(servingsPerMeal)} {unit} = {rounding(currentAmount * servingsPerMeal)}{CALC_UNIT_MAPPINGS[unit]}</span>
        <span>（總共 {rounding(servingsPerMeal * mealsPerDay)} {unit} = {rounding(currentAmount * servingsPerMeal * mealsPerDay)}{CALC_UNIT_MAPPINGS[unit]}）</span>
      </p>
      <ProteinRangeBlock proteinPerMeal={proteinPerMeal} mealsPerDay={mealsPerDay} />
    </div>
  )
}

interface UserInput {
  quantity: string | number
  selectedId: string
  checked: boolean
}

export default function Index() {
  const { productList, setProductList, allProducts } = useProduct()
  const { tdee } = useBioInfo();
  const [mealsPerDay, setMealsPerDay] = useState<number | string>(3) // default meals per day
  const [isCalculateServings, setIsCalculateServings] = useState<boolean>(false)
  const [userInputs, setUserInputs] = useState<Record<string, UserInput>>({})

  const listData = useMemo((): ProductData[] => {
    return productList.map((productId) => {
      const product = allProducts.find(product => product.id === productId)
      if (!product) return null

      let selectOptions: SelectOption[] = []
      const isMultiOptions = product.spec.length > 1

      if (isMultiOptions) {
        // 轉成 selectOptions 格式
        const tempList: Record<string, SelectOption> = {}
        product.spec.forEach((option) => {
          // 看 option.unit 有沒有在 tempList 裡
          const { unit, defaultAmount, volume } = option
          const safeUnit = unit!
          const isListed = safeUnit in tempList
          // 有的話 加入 products
          if (isListed) {
            const list = tempList[safeUnit].products
            list.push({
              id: `${UNIT_MAPPINGS[safeUnit]}-${list.length + 1}`,
              defaultAmount: Number(defaultAmount),
              volume: Number(volume)
            })
          } else {
            // 沒有的話 新建一個
            tempList[safeUnit] = {
              unit: safeUnit,
              products: [{
                id: `${UNIT_MAPPINGS[safeUnit]}-${1}`,
                defaultAmount: Number(defaultAmount),
                volume: Number(volume)
              }]
            }
          }
          
          // add to selectOptions
          selectOptions = Object.values(tempList)
        })
      } else {
        const { unit, defaultAmount, volume } = product.spec[0]
        const safeUnit = unit!
        selectOptions = [{
          unit: safeUnit,
          products: [{
            id: `${UNIT_MAPPINGS[safeUnit]}-${1}`,
            defaultAmount: Number(defaultAmount),
            volume: Number(volume)
          }]
        }]
      }

      const existingUserInput = userInputs[productId]

      const defaultSelectId = selectOptions[0].products[0].id
      const defaultQuantity = selectOptions[0].products[0].defaultAmount

      const finalQuantity = existingUserInput?.quantity ?? defaultQuantity
      const finalChecked = existingUserInput?.checked ?? true
      const finalSelectedId = existingUserInput?.selectedId ?? defaultSelectId

      return {
        id: product.id,
        name: product.name,
        engName: product.engName,
        brand: product.brand,
        defaultAmount: Number(product.defaultAmount),
        quantity: finalQuantity,
        checked: finalChecked,
        select: {
          selectedId: finalSelectedId,
          selectOptions,
        },
        ingredients: {
          calories: product.ingredients.calories,
          carbohydrate: product.ingredients.carbohydrate,
          protein: product.ingredients.protein,
          fat: product.ingredients.fat,
          phosphorus: product.ingredients.phosphorus,
          potassium: product.ingredients.potassium,
          sodium: product.ingredients.sodium,
          fiber: product.ingredients.fiber,
        },
        categories: product.categories || [],
      }
    }).filter((item) => item !== null)

  }, [allProducts, productList, userInputs])

  const ingredientsData = useMemo((): IngredientsData => {
    return listData.reduce((acc: IngredientsData, item: ProductData) => {
      if (!item.checked) return acc;
      
      const { ingredients, id } = item
      const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 0
      
      // calculate ratio
      const { selectedId, selectOptions } = item.select
      const currentAmount = selectOptions.map((type) => {
        const { products } = type
        return products.find((product) => selectedId === product.id)?.volume || null
      }).filter((item) => item !== null)
      const ratio = currentAmount[0] / item.defaultAmount

      if (!isFinite(ratio) || isNaN(ratio)) {
        console.warn(`Invalid ratio for product ${item.name} (ID: ${id}):`, ratio)
        return acc
      }
      
      return {
        calories: acc.calories + (quantity * ratio * ingredients.calories),
        carbohydrate: acc.carbohydrate + (quantity * ratio * ingredients.carbohydrate),
        protein: acc.protein + (quantity * ratio * ingredients.protein),
        fat: acc.fat + (quantity * ratio * ingredients.fat),
        phosphorus: acc.phosphorus + (quantity * ratio * ingredients.phosphorus),
        potassium: acc.potassium + (quantity * ratio * ingredients.potassium),
        sodium: acc.sodium + (quantity * ratio * ingredients.sodium),
        fiber: acc.fiber + (quantity * ratio * ingredients.fiber),
      }
    }, {
      calories: 0,
      carbohydrate: 0,
      protein: 0,
      fat: 0,
      phosphorus: 0,
      potassium: 0,
      sodium: 0,
      fiber: 0,
    })
  }, [listData])
    
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const productNew = listData.find((item) => item.id === id)
    if (productNew) {
      setUserInputs((prevInputs) => {
        return {
          ...prevInputs,
          [id]: {
            ...prevInputs[id],
            quantity: value,
          }
        }
      })
    }
  }

  const handleValueChange = (value: string, productId: string): void => {
    const productNew = listData.find((item) => item.id === productId)
    if (!productNew) return;

    const selectedQuantity = productNew.select.selectOptions
      .flatMap(type => type.products)
      .find(p => p.id === value)?.defaultAmount || productNew.quantity

    setUserInputs((prevInputs) => {
      return {
        ...prevInputs,
        [productId]: {
          ...prevInputs[productId],
          selectedId: value,
          quantity: selectedQuantity,
        }
      }
    })
  }

  const handleRemoveProduct = (productId: string): void => {
    setProductList((prevData: string[]) => prevData.filter((item) => item !== productId))

    setUserInputs((prevInputs) => {
      const updatedInputs = { ...prevInputs }
      delete updatedInputs[productId]
      return updatedInputs
    })
  }

  const handleCheck = (id: string, checked: boolean): void => {
    setUserInputs((prevInputs) => {
      return {
        ...prevInputs,
        [id]: {
          ...prevInputs[id],
          checked,
        }
      }
    })
  }

  const handleMealsCheck = (checked: boolean): void => {
    setIsCalculateServings(checked)
  }

  const handleMealsInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if (value === '') setMealsPerDay(value)
    if (isNaN(Number(value))) setMealsPerDay(0)

    const parsedValue = parseInt(value, 10)
    if (parsedValue <= 0) setMealsPerDay(0)
    else setMealsPerDay(parsedValue)
  }

  const isServingsCanBeUsed = Number(tdee) > 0 && listData.filter((item) => item.checked).length === 1

  const isShowServings = isCalculateServings && typeof mealsPerDay == 'number' && mealsPerDay > 0 && Number(tdee) > 0

  return (
    <div className="flex flex-col items-center mt-4 p-2">
      {listData.length > 0 ? (
        <div className="w-full">
          <CardContent>
            <BioSettings />
            <div className={`mt-4 text-sm ${!isServingsCanBeUsed && 'opacity-50'}`}>
              <div className="flex items-center space-x-2">
                <Checkbox disabled={!isServingsCanBeUsed} id={`check`} checked={isCalculateServings} onCheckedChange={(checked) => handleMealsCheck(!!checked)} />計算每餐所需份量，每日
                <Input disabled={!isServingsCanBeUsed} id={'meals-per-day'} className="w-[60px] h-[26px] mx-2" type="number" step={1} placeholder="數量" value={mealsPerDay} onChange={handleMealsInputChange} />餐
              </div>
              <span className="text-xs">＊此功能僅提供：當有輸入熱量時，以及選取單一營養品時使用</span>
            </div>
            <Separator className="my-4" />

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
          </CardContent>

          <Separator className="my-4" />

          <ChartSection ingredientsData={ingredientsData} />
        </div>
      ) : <p className="text-sm">請先至少<span className="font-bold">選擇一樣營養品</span>以得到其營養成分</p>}
    </div>
  )
}
