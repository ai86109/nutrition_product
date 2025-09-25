import { type CalorieType } from "@/contexts/BioInfoContext"
import { Checkbox } from "@/components/ui/checkbox"

export default function CalorieTypesBlock({ calorieTypeLists, onChange }: { 
  calorieTypeLists: CalorieType[],
  onChange: (checked: boolean, id: string) => void
}) {
  return (
    <div className="flex gap-2 mb-2">
      {calorieTypeLists.map((type) => (
        <div key={type.id}>
          <Checkbox checked={type.checked} onCheckedChange={(checked) => onChange(!!checked, type.id)} className="mr-1" />
          {type.label}
        </div>
      ))}
    </div>
  )
}