"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import WishPoolDialog from "@/components/dialogs/wish-pool-dialog"

/**
 * 許願池按鈕。
 * - 未登入：點擊後在按鈕下方彈出 Popover 提示「登入後即可許願」+ 前往登入連結
 * - 已登入：點擊開啟 WishPoolDialog
 */
export default function WishPoolButton() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!isLoggedIn) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <Sparkles className="size-4" />
            許願池
          </Button>
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
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => setDialogOpen(true)}
      >
        <Sparkles className="size-4" />
        許願池
      </Button>
      <WishPoolDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
