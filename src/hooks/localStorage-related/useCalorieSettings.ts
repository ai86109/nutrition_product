// import { useLocalStorage } from "@/hooks/localStorage-related/useLocalStorage";
import { CalorieFactorList } from "@/types";
import { useState } from "react";
// import { DEFAULT_CALORIE_SETTINGS } from "@/utils/constants";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

// const STORAGE_KEY = "nutriapp.bio.calorie";

export function useCalorieSettings() {
  // const [calorieFactorLists, setCalorieFactorLists] = useLocalStorage<CalorieFactorList[]>(STORAGE_KEY, DEFAULT_CALORIE_SETTINGS);
  const { calorieFactors } = useUserPreferences()
  const [calorieFactorLists, setCalorieFactorLists] = useState(calorieFactors);

  const updateChecked = (checked: boolean, index: number): void => {
    setCalorieFactorLists((prevList) => {
      const newList = [...prevList];
      newList[index] = { ...newList[index], checked };

      return newList;
    });
  };

  const updateValue = (id: string, value: string): void => {
    const index = parseInt(id.split('-')[1], 10);
    setCalorieFactorLists((prevList) => {
      const newList = [...prevList];
      newList[index] = { ...newList[index], value: Number(value) };

      return newList;
    });
  };

  return { calorieFactorLists, setCalorieFactorLists, updateChecked, updateValue };
}
