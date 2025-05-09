"use client"

import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useProduct } from "@/contexts/ProductContext"
import productsData from '@/data/products.json';
import Link from "next/link"
import { getLinkPath } from "@/utils/link"

export default function ProductSearchSection() {
  const { productList, setProductList } = useProduct()
  const data = productsData


  const handleSearchSubmit = () => {
    // 去資料庫查詢
    // 取得資料後，顯示在查詢結果區塊
  }

  const handleAddToCalculate = (productId: string) => {

    const existingProduct = productList.includes(productId)
    if (existingProduct) return

    setProductList((prevData) => [...prevData, productId])
  }

  return (
    <CardContent>
      <div>
        {/* <p>查詢區塊</p>
        <Button className="mt-4" variant="outline" onClick={handleSearchSubmit}>送出</Button> */}
        {/* 可以用下拉選單的方式去找尋品牌 */}
        {/* 可以使用類別去搜尋產品 */}
        {/* 有一個搜尋框可以用關鍵字搜尋到營養品 */}
      </div>
      <div>
        {/* <p>查詢結果</p> */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>品名</TableHead>
              <TableHead>品牌</TableHead>
              <TableHead>劑型</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link href={getLinkPath(item.id)} target="_blank">{item.name}</Link>
                </TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>
                  <Button variant="outline" onClick={() => handleAddToCalculate(item.id)}>加入</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* 顯示成分（做成 dialog？怕 table 太長） */}
        {/* 有連結可以讓他連到衛福部的該頁面查詢 */}
        {/* 顯示 tag，包括此產品的類別、特殊疾病配方？ */}
      </div>
    </CardContent>
  )
}