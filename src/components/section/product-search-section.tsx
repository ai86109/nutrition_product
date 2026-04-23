"use client"

import { Star } from "lucide-react"
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import SearchForm from "../product-search/search-form"
import ProductTable from "../product-search/product-table"
import PaginationBlock from "../product-search/pagination-block";
import HistoryBlock from "../product-search/history-block";
import FavoriteBlock from "../product-search/favorite-block";
import { usePagination } from "@/hooks/usePagination";
import { useSearch } from "@/contexts/SearchContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

// Avoid SSR warning: useLayoutEffect on the client only
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

const TAB_TRIGGER_CLASS =
  "relative flex-none shrink-0 whitespace-nowrap cursor-pointer rounded-none border-0 bg-transparent px-3 py-2 text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"

export default function ProductSearchSection() {
  const { filteredData } = useSearch()
  const { history, favorites } = useUserPreferences()
  const { currentPage, setCurrentPage, itemsPerPage } = usePagination()

  const [activeTab, setActiveTab] = useState<string>("search")
  const listRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const [isReady, setIsReady] = useState(false)

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [currentPage, itemsPerPage, filteredData])

  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
  }

  // Measure the active trigger's position and size
  useIsoLayoutEffect(() => {
    const listEl = listRef.current
    if (!listEl) return

    const updateIndicator = () => {
      const activeTrigger = listEl.querySelector<HTMLElement>('[data-state="active"]')
      if (!activeTrigger) return
      setIndicator({
        left: activeTrigger.offsetLeft,
        width: activeTrigger.offsetWidth,
      })
      setIsReady(true)

      // Scroll active trigger into view horizontally when the list overflows
      const listRect = listEl.getBoundingClientRect()
      const triggerRect = activeTrigger.getBoundingClientRect()
      const padding = 8
      if (triggerRect.left < listRect.left) {
        listEl.scrollBy({ left: triggerRect.left - listRect.left - padding, behavior: "smooth" })
      } else if (triggerRect.right > listRect.right) {
        listEl.scrollBy({ left: triggerRect.right - listRect.right + padding, behavior: "smooth" })
      }
    }

    updateIndicator()

    const resizeObserver = new ResizeObserver(updateIndicator)
    resizeObserver.observe(listEl)

    return () => {
      resizeObserver.disconnect()
    }
  }, [activeTab, filteredData.length, favorites.length, history.length])

  return (
    <CardContent>
      <SearchForm
        handlePageChange={handlePageChange}
        onSearchSubmit={() => setActiveTab("search")}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList
          ref={listRef}
          className="relative h-auto w-full justify-start gap-1 bg-transparent p-0 border-b border-border rounded-none overflow-x-auto overflow-y-hidden scroll-smooth"
        >
          <TabsTrigger value="search" className={TAB_TRIGGER_CLASS}>
            搜尋結果
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px] font-semibold">
              {filteredData.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="favorites" className={TAB_TRIGGER_CLASS}>
            <Star className="h-3.5 w-3.5" />
            我的收藏
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px] font-semibold">
              {favorites.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className={TAB_TRIGGER_CLASS}>
            最近使用
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px] font-semibold">
              {history.length}
            </Badge>
          </TabsTrigger>

          {/* Sliding underline indicator */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-px h-[2px] bg-primary transition-all duration-300 ease-out"
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
              opacity: isReady ? 1 : 0,
            }}
          />
        </TabsList>

        <TabsContent value="search" className="mt-3">
          {currentPageData.length > 0 ? (
            <>
              <ProductTable currentPageData={currentPageData} />
              <PaginationBlock
                currentPage={currentPage}
                handlePageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              目前沒有符合的資料唷，請使用其他關鍵字查詢
            </p>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-3">
          <FavoriteBlock />
        </TabsContent>

        <TabsContent value="history" className="mt-3">
          <HistoryBlock />
        </TabsContent>
      </Tabs>
    </CardContent>
  )
}
