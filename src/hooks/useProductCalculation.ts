import { useCallback, useMemo, useState } from "react"
import type { SelectOption, ProductData } from "@/types/nutrition"
import { UNIT_MAPPINGS } from "@/utils/constants"
import { type ApiProductData } from '@/types/api'
import { useProduct } from "@/contexts/ProductContext"

interface UserInput {
  quantity: string | number
  selectedId: string
  checked: boolean
}

export function useProductCalculation() {
  const { allProducts, productList } = useProduct()
  const [userInputs, setUserInputs] = useState<Record<string, UserInput>>({})

  const generateSelectOptions = (product: ApiProductData) => {
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

    return selectOptions
  }

  const transformProductFormat = useCallback((product: ApiProductData | undefined, productId: string) => {
    if (!product) return null

    const selectOptions = generateSelectOptions(product)
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
  }, [userInputs])

  const listData = useMemo((): ProductData[] => {
    return productList.map((productId) => {
      const product = allProducts.find(product => product.id === productId)
      return transformProductFormat(product, productId)
    }).filter((item) => item !== null)

  }, [allProducts, productList, transformProductFormat])

  return {
    listData,
    userInputs,
    setUserInputs,
  }
}