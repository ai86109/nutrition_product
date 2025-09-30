import { useProductContext } from "@/contexts/ProductContext";
import { ProductData } from "@/types/nutrition"

export function useProductCalculationEvents(
  listData: ProductData[],
  setUserInputs: React.Dispatch<React.SetStateAction<{ [key: string]: { quantity: number | string; selectedId: string; checked: boolean } }>>
) {
  const { setProductList } = useProductContext()
  
  const handleCheck = (id: string, checked: boolean): void => {
    setUserInputs((prevInputs) => {
      return {
        ...prevInputs,
        [id]: {
          ...prevInputs[id],
          checked,
        }
      }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const productNew = listData.find((item) => item.id === id)
    if (productNew) {
      setUserInputs((prevInputs) => {
        return {
          ...prevInputs,
          [id]: {
            ...prevInputs[id],
            quantity: value,
          }
        }
      })
    }
  }

  const handleValueChange = (value: string, productId: string): void => {
    const productNew = listData.find((item) => item.id === productId)
    if (!productNew) return;

    const selectedQuantity = productNew.select.selectOptions
      .flatMap(type => type.products)
      .find(p => p.id === value)?.defaultAmount || productNew.quantity

    setUserInputs((prevInputs) => {
      return {
        ...prevInputs,
        [productId]: {
          ...prevInputs[productId],
          selectedId: value,
          quantity: selectedQuantity,
        }
      }
    })
  }

  const handleRemoveProduct = (productId: string): void => {
    setProductList((prevData: string[]) => prevData.filter((item) => item !== productId))

    setUserInputs((prevInputs) => {
      const updatedInputs = { ...prevInputs }
      delete updatedInputs[productId]
      return updatedInputs
    })
  }

  return {
    handleCheck,
    handleInputChange,
    handleValueChange,
    handleRemoveProduct,
  }
}