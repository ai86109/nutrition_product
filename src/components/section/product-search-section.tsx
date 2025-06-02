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
// import productsData from '@/data/products.json';
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
import { brandOptions, typeOptions, categoryOptions, operatorOptions } from "@/utils/mappings"
import { Badge } from "@/components/ui/badge"

export default function ProductSearchSection() {
  const { productList, setProductList, allProducts } = useProduct()
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [searchValue, setSearchValue] = useState<string>("")
  const [selectedCate, setSelectedCate] = useState(["", "", ""])
  const [data, setData] = useState([])
  const [windowWidth, setWindowWidth] = useState(0);

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = windowWidth <= 1024 ? 5 : 10
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const truncateLength = 5

  useEffect(() => {
    if (allProducts.length > 0) {
      setData(allProducts)
      console.log("allProducts", allProducts)
    }
  }, [allProducts])

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

  const handleInputChange = (e) => {
    const { value } = e.target
    setSearchValue(value)
  }

  const handleSelectBrandChange = (value) => {
    setSelectedBrand(value)
  }

  const handleSelectTypeChange = (value) => {
    setSelectedType(value)
  }

  const handleReset = () => {
    setSelectedBrand("")
    setSelectedType("")
    setSearchValue("")
    setSelectedCate(["", "", ""])
  }

  const handleSearchSubmit = () => {
    const filteredData = allProducts.filter((item) => {
      const textInput = searchValue.toLowerCase();
      const nameMatches = item.name.toLowerCase().includes(textInput) || 
                        (item.engName && item.engName.toLowerCase().includes(textInput));
      
      const brandMatches = !selectedBrand || item.brand === selectedBrand;
      const typeMatches = !selectedType || item.type === selectedType;
      
      const hasCategory = !!(selectedCate[0] || selectedCate[2])
      // if selectedCate[0] and selectedCate[2] are both selected, isOrOperator 才會是『或』以外的值
      const isOrOperator = (selectedCate[1] || "或") === "或"
      const categoryMatches = !hasCategory ||
        (isOrOperator ?
          (item.categories && (item.categories.includes(selectedCate[0]) || item.categories.includes(selectedCate[2]))) :
          (item.categories && item.categories.includes(selectedCate[0]) && item.categories.includes(selectedCate[2])))

      return brandMatches && typeMatches && categoryMatches &&
            (!searchValue || nameMatches);
    })

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

  const handleSelectCateChange = (value, index) => {
    setSelectedCate((prevCate) => {
      if (index < 0 || index >= prevCate.length) return prevCate;

      const newCate = [...prevCate]
      newCate[index] = value
      return newCate
    })
  }

  return (
    <CardContent>
      <div className="flex items-center justify-between space-x-2 space-y-2 gap-2 flex-wrap lg:gap-0">
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

        <div className="flex space-x-2">
          <Select value={selectedCate[0]} onValueChange={(value) => handleSelectCateChange(value, 0)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="選擇類別" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCate[1]} onValueChange={(value) => handleSelectCateChange(value, 1)}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="或" />
            </SelectTrigger>
            <SelectContent>
              {operatorOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCate[2]} onValueChange={(value) => handleSelectCateChange(value, 2)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="選擇類別" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={handleSearchSubmit}>送出</Button>
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
                        {item.categories && item.categories.length > 0 && item.categories.map((category) => (
                          <Badge key={category} className="mt-1 mr-1" variant="secondary">
                            {category}
                          </Badge>
                        ))}
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