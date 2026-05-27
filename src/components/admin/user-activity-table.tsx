'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePagination } from '@/hooks/usePagination'
import type { UserActivityItem } from '@/lib/supabase/queries/admin-activity'

type SortKey =
  | 'active_days'
  | 'total_hit_count'
  | 'estimated_minutes'
  | 'last_active_date'

interface SortState {
  key: SortKey
  direction: 'asc' | 'desc'
}

interface UserActivityTableProps {
  users: UserActivityItem[]
  days: number
}

function formatDate(raw: string | null) {
  if (!raw) return '-'
  // raw 是 'YYYY-MM-DD'
  const [y, m, d] = raw.split('-')
  return `${y}/${m}/${d}`
}

function formatMinutes(min: number) {
  if (min < 60) return `${min} 分鐘`
  const h = Math.floor(min / 60)
  const m = min % 60
  if (m === 0) return `${h} 小時`
  return `${h} 小時 ${m} 分`
}

export default function UserActivityTable({ users, days }: UserActivityTableProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortState>({
    key: 'total_hit_count',
    direction: 'desc',
  })
  const { currentPage, setCurrentPage, itemsPerPage } = usePagination({
    mobile: 25,
    desktop: 25,
  })

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return users
    return users.filter(
      (u) =>
        (u.name?.toLowerCase() || '').includes(query) ||
        (u.email?.toLowerCase() || '').includes(query)
    )
  }, [users, search])

  const sorted = useMemo(() => {
    const out = [...filtered]
    out.sort((a, b) => {
      let av: number | string = 0
      let bv: number | string = 0
      switch (sort.key) {
        case 'active_days':
          av = a.active_days
          bv = b.active_days
          break
        case 'total_hit_count':
          av = a.total_hit_count
          bv = b.total_hit_count
          break
        case 'estimated_minutes':
          av = a.estimated_minutes
          bv = b.estimated_minutes
          break
        case 'last_active_date':
          av = a.last_active_date ?? ''
          bv = b.last_active_date ?? ''
          break
      }
      if (av < bv) return sort.direction === 'asc' ? -1 : 1
      if (av > bv) return sort.direction === 'asc' ? 1 : -1
      return 0
    })
    return out
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = sorted.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  )

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'desc' }
      return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' }
    })
    setCurrentPage(1)
  }

  const renderSortIcon = (key: SortKey) => {
    if (sort.key !== key) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-50" />
    return sort.direction === 'desc' ? (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="搜尋名稱或 Email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          className="max-w-sm"
        />
        <Badge variant="outline">{filtered.length} 位使用者</Badge>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>名稱</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-7 px-2"
                  onClick={() => toggleSort('active_days')}
                >
                  活躍天數{renderSortIcon('active_days')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-7 px-2"
                  onClick={() => toggleSort('total_hit_count')}
                >
                  總 hit_count{renderSortIcon('total_hit_count')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-7 px-2"
                  onClick={() => toggleSort('estimated_minutes')}
                >
                  估計使用時間{renderSortIcon('estimated_minutes')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-7 px-2"
                  onClick={() => toggleSort('last_active_date')}
                >
                  最後活躍{renderSortIcon('last_active_date')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {users.length === 0
                    ? `過去 ${days} 天沒有任何使用者活動紀錄`
                    : '沒有找到符合的使用者'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || ''} alt={user.name || ''} />
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.name || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email || '-'}</TableCell>
                  <TableCell>{user.active_days} 天</TableCell>
                  <TableCell>{user.total_hit_count}</TableCell>
                  <TableCell
                    className={cn(
                      user.estimated_minutes >= 60 && 'font-medium'
                    )}
                  >
                    {formatMinutes(user.estimated_minutes)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.last_active_date)}
                  </TableCell>
                </TableRow>
              ))
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
                className={safePage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                className={safePage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
