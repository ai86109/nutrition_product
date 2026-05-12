import { TDEEList } from "@/types";
// import { useLocalStorage } from "./useLocalStorage";
// import { DEFAULT_TDEE_SETTINGS } from "@/utils/constants";
import { useState } from "react";
import { toast } from "sonner";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { MAX_TDEE_ENTRIES } from "@/utils/constants";

// const STORAGE_KEY = "nutriapp.bio.tdee"

export function useTdeeSettings() {
  // const [tdeeList, setTDEEList] = useLocalStorage<TDEEList[]>(STORAGE_KEY, DEFAULT_TDEE_SETTINGS);
  const { tdeeFactors } = useUserPreferences()
  const [tdeeList, setTDEEList] = useState(tdeeFactors);

  /** 回傳 true=成功；false=被 cap 擋下（已 toast，caller 不需重複提示） */
  const addList = (newItem: TDEEList): boolean => {
    if (tdeeList.length >= MAX_TDEE_ENTRIES) {
      toast.error(
        `TDEE 參數已達上限 ${MAX_TDEE_ENTRIES} 筆，請先刪除其他項目`
      )
      return false
    }
    setTDEEList([...tdeeList, newItem]);
    return true
  }

  const deleteList = (index: number) => {
    setTDEEList(tdeeList.toSpliced(index, 1));
  }

  return { tdeeList, setTDEEList, addList, deleteList };
}
