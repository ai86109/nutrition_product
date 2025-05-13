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
import { useCallback, useEffect, useState } from "react";
import productsData from '@/data/products.json';
import ChartSection from "@/components/section/product-calculate-section/chart-section"
import Link from "next/link"
import { getLinkPath } from "@/utils/link"

export default function Index() {
  const { productList, setProductList } = useProduct()
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
  }, [listData])

  useEffect(() => {
    const selectedProducts = productList.map((productId) => {
      const product = productsData.find((product) => product.id === productId)
      if (product) {
        const rawQuantity = listData.find((list) => list.id === productId)?.quantity || 1;
        const quantity = rawQuantity > 0 ? rawQuantity : 0;
        return {
          id: product.id,
          name: product.name,
          engName: product.engName,
          brand: product.brand,
          type: product.type,
          defaultAmount: product.defaultAmount,
          quantity,
          checked: true,
          spec: product.spec,
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
        }
      }

      return null
    }).filter((item) => item !== null)

    setListData(selectedProducts)
  }, [productList])

  useEffect(() => {
    setIngredientsData(calculateIngredients(listData))
  }, [listData, calculateIngredients])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const product = listData.find((item) => item.id === id)
    if (product) {
      const quantity = Number(value) > 0 ? Number(value) : 0

      setListData((prevData) => prevData.map((item) => {
        if (item.id === id) return { ...item, quantity }
        return item
      }))

      setIngredientsData(calculateIngredients(listData, id, value))
    }
  }

  const handleRemoveProduct = (productId: string) => {
    setProductList((prevData) => prevData.filter((item) => item !== productId))
  }

  const handleCheck = (id: string, checked: boolean) => {
    setListData((prevData) => prevData.map((item) => {
      if (item.id === id) return { ...item, checked }
      return item;
    }))
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
                <TableCell className="max-w-[200px]" style={{ textWrap: 'wrap'}}>
                  <Link href={getLinkPath(item.id)} target="_blank">
                    <p>{item.name}</p>
                    {item.engName && <p className="text-xs">{item.engName}</p>}
                  </Link>
                </TableCell>
                <TableCell>
                  <Input id={item.id} className="w-[70px]" type="number" placeholder="數量" value={item.quantity} onChange={handleInputChange} />
                </TableCell>
                <TableCell>
                  <Button variant="outline" onClick={() => handleRemoveProduct(item.id)}>移除</Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                亞培葡勝納SR原味+纖維糖尿病營養品
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Input type="number" placeholder="數量" value={1} className="w-[70px]" />
                  {/* 做成dropdown */}
                  <span>包</span>
                </div>
              </TableCell>
              <TableCell>
                1 包 = 52.1g
              </TableCell>
              <TableCell>
                <Button variant="outline">移除</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <p>亞培葡勝納SR原味+纖維糖尿病營養品</p>
                <p>GLUCERNA TRIPLE CARE VANILLA POWDER</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Input type="number" placeholder="數量" value={1} className="w-[70px]" />
                  {/* 做成dropdown */}
                  <span>匙</span>
                </div>
              </TableCell>
              <TableCell>
                5 匙 = 52.1g
              </TableCell>
              <TableCell>
                <Button variant="outline">移除</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {/* 全選勾選 */}
      </CardContent>
      <Separator className="my-4" />

      <ChartSection ingredientsData={ingredientsData} />
    </div>
  )
}