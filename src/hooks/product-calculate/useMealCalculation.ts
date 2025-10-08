import { useState } from "react"

export function useMealCalculation() {
  const [mealsPerDay, setMealsPerDay] = useState<number | string>(3) // default meals per day
  const [isCalculateServings, setIsCalculateServings] = useState<boolean>(false)

  const handleMealsInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if (value === '') return setMealsPerDay(value)
    if (isNaN(Number(value))) return setMealsPerDay(0)

    const parsedValue = parseInt(value, 10)
    if (parsedValue <= 0) setMealsPerDay(0)
    else setMealsPerDay(parsedValue)
  }

  return { 
    mealsPerDay,
    isCalculateServings,
    setIsCalculateServings,
    handleMealsInputChange
  }
}