import { TDEEList } from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import { DEFAULT_TDEE_SETTINGS } from "@/utils/constants";

const STORAGE_KEY = "nutriapp.bio.tdee"

export function useTdeeSettings() {
  const [tdeeList, setTDEEList] = useLocalStorage<TDEEList[]>(STORAGE_KEY, DEFAULT_TDEE_SETTINGS);

  const addList = (newItem: TDEEList) => {
    setTDEEList([...tdeeList, newItem]);
  }

  const deleteList = (index: number) => {
    setTDEEList(tdeeList.toSpliced(index, 1));
  }

  return { tdeeList, addList, deleteList };
}
