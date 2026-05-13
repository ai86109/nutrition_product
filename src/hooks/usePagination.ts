import { useState } from "react";
import { useScreenWidth } from "./useScreenWidth";

interface UsePaginationOptions {
  mobile?: number
  desktop?: number
}

export function usePagination(options?: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const { screenWidth } = useScreenWidth()
  const mobile = options?.mobile ?? 5
  const desktop = options?.desktop ?? 10
  const itemsPerPage = screenWidth <= 1024 ? mobile : desktop

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage
  }
}