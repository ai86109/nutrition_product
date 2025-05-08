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
import { Separator } from "@/components/ui/separator"
import { useProduct } from "@/contexts/ProductContext"
import { useEffect, useState } from "react";
import productsData from '@/data/products.json';
import ChartSection from "@/components/section/product-calculate-section/chart-section"

export default function Index() {
  const { productList, setProductList } = useProduct()
  const [listData, setListData] = useState([])
  const [ingredientsData, setIngredientsData] = useState([])

  useEffect(() => {
    const selectedProducts = productList.map((productId) => {
      const product = productsData.find((product) => product.id === productId)
      if (product) {
        const rawQuantity = listData.find((list) => list.id === productId)?.quantity || 1;
        const quantity = rawQuantity > 0 ? rawQuantity : 0;
        return {
          listData: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            type: product.type,
            quantity,
            ingredients: {
              calories: product.ingredients.calories,
              carbohydrate: product.ingredients.carbohydrate,
              protein: product.ingredients.protein,
              fat: product.ingredients.fat,
              phosphorus: product.ingredients.phosphorus,
              kalium: product.ingredients.kalium,
              sodium: product.ingredients.sodium,
              fiber: product.ingredients.fiber,
            }
          },
          ingredientsData: {
            calories: product.ingredients.calories * quantity,
            carbohydrate: product.ingredients.carbohydrate * quantity,
            protein: product.ingredients.protein * quantity,
            fat: product.ingredients.fat * quantity,
            phosphorus: product.ingredients.phosphorus * quantity,
            kalium: product.ingredients.kalium * quantity,
            sodium: product.ingredients.sodium * quantity,
            fiber: product.ingredients.fiber * quantity,
          }
        }
      }

      return null
    }).filter((item) => item !== null)

    const list = selectedProducts.map((item) => item.listData)
    setListData(list)

    const ingredients = selectedProducts.reduce((acc, item) => {
      const { ingredientsData } = item
      return {
        calories: acc.calories + ingredientsData.calories,
        carbohydrate: acc.carbohydrate + ingredientsData.carbohydrate,
        protein: acc.protein + ingredientsData.protein,
        fat: acc.fat + ingredientsData.fat,
        phosphorus: acc.phosphorus + ingredientsData.phosphorus,
        kalium: acc.kalium + ingredientsData.kalium,
        sodium: acc.sodium + ingredientsData.sodium,
        fiber: acc.fiber + ingredientsData.fiber,
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
    setIngredientsData(ingredients)
  }, [productList])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const product = listData.find((item) => item.id === id)
    if (product) {
      const quantity = Number(value) > 0 ? Number(value) : 0

      setListData((prevData) => prevData.map((item) => {
        if (item.id === id) return { ...item, quantity }
        return item
      }))

      // ingredientsData
      setIngredientsData(() => {        
        const result = listData.reduce((acc, item) => {
          const { ingredients } = item
          let quantity = item.quantity > 0 ? item.quantity : 0
          if (item.id === id) {
            quantity = Number(value) > 0 ? Number(value) : 0
          }
          return {
            calories: acc.calories + (quantity * ingredients.calories),
            carbohydrate: acc.carbohydrate + (quantity * ingredients.carbohydrate),
            protein: acc.protein + (quantity * ingredients.protein),
            fat: acc.fat + (quantity * ingredients.fat),
            phosphorus: acc.phosphorus + (quantity * ingredients.phosphorus),
            kalium: acc.kalium + (quantity * ingredients.kalium),
            sodium: acc.sodium + (quantity * ingredients.sodium),
            fiber: acc.fiber + (quantity * ingredients.fiber),
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
        return result
      })
    }
  }

  const handleRemoveProduct = (productId: string) => {
    setProductList((prevData) => prevData.filter((item) => item !== productId))
  }

  return (
    <div className="flex">
      <CardContent className="w-[520px]">        
        <Table>
          <TableBody>
            {listData.length > 0 && listData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Input id={item.id} type="number" placeholder="數量" value={item.quantity} onChange={handleInputChange} />
                </TableCell>
                <TableCell>
                  <Button variant="outline" onClick={() => handleRemoveProduct(item.id)}>移除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* 可以勾選，是否加入計算 */}
        {/* 全選勾選 */}
      </CardContent>
      <Separator orientation="vertical" className="mx-2" />

      <ChartSection ingredientsData={ingredientsData} />
    </div>
  )
}