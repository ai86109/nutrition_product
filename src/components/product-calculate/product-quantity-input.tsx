import { Input } from "@/components/ui/input"
import { ProductData, SelectData } from "@/types/nutrition"

export function ProductQuantityInput(
  { item, onChange }: 
  { item: ProductData, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }
) {
  const getProductUnit = ({ selectedId, selectOptions }: SelectData) => {
    const result = selectOptions.map((type) => {
      const { unit, products } = type
      if (products.find((product) => selectedId === product.id)) return unit
      return null
    }).filter((item) => item !== null)
  
    return result[0]
  }

  return (
    <div className="flex items-center space-x-2">
      <Input id={item.id} className="w-[70px]" type="number" placeholder="數量" value={item.quantity} onChange={onChange} />
      <span>{getProductUnit(item.select)}</span>
    </div>
  )
}
