"use client"

import { CardContent } from "@/components/ui/card"
import { useMemo } from "react";
import { useProductSearch } from "@/hooks/useProductSearch"
import SearchForm from "../product-search/search-form"
import ProductTable from "../product-search/product-table"
import PaginationBlock from "../product-search/pagination-block";
import { usePagination } from "@/hooks/usePagination";

export default function ProductSearchSection() {
  const { formState, filteredData, updateField, applySearch, reset } = useProductSearch()
  const { currentPage, setCurrentPage, itemsPerPage } = usePagination()

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [currentPage, itemsPerPage, filteredData])

  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
  }

  return (
    <CardContent>
      <SearchForm
        formState={formState}
        onUpdateField={updateField}
        onSearch={applySearch}
        onReset={reset}
        handlePageChange={handlePageChange}
      />

      <div className="mt-4">
        {currentPageData.length > 0 && (
          <div>
            <ProductTable currentPageData={currentPageData} />

            <PaginationBlock
              filteredData={filteredData}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
        {!filteredData.length && <p className="mt-4">目前沒有符合的資料唷，請使用其他關鍵字查詢</p>}
      </div>
    </CardContent>
  )
}
