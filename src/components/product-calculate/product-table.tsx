import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { ProductData } from "@/types/nutrition"
import { useProductCalculationEvents } from "@/hooks/useProductCalculationEvents"
import { ProductName } from "./product-name"
import { ProductQuantityInput } from "./product-quantity-input"
import { ProductTypeSelector } from "./product-type-selector"
import { MealServingsCalculation } from "./meal-servings-calculation"

export default function ProductTable({
  listData,
  isServingsCanBeUsed, 
  isShowServings, 
  mealsPerDay, 
  setUserInputs
}: {
  listData: ProductData[],
  isServingsCanBeUsed: boolean,
  isShowServings: boolean,
  mealsPerDay: number | string,
  setUserInputs: React.Dispatch<React.SetStateAction<{ [key: string]: { quantity: number | string; selectedId: string; checked: boolean } }>>
}) {
  const { handleCheck, handleInputChange, handleValueChange, handleRemoveProduct } = useProductCalculationEvents(listData, setUserInputs)
  return (
    <Table>
      <TableBody>
        {listData.map((item) => (
          <>
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox 
                  id={`check-${item.id}`}
                  checked={item.checked}
                  onCheckedChange={(checked) => handleCheck(item.id, !!checked)}
                />
              </TableCell>
              <TableCell className="text-wrap lg:text-nowrap">
                <ProductName
                  id={item.id} 
                  name={item.name} 
                  engName={item.engName} 
                  categories={item.categories}
                />
              </TableCell>
              <TableCell>
                <ProductQuantityInput item={item} onChange={handleInputChange} />
              </TableCell>
              <TableCell>
                <ProductTypeSelector 
                  selectData={item.select} 
                  handleValueChange={handleValueChange} 
                  productId={item.id} 
                />
              </TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => handleRemoveProduct(item.id)}>移除</Button>
              </TableCell>
            </TableRow>

            {isServingsCanBeUsed && isShowServings && item.checked && (
              <TableRow key={`${item.id}-meals`}>
                <TableCell></TableCell>
                <TableCell>
                  <MealServingsCalculation
                    mealsPerDay={mealsPerDay}
                    item={item}
                  />
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  )
}