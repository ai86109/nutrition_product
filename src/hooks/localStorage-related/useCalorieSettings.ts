import { useLocalStorage } from "@/hooks/localStorage-related/useLocalStorage";
import { CalorieFactorList } from "@/types";

const STORAGE_KEY = "nutriapp.bio.calorie";

export const DEFAULT_CALORIE_SETTINGS: CalorieFactorList[] = [
  { id: 1, value: 25, checked: true },
  { id: 2, value: 30, checked: true },
  { id: 3, value: 35, checked: true },
]

export function useCalorieSettings() {
  const [calorieFactorLists, setCalorieFactorLists] = useLocalStorage<CalorieFactorList[]>(STORAGE_KEY, DEFAULT_CALORIE_SETTINGS);

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

  return { calorieFactorLists, updateChecked, updateValue };
}
