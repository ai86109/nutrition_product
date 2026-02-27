"use client"

import { CardContent } from "@/components/ui/card"
import { useMemo } from "react";
import SearchForm from "../product-search/search-form"
import ProductTable from "../product-search/product-table"
import PaginationBlock from "../product-search/pagination-block";
import { usePagination } from "@/hooks/usePagination";
import { useSearch } from "@/contexts/SearchContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import HistoryBlock from "../product-search/history-block";

export default function ProductSearchSection() {
  const { filteredData } = useSearch()
  const { history } = useUserPreferences()
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
      <SearchForm handlePageChange={handlePageChange} />
      {history && history.length > 0 && <HistoryBlock />}

      <div className="mt-4">
        {currentPageData.length > 0 && (
          <div>
            <ProductTable currentPageData={currentPageData} />

            <PaginationBlock
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
