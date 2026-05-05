'use client'

import { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import CategoryMultiSelect from '@/components/admin/category-multi-select'
import ProductStatusSelect from '@/components/admin/product-status-select'
import AdminProductImagesCell from '@/components/admin/admin-product-images-cell'
import { updateProductIsApproved } from '@/lib/supabase/mutations/admin-products'
import { getLinkPath } from '@/utils/external-links'
import type {
  AdminProductListItem,
  ProductDisplayStatus,
} from '@/lib/supabase/queries/admin-products'

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]
const DEFAULT_PAGE_SIZE: PageSize = 25

interface AdminProductTableProps {
  products: AdminProductListItem[]
}

type ApprovedFilter = 'all' | 'shown' | 'hidden'
type StatusFilter = 'all' | ProductDisplayStatus

const APPROVED_FILTER_OPTIONS: Array<{ value: ApprovedFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'shown', label: '顯示' },
  { value: 'hidden', label: '不顯示' },
]

const STATUS_FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '上架' },
  { value: 'inactive', label: '下架' },
  { value: 'extension_pending', label: '展延中' },
  { value: 'pending_review', label: '待處理' },
]

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return false
  return d < new Date()
}

function getDisplayStatus(p: AdminProductListItem): ProductDisplayStatus {
  // 待處理 = product_status 為 active 且 nutrition_facts 為空
  if (p.product_status === 'active' && !p.has_nutrition_facts) {
    return 'pending_review'
  }
  return (p.product_status ?? 'inactive') as ProductDisplayStatus
}

/** 行內小元件：is_approved Switch 含 optimistic update */
function ApprovedSwitch({
  licenseNo,
  initial,
}: {
  licenseNo: string
  initial: boolean
}) {
  const [checked, setChecked] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function handleChange(next: boolean) {
    const previous = checked
    setChecked(next)
    setLoading(true)
    try {
      await updateProductIsApproved(licenseNo, next)
    } catch (error) {
      console.error('Failed to update is_approved:', error)
      setChecked(previous)
      alert('更新「配方種類是否顯示」失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return <Switch checked={checked} disabled={loading} onCheckedChange={handleChange} />
}

export default function AdminProductTable({ products }: AdminProductTableProps) {
  const [search, setSearch] = useState('')
  const [approvedFilter, setApprovedFilter] = useState<ApprovedFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PageSize>(DEFAULT_PAGE_SIZE)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((p) => {
      // 關鍵字（證號 / 中英品名 / 廠商）
      if (query) {
        const haystack = [p.license_no, p.name_zh, p.name_en, p.brand]
          .filter((v): v is string => !!v)
          .map((v) => v.toLowerCase())
        if (!haystack.some((s) => s.includes(query))) return false
      }

      // is_approved
      if (approvedFilter === 'shown' && p.is_approved !== true) return false
      if (approvedFilter === 'hidden' && p.is_approved === true) return false

      // displayStatus
      if (statusFilter !== 'all' && getDisplayStatus(p) !== statusFilter) return false

      return true
    })
  }, [products, search, approvedFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  )

  function resetPageOnFilter<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      setCurrentPage(1)
    }
  }

  const hasActiveFilters =
    search.trim() !== '' || approvedFilter !== 'all' || statusFilter !== 'all'

  function handleResetFilters() {
    setSearch('')
    setApprovedFilter('all')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="搜尋證號、品名或廠商..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">是否顯示</span>
          <Select
            value={approvedFilter}
            onValueChange={resetPageOnFilter<ApprovedFilter>((v) =>
              setApprovedFilter(v as ApprovedFilter)
            )}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPROVED_FILTER_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">產品狀態</span>
          <Select
            value={statusFilter}
            onValueChange={resetPageOnFilter<StatusFilter>((v) =>
              setStatusFilter(v as StatusFilter)
            )}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetFilters}
          disabled={!hasActiveFilters}
          className="text-muted-foreground"
        >
          重置篩選
        </Button>

        <div className="ml-auto flex items-center gap-3">
          <Badge variant="outline">{filtered.length} 筆產品</Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">每頁</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(v) => {
                setItemsPerPage(Number(v) as PageSize)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>證號</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>廠商</TableHead>
              <TableHead className="text-center">圖片</TableHead>
              <TableHead>配方種類</TableHead>
              <TableHead className="text-center">是否顯示</TableHead>
              <TableHead>有效日期</TableHead>
              <TableHead>產品狀態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  沒有符合條件的產品
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((p) => {
                const isPending = getDisplayStatus(p) === 'pending_review'
                return (
                  <TableRow key={p.license_no}>
                    <TableCell className="font-mono text-xs">{p.license_no}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>{p.name_zh ?? '-'}</span>
                        <a
                          href={getLinkPath(p.license_no)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="開啟衛福部頁面"
                          aria-label={`${p.name_zh ?? p.license_no} 的衛福部頁面`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      {p.name_en && (
                        <div className="text-xs text-muted-foreground">{p.name_en}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.brand ?? '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <AdminProductImagesCell
                        licenseNo={p.license_no}
                        productName={p.name_zh ?? p.license_no}
                        imageCount={p.image_count}
                      />
                    </TableCell>
                    <TableCell>
                      <CategoryMultiSelect
                        licenseNo={p.license_no}
                        currentCategories={p.categories ?? []}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <ApprovedSwitch
                        licenseNo={p.license_no}
                        initial={p.is_approved === true}
                      />
                    </TableCell>
                    <TableCell
                      className={
                        isExpired(p.license_expiry_date)
                          ? 'text-red-600 font-medium'
                          : 'text-muted-foreground'
                      }
                    >
                      {formatDate(p.license_expiry_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <Badge
                            variant="outline"
                            className="border-red-300 bg-red-50 text-red-700"
                            title="此產品為 active 但 nutrition_facts 為空，需處理"
                          >
                            待處理
                          </Badge>
                        ) : (
                          <ProductStatusSelect
                            licenseNo={p.license_no}
                            currentStatus={p.product_status}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                className={
                  safePage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={page === safePage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                className={
                  safePage >= totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

    </div>
  )
}
