'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Users, Package, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRODUCTS_HREF = '/admin/products'

const navItems = [
  {
    label: '會員管理',
    href: '/admin',
    icon: Users,
  },
  {
    label: '營養品管理',
    href: PRODUCTS_HREF,
    icon: Package,
  },
]

interface AdminSidebarProps {
  /** 待處理產品數，用來在「營養品管理」那列顯示紅點 badge */
  pendingProductCount?: number
}

function formatBadgeCount(n: number): string {
  return n > 99 ? '99+' : String(n)
}

export default function AdminSidebar({ pendingProductCount = 0 }: AdminSidebarProps) {
  const [expanded, setExpanded] = useState(true)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-white border-r transition-all duration-200 ease-in-out shrink-0',
        expanded ? 'w-60' : 'w-14'
      )}
    >
      {/* Toggle button */}
      <div className={cn('flex items-center border-b py-3', expanded ? 'justify-end px-2' : 'justify-center px-0')}>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
          aria-label={expanded ? '收起側邊欄' : '展開側邊欄'}
        >
          {expanded ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          const badgeCount = href === PRODUCTS_HREF ? pendingProductCount : 0
          const showBadge = badgeCount > 0

          return (
            <div key={href} className="relative group">
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-100',
                  !expanded && 'justify-center px-0'
                )}
              >
                {/* icon 包一層 relative，方便收起模式時把 badge 疊在右上角 */}
                <span className="relative shrink-0">
                  <Icon className="w-4 h-4" />
                  {showBadge && !expanded && (
                    <span
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[10px] font-medium leading-none flex items-center justify-center px-1"
                      aria-label={`${badgeCount} 筆待處理`}
                    >
                      {formatBadgeCount(badgeCount)}
                    </span>
                  )}
                </span>
                {expanded && <span>{label}</span>}
                {/* 展開模式：badge 放 row 最右 */}
                {showBadge && expanded && (
                  <span
                    className="ml-auto min-w-[20px] h-[20px] rounded-full bg-red-500 text-white text-[11px] font-medium leading-none flex items-center justify-center px-1.5"
                    aria-label={`${badgeCount} 筆待處理`}
                  >
                    {formatBadgeCount(badgeCount)}
                  </span>
                )}
              </Link>

              {/* Tooltip（收起時才顯示） */}
              {!expanded && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="bg-popover text-popover-foreground text-xs font-medium px-2 py-1 rounded-md shadow-md border whitespace-nowrap">
                    {label}
                    {showBadge && `（${badgeCount} 筆待處理）`}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
