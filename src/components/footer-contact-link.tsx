"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import WishPoolDialog from "@/components/dialogs/wish-pool-dialog"

/**
 * Footer 用的「聯絡我們」連結。
 * - 點擊行為與 WishPoolButton 一致：登入後開啟許願池 Dialog，未登入則 Popover 提示登入。
 * - 視覺上是純文字連結，不是按鈕，方便排進 footer 連結列。
 */
export default function FooterContactLink() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const linkClassName =
    "cursor-pointer hover:text-gray-900 hover:underline underline-offset-2 bg-transparent border-0 p-0 text-inherit"

  if (!isLoggedIn) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={linkClassName}>
            聯絡我們
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto text-sm" align="end">
          <div className="flex flex-col gap-2">
            <p>登入後即可許願</p>
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setPopoverOpen(false)
                router.push("/auth")
              }}
            >
              前往登入
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <>
      <button
        type="button"
        className={linkClassName}
        onClick={() => setDialogOpen(true)}
      >
        聯絡我們
      </button>
      <WishPoolDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
