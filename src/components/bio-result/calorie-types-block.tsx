import { useBioInfo } from "@/contexts/BioInfoContext"
import { cn } from "@/lib/utils"

export default function CalorieTypesBlock() {
  const { calorieTypeLists, setCalorieTypeLists } = useBioInfo()

  const handleCalorieTypeCheck = (id: string, current: boolean): void => {
    setCalorieTypeLists((prevList) => {
      const newList = prevList.map(item => item.id === id ? { ...item, checked: !current } : item)
      return newList
    })
  }

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {calorieTypeLists.map((type) => (
        <button
          key={type.id}
          type="button"
          role="switch"
          aria-checked={type.checked}
          onClick={() => handleCalorieTypeCheck(type.id, type.checked)}
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition-all",
            type.checked
              ? "bg-primary text-primary-foreground ring-primary shadow-sm"
              : "bg-muted/40 text-muted-foreground ring-border hover:bg-muted/70 hover:text-foreground"
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  )
}
