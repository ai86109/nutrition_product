import { useMemo, useReducer, useState } from "react"
import { ApiProductData } from "@/types"
import { useProduct } from "@/contexts/ProductContext"
import { SearchState, SearchAction } from "@/types"

const initialState: SearchState = {
  searchValue: "",
  selectedBrand: "",
  selectedType: "",
  selectedCate: ["", "", ""]
}

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

export function useProductSearch() {
  const { allProducts } = useProduct()
  const [formState, dispatch] = useReducer(searchReducer, initialState)
  const [appliedState, setAppliedState] = useState<SearchState>(initialState)

  const filteredData = useMemo(() => {
    if (!allProducts || !allProducts.length) return []

    return allProducts.filter((item: ApiProductData) => {
      const { searchValue, selectedBrand, selectedType, selectedCate } = appliedState
      const textInput = searchValue.toLowerCase();
      const nameMatches = item.name.toLowerCase().includes(textInput) || 
                        (item.engName && item.engName.toLowerCase().includes(textInput));

      // If "全部" is selected, treat it as no filter
      const allText = "全部"
      const selectedBrandValue = selectedBrand === allText ? "" : selectedBrand
      const selectedTypeValue = selectedType === allText ? "" : selectedType
      const brandMatches = !selectedBrandValue || item.brand === selectedBrandValue;
      const typeMatches = !selectedTypeValue || item.type === selectedTypeValue;

      const selectedCateValue = selectedCate.map(cate => cate === allText ? "" : cate)
      const hasCategory = !!(selectedCateValue[0] || selectedCateValue[2])
      // if selectedCate[0] and selectedCate[2] are both selected, isOrOperator 才會是『或』以外的值
      const isOrOperator = (selectedCateValue[1] || "or") === "or"
      const categoryMatches = !hasCategory ||
        (isOrOperator ?
          (item.categories && (item.categories.includes(selectedCateValue[0]) || item.categories.includes(selectedCateValue[2]))) :
          (item.categories && item.categories.includes(selectedCateValue[0]) && item.categories.includes(selectedCateValue[2])))

      return brandMatches && typeMatches && categoryMatches &&
            (!searchValue || nameMatches);
    })
  }, [allProducts, appliedState]);

  const updateField = (field: keyof SearchState, value: string | string[]) => {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  const applySearch = () => {
    setAppliedState({ ...formState })
  }

  const reset = () => {
    dispatch({ type: 'RESET' })
  }

  return {
    formState,
    filteredData,
    updateField,
    applySearch,
    reset,
  }
}