import { useBioInfo } from "@/contexts/BioInfoContext"
import { Checkbox } from "@/components/ui/checkbox"

export default function CalorieTypesBlock() {
  const { calorieTypeLists, setCalorieTypeLists } = useBioInfo()

  const handleCalorieTypeCheck = (checked: boolean, id: string): void => {
    setCalorieTypeLists((prevList) => {
      const newList = prevList.map(item => item.id === id ? { ...item, checked } : item)
      return newList
    })
  }

  return (
    <div className="flex gap-2 mb-2">
      {calorieTypeLists.map((type) => (
        <div key={type.id}>
          <Checkbox checked={type.checked} onCheckedChange={(checked) => handleCalorieTypeCheck(!!checked, type.id)} className="mr-1" />
          {type.label}
        </div>
      ))}
    </div>
  )
}