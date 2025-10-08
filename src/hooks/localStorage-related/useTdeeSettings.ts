import { TDEEList } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

const STORAGE_KEY = "nutriapp.bio.tdee"

export const DEFAULT_TDEE_SETTINGS: TDEEList[] = [
  {
    name: '預設',
    activityFactor: 1.2,
    stressFactor: 1.2,
  }
]

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
