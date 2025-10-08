import { ProteinList } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

const STORAGE_KEY = "nutriapp.bio.protein"

export const DEFAULT_PROTEIN_SETTINGS: ProteinList[] = [
  { id: 1, value: 0.6, checked: true },
  { id: 2, value: 0.8, checked: true },
  { id: 3, value: 1.0, checked: true },
  { id: 4, value: 1.2, checked: true },
  { id: 5, value: 1.5, checked: true },
  { id: 6, value: 2.0, checked: true },
]

export function useProteinSettings() {
  const [proteinList, setProteinList] = useLocalStorage(STORAGE_KEY, DEFAULT_PROTEIN_SETTINGS);

  const updateChecked = (checked: boolean, index: number): void => {
    setProteinList((prevList) => {
      const newList = [...prevList];
      newList[index] = { ...newList[index], checked };
      return newList;
    });
  };

  const updateValue = (id: string, value: string): void => {
    const index = parseInt(id.split('-')[1], 10);
    setProteinList((prevList) => {
      const newList = [...prevList];
      newList[index] = { ...newList[index], value: Number(value) };
      return newList;
    });
  };

  const resetToDefault = (): void => {
    setProteinList(DEFAULT_PROTEIN_SETTINGS);
  }

  return { proteinList, updateChecked, updateValue, resetToDefault };
}
