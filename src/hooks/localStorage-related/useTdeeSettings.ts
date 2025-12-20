import { TDEEList } from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import { DEFAULT_TDEE_SETTINGS } from "@/utils/constants";
import { useState } from "react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

// const STORAGE_KEY = "nutriapp.bio.tdee"

export function useTdeeSettings() {
  // const [tdeeList, setTDEEList] = useLocalStorage<TDEEList[]>(STORAGE_KEY, DEFAULT_TDEE_SETTINGS);
  const { tdeeFactors } = useUserPreferences()
  const [tdeeList, setTDEEList] = useState(tdeeFactors);

  const addList = (newItem: TDEEList) => {
    setTDEEList([...tdeeList, newItem]);
  }

  const deleteList = (index: number) => {
    setTDEEList(tdeeList.toSpliced(index, 1));
  }

  return { tdeeList, setTDEEList, addList, deleteList };
}
