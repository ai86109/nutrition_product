// import { useLocalStorage } from "./useLocalStorage";
import { DEFAULT_PROTEIN_SETTINGS } from "@/utils/constants";
import { useState } from "react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

// const STORAGE_KEY = "nutriapp.bio.protein"

export function useProteinSettings() {
  // const [proteinList, setProteinList] = useLocalStorage(STORAGE_KEY, DEFAULT_PROTEIN_SETTINGS);
  const { proteinFactors } = useUserPreferences()
  const [proteinList, setProteinList] = useState(proteinFactors);

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

  return { proteinList, setProteinList, updateChecked, updateValue, resetToDefault };
}
