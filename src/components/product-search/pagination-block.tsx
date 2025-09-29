import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ApiProductData } from "@/types/api";
import { useMemo } from "react";

const truncateLength = 5

function calculatePaginationPages(totalPages: number, currentPage: number): (number | string)[] {
  if (totalPages <= truncateLength) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  } else if (currentPage <= 2) {
    return [1, 2, 3, "...", totalPages]
  } else if (currentPage >= totalPages - 1) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages]
  } else if (currentPage === 3) {
    return [2, 3, 4, "...", totalPages]
  } else if (currentPage === totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1]
  } else {
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
  }
}

export default function PaginationBlock({ 
  filteredData,
  currentPage,
  handlePageChange,
  itemsPerPage
}: {
  filteredData: ApiProductData[],
  currentPage: number,
  handlePageChange: (page: number) => void,
  itemsPerPage: number
}) {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginationPages = useMemo(() => {
    return calculatePaginationPages(totalPages, currentPage)
  }, [totalPages, currentPage])

  const renderPaginationItems = useMemo(() => {
    return paginationPages.map((page, index) => {
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
  }, [paginationPages, currentPage, handlePageChange])

  if (totalPages === 0) return null

  return (
    <Pagination className="overflow-x-auto mt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => handlePageChange(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {renderPaginationItems}
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
  )
}