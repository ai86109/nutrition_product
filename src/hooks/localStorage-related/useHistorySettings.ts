import { toast } from "sonner";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserSetting } from '@/hooks/useUserSetting'

export function useHistorySettings() {
  const { isLoggedIn } = useAuth()
  const { updateSetting } = useUserSetting()
  const { history } = useUserPreferences()

  const addList = (newItem: string) => {
    if (history.includes(newItem)) return

    const newHistoryList = [...history, newItem].slice(-5);
    updateSetting('history', newHistoryList);
  }

  const deleteList = (id: string) => {
    const newHistoryList = history.filter(item => item !== id);
    updateSetting('history', newHistoryList);
  }

  // 清掉「查不到對應產品」的失效紀錄（產品已下架 / 自訂已刪除 / 無營養資料被排除）
  // isValid 由呼叫端提供（通常是 allProducts 建出的 productMap.has）
  const pruneOrphanHistory = async (isValid: (id: string) => boolean) => {
    if (!isLoggedIn) return
    const cleaned = history.filter(isValid)
    if (cleaned.length === history.length) return
    const removed = history.length - cleaned.length
    await updateSetting('history', cleaned)
    toast.warning(`已移除 ${removed} 筆失效的最近使用紀錄（產品已不存在）`)
  }

  return { addList, deleteList, pruneOrphanHistory }
}
