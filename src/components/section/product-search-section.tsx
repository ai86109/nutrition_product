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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { brandOptions, typeOptions } from "@/utils/mappings"

export default function ProductSearchSection() {
  const { productList, setProductList } = useProduct()
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [searchValue, setSearchValue] = useState<string>("")
  const [data, setData] = useState([])
  const [windowWidth, setWindowWidth] = useState(0);

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = windowWidth <= 1024 ? 5 : 10
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const truncateLength = 5

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setData(productsData)
  }, [])

  const handleInputChange = (e) => {
    const { value } = e.target
    setSearchValue(value)
  }

  const handleSelectBrandChange = (value) => {
    console.log("value", value)
    setSelectedBrand(value)
  }

  const handleSelectTypeChange = (value) => {
    setSelectedType(value)
  }

  const handleReset = () => {
    setSelectedBrand("")
    setSelectedType("")
    setSearchValue("")
  }

  const handleSearchSubmit = () => {
    const filteredData = productsData.filter((item) => {
      const textInput = searchValue.toLowerCase();
      const nameMatches = item.name.toLowerCase().includes(textInput) || 
                        (item.engName && item.engName.toLowerCase().includes(textInput));
      
      const brandMatches = !selectedBrand || item.brand === selectedBrand;
      const typeMatches = !selectedType || item.type === selectedType;
      
      if (selectedBrand && selectedType) return brandMatches && typeMatches && nameMatches;
      
      if (!selectedBrand && !selectedType && searchValue) {
        return nameMatches || 
              item.brand.toLowerCase().includes(textInput) || 
              item.type.toLowerCase().includes(textInput);
      }
      
      // 只有品牌或類型：相應條件必須匹配，且其他欄位可搜尋
      return brandMatches && typeMatches && 
            (!searchValue || nameMatches);
    })
    // console.log("filteredData", filteredData)

    setData(filteredData)
    setCurrentPage(1) // Reset to the first page after search
  }

  const handleAddToCalculate = (productId: string) => {

    const existingProduct = productList.includes(productId)
    if (existingProduct) return

    setProductList((prevData: string[]) => [...prevData, productId])
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
    let pages = []
    if (totalPages <= truncateLength) pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    else if (currentPage <= 2) pages = [1, 2, 3, "...", totalPages]
    else if (currentPage >= totalPages - 1) pages = [1, "...", totalPages - 2, totalPages - 1, totalPages]
    else if (currentPage === 3) pages = [2, 3, 4, "...", totalPages]
    else if (currentPage === totalPages - 2) pages = [1, "...", totalPages - 3, totalPages - 2, totalPages - 1]
    else pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]

    return pages.map((page, index) => {
      if (typeof page !== "number") {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      return (
        <PaginationItem key={page} onClick={() => handlePageChange(page)}>
          <PaginationLink isActive={currentPage === page}>{page}</PaginationLink>
        </PaginationItem>
      )
    })
  }

  return (
    <CardContent>
      <div className="flex items-center justify-between space-x-2 gap-2 flex-wrap lg:flex-nowrap lg:gap-0">
        <Input className="w-[250px]" placeholder="關鍵字搜尋" value={searchValue} onChange={handleInputChange} />

        <Select value={selectedBrand} onValueChange={(value) => handleSelectBrandChange(value)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="選擇品牌" />
          </SelectTrigger>
          <SelectContent>
            {brandOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={(value) => handleSelectTypeChange(value)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="選擇劑型" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleSearchSubmit}>送出</Button>
        {/* 可以使用類別去搜尋產品 */}
      </div>
      <Button variant="outline" onClick={handleReset} className="mt-2">重置</Button>

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
                      <Button variant="outline" onClick={() => handleAddToCalculate(item.id)}>
                        {productList.includes(item.id) ? '已加入' : '加入'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      aria-disabled={currentPage <= 1}
                      tabIndex={currentPage <= 1 ? -1 : undefined}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                  {renderPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      aria-disabled={currentPage >= totalPages}
                      tabIndex={currentPage >= totalPages ? -1 : undefined}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
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