'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Users, Package, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: '會員管理',
    href: '/admin',
    icon: Users,
  },
  {
    label: '營養品管理',
    href: '/admin/products',
    icon: Package,
  },
]

export default function AdminSidebar() {
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
                <Icon className="w-4 h-4 shrink-0" />
                {expanded && <span>{label}</span>}
              </Link>

              {/* Tooltip（收起時才顯示） */}
              {!expanded && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="bg-popover text-popover-foreground text-xs font-medium px-2 py-1 rounded-md shadow-md border whitespace-nowrap">
                    {label}
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
