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
import { useCallback, useEffect, useState } from "react";
// import productsData from '@/data/products.json';
import ChartSection from "@/components/section/product-calculate-section/chart-section"
import Link from "next/link"
import { getLinkPath } from "@/utils/link"
import { unitMapping, calcUnitMapping } from "@/utils/mappings"
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"
import { Badge } from "@/components/ui/badge"

type listDataType = {
  id: string
  name: string
  engName: string
  brand: string
  defaultAmount: number
  quantity: number
  checked: boolean
  select: {
    selectedId: string
    selectOptions: {
      unit: string
      products: {
        id: string
        defaultAmount: number
        volume: number
      }[]
    }[]
  }
  ingredients: {
    calories: number
    carbohydrate: number
    protein: number
    fat: number
    phosphorus: number
    kalium: number
    sodium: number
    fiber: number
  }
  categories: string[]
}

const isSelectBlock = (selectOptions) => {
  const hasMultiUnitOptions = selectOptions.length > 1
  if (hasMultiUnitOptions) return true

  const hasMultiProductsOptions = selectOptions[0].products.length > 1
  return hasMultiProductsOptions
}

function GetProductTypeBlock({ selectData, handleValueChange, productId }) {
  const { selectOptions } = selectData
  if (isSelectBlock(selectOptions)) return <GetSelectBlock selectData={selectData} handleValueChange={handleValueChange} productId={productId} />
  else return <GetSingleTypeBlock selectData={selectData} />
}

function GetSelectBlock({ selectData, handleValueChange, productId }) {
  const { rounding } = useNutritionCalculations()
  const { selectedId, selectOptions } = selectData
  return (
    <Select value={selectedId} onValueChange={(value) => handleValueChange(value, productId)}>
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
                      {product.defaultAmount}{unit.unit} = {rounding(product.defaultAmount * product.volume)}{calcUnitMapping[unit.unit]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )
            }
            
            return unit.products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.defaultAmount}{unit.unit} = {rounding(product.defaultAmount * product.volume)}{calcUnitMapping[unit.unit]}
              </SelectItem>
            ))
          })}
        </SelectContent>
      )}
    </Select>
  )
}

function GetSingleTypeBlock({ selectData }) {
  const { rounding } = useNutritionCalculations()
  const { selectOptions } = selectData
  const { unit, products } = selectOptions[0]
  const { defaultAmount, volume } = products[0]
  return (
    <p>{defaultAmount}{unit} = {rounding(defaultAmount * volume)}{calcUnitMapping[unit]}</p>
  )
}

export default function Index() {
  const { productList, setProductList, allProducts } = useProduct()
  const [listData, setListData] = useState([])
  const [ingredientsData, setIngredientsData] = useState([])
  
  const calculateIngredients = useCallback((data, rewriteId = null, rewriteQuantity = null) => {
    return data.reduce((acc, item) => {
      if (!item.checked) return acc;
      
      const { ingredients, id } = item
      let quantity = item.quantity > 0 ? item.quantity : 0
      
      if (rewriteId && rewriteQuantity && id === rewriteId) {
        quantity = rewriteQuantity > 0 ? rewriteQuantity : 0
      }

      // calculate ratio
      const { selectedId, selectOptions } = item.select
      const currentAmount = selectOptions.map((type) => {
        const { products } = type
        return products.find((product) => selectedId === product.id)?.volume || null
      }).filter((item) => item !== null)
      const ratio = currentAmount[0] / item.defaultAmount
      
      return {
        calories: acc.calories + (quantity * ratio * ingredients.calories),
        carbohydrate: acc.carbohydrate + (quantity * ratio * ingredients.carbohydrate),
        protein: acc.protein + (quantity * ratio * ingredients.protein),
        fat: acc.fat + (quantity * ratio * ingredients.fat),
        phosphorus: acc.phosphorus + (quantity * ratio * ingredients.phosphorus),
        kalium: acc.kalium + (quantity * ratio * ingredients.kalium),
        sodium: acc.sodium + (quantity * ratio * ingredients.sodium),
        fiber: acc.fiber + (quantity * ratio * ingredients.fiber),
      }
    }, {
      calories: 0,
      carbohydrate: 0,
      protein: 0,
      fat: 0,
      phosphorus: 0,
      kalium: 0,
      sodium: 0,
      fiber: 0,
    })
  }, [listData])
  
  useEffect(() => {
    setListData(prevListData => {
      const existingMap = new Map(prevListData.map(item => [item.id, item]))

      const newListData = productList.map(productId => {
        if (existingMap.has(productId)) {
          return existingMap.get(productId)
        }

        const product = allProducts.find(product => product.id === productId)
        if (!product) return null

        let selectOptions = []
        const isMultiOptions = product.spec.length > 1

        if (isMultiOptions) {
          // 轉成 selectOptions 格式
          const tempList = {}
          product.spec.forEach((option) => {
            // 看 option.unit 有沒有在 tempList 裡
            const { unit, defaultAmount, volume } = option
            const isListed = unit in tempList
            // 有的話 加入 products
            if (isListed) {
              const list = tempList[unit].products
              list.push({
                id: `${unitMapping[unit]}-${list.length + 1}`,
                defaultAmount,
                volume
              })
            } else {
              // 沒有的話 新建一個
              tempList[unit] = {
                unit,
                products: [{
                  id: `${unitMapping[unit]}-${1}`,
                  defaultAmount,
                  volume
                }]
              }
            }
            
            // add to selectOptions
            selectOptions = Object.values(tempList)
          })
        } else {
          const { unit, defaultAmount, volume } = product.spec[0]
          selectOptions = [{
            unit: unit,
            products: [{
              id: `${unitMapping[unit]}-${1}`,
              defaultAmount,
              volume
            }]
          }]
        }
        
        return {
          id: product.id,
          name: product.name,
          engName: product.engName,
          brand: product.brand,
          defaultAmount: product.defaultAmount,
          quantity: selectOptions[0].products[0].defaultAmount,
          checked: true,
          select: {
            selectedId: selectOptions[0].products[0].id,
            selectOptions,
          },
          ingredients: {
            calories: product.ingredients.calories,
            carbohydrate: product.ingredients.carbohydrate,
            protein: product.ingredients.protein,
            fat: product.ingredients.fat,
            phosphorus: product.ingredients.phosphorus,
            kalium: product.ingredients.kalium,
            sodium: product.ingredients.sodium,
            fiber: product.ingredients.fiber,
          },
          categories: product.categories || [],
        }
      }).filter((item) => item !== null)

      return newListData
    })
  }, [productList])
  
  useEffect(() => {
    setIngredientsData(calculateIngredients(listData))
  }, [listData, calculateIngredients])
  
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const product = listData.find((item) => item.id === id)
    if (product) {      
      setListData((prevData) => prevData.map((item) => {
        if (item.id === id) return { ...item, quantity: value }
        return item
      }))
      
      setIngredientsData(calculateIngredients(listData, id, value))
    }
  }

  const handleValueChange = (value, productId) => {
    const product = listData.find(item => item.id === productId);
    if (!product) return;

    setListData((prevData) => prevData.map((item) => {
      if (item.id === productId) {
        const selectedId = value
        const selectedQuantity = item.select.selectOptions.map((type) => {
          const { products } = type
          return products.find((product) => selectedId === product.id)?.defaultAmount || null
        }).filter((item) => item !== null)
        
        return { 
          ...item,
          select: {
            ...item.select,
            selectedId: value,
          },
          quantity: selectedQuantity[0] || item.quantity,
        }
      }

      return item
    }))
  }

  const handleRemoveProduct = (productId: string) => {
    setProductList((prevData: string[]) => prevData.filter((item) => item !== productId))
  }

  const handleCheck = (id: string, checked: boolean) => {
    setListData((prevData: listDataType) => prevData.map((item) => {
      if (item.id === id) return { ...item, checked }
      return item;
    }))
  }

  const getProductUnit = ({ selectedId, selectOptions }) => {
    const result = selectOptions.map((type) => {
      const { unit, products } = type
      if (products.find((product) => selectedId === product.id)) return unit
      return null
    }).filter((item) => item !== null)

    return result[0]
  }

  return (
    <div className="flex flex-col">
      <CardContent>        
        <Table>
          <TableBody>
            {listData.length > 0 && listData.map((item) => (
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
            ))}
          </TableBody>
        </Table>
        {/* 全選勾選 */}
      </CardContent>
      <Separator className="my-4" />

      <ChartSection ingredientsData={ingredientsData} />
    </div>
  )
}