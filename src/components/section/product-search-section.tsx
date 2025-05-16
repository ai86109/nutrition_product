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
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  // PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function ProductSearchSection() {
  const { productList, setProductList } = useProduct()
  const [searchValue, setSearchValue] = useState<string>("")
  const [data, setData] = useState([])

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)

  useEffect(() => {
    setData(productsData)
  }, [])

  const handleInputChange = (e) => {
    const { value } = e.target
    setSearchValue(value)
  }

  const handleSearchSubmit = () => {
    console.log("查詢資料", searchValue)

    const filteredData = productsData.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchValue.toLowerCase())
      const engNameMatch = item.engName && item.engName.toLowerCase().includes(searchValue.toLowerCase())
      const brandMatch = item.brand.toLowerCase().includes(searchValue.toLowerCase())
      const typeMatch = item.type.toLowerCase().includes(searchValue.toLowerCase())
      return nameMatch || engNameMatch || brandMatch || typeMatch
    })
    console.log("查詢結果", filteredData)
    setData(filteredData)
    setCurrentPage(1) // Reset to the first page after search
  }

  const handleAddToCalculate = (productId: string) => {

    const existingProduct = productList.includes(productId)
    if (existingProduct) return

    setProductList((prevData) => [...prevData, productId])
  }

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderPaginationItems = () => {
    // 頁數太多食藥加上省略符號
    // console.log("totalPages", totalPages)

    // 將 totalPages 做成一個從 1 開始的陣列
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    return pages.map((page) => (
      <PaginationItem key={page} onClick={() => handlePageChange(page)}>
        <PaginationLink isActive={currentPage === page}>{page}</PaginationLink>
      </PaginationItem>
    ))
  }

  return (
    <CardContent>
      <div className="flex items-center justify-between space-x-2">
        <Input className="w-[300px]" placeholder="關鍵字搜尋" onChange={handleInputChange} />
        <Button variant="outline" onClick={handleSearchSubmit}>送出</Button>
        {/* 可以用下拉選單的方式去找尋品牌 */}
        {/* 可以使用類別去搜尋產品 */}
      </div>

      <div>
        {getCurrentPageData().length > 0 && (
          <div>
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
                {getCurrentPageData().map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[200px]" style={{ textWrap: 'wrap'}}>
                      <Link href={getLinkPath(item.id)} target="_blank">
                        <p>{item.name}</p>
                        {item.engName && <p className="text-xs">{item.engName}</p>}
                      </Link>
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

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>

                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                    </PaginationItem>
                  )}
                  {renderPaginationItems()}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
        {!data.length && <p className="mt-4">目前沒有符合的資料唷，請使用其他關鍵字查詢</p>}
        {/* 顯示成分（做成 dialog？怕 table 太長） */}
        {/* 顯示 tag，包括此產品的類別、特殊疾病配方？ */}
      </div>
    </CardContent>
  )
}