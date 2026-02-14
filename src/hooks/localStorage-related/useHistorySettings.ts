import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useUserSetting } from '@/hooks/useUserSetting'

export function useHistorySettings() {
  const { updateSetting } = useUserSetting()
  const { history } = useUserPreferences()

  const addList = (newItem: string) => {
    if (history.includes(newItem)) return

    const newHistoryList = [...history, newItem];
    updateSetting('history', newHistoryList);
  }

  const deleteList = (id: string) => {
    const newHistoryList = history.filter(item => item !== id);
    updateSetting('history', newHistoryList);
  }

  return { addList, deleteList }
}
