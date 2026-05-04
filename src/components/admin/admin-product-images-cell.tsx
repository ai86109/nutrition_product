'use client'

import { useState } from 'react'
import { Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminProductImagesSheet from '@/components/admin/admin-product-images-sheet'

interface AdminProductImagesCellProps {
  licenseNo: string
  productName: string
}

/**
 * 產品 admin table 內的「圖片」欄按鈕。
 * 點擊後開啟 AdminProductImagesSheet（lazy：sheet 開啟時才 fetch 圖片清單）。
 */
export default function AdminProductImagesCell({
  licenseNo,
  productName,
}: AdminProductImagesCellProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 px-2 text-muted-foreground hover:text-foreground"
        aria-label={`管理 ${productName} 的圖片`}
      >
        <Images className="h-4 w-4" />
        <span className="ml-1 text-xs">管理</span>
      </Button>

      <AdminProductImagesSheet
        licenseNo={licenseNo}
        productName={productName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
