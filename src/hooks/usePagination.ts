import { useState } from "react";
import { useScreenWidth } from "./useScreenWidth";

export function usePagination() {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const screenWidth = useScreenWidth()
  const itemsPerPage = screenWidth <= 1024 ? 5 : 10

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage
  }
}