"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import SaveSnapshotDialog from "./save-snapshot-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot"
import type { ProductData } from "@/types"

interface SaveSnapshotButtonProps {
  listData: ProductData[]
  isCalculateServings: boolean
  mealsPerDay: number | string
}

/**
 * 「儲存病人紀錄」按鈕。未登入時不顯示。
 *
 * 因為 useProductCalculation / useMealCalculation 的 state 是
 * ProductCalculateSection 的 local state（非 context），這裡接收 props 即可。
 */
export default function SaveSnapshotButton({
  listData,
  isCalculateServings,
  mealsPerDay,
}: SaveSnapshotButtonProps) {
  const { isLoggedIn } = useAuth()
  const [open, setOpen] = useState(false)

  const initialValues = useCurrentSnapshot({
    listData,
    isCalculateServings,
    mealsPerDay,
  })

  if (!isLoggedIn) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>儲存病人紀錄</Button>
      <SaveSnapshotDialog
        open={open}
        onOpenChange={setOpen}
        initialValues={initialValues}
      />
    </>
  )
}
