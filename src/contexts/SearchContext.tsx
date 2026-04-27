"use client"

import { useMemo, useContext, useReducer, useState, createContext } from "react"
import { useProduct } from "@/contexts/ProductContext"
import { ApiProductListData, SearchState, SearchAction } from "@/types"

const ALL_TEXT = "全部"

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

const searchFilter = {
  name: (item: ApiProductListData, searchValue: string): boolean => {
    if (!searchValue) return true

    const textInput = searchValue.toLowerCase();
    const nameMatches = item.name?.toLowerCase().includes(textInput)
    const engNameMatches = item.engName?.toLowerCase().includes(textInput)

    return nameMatches || engNameMatches
  },
  brand: (item: ApiProductListData, selectedBrand: string): boolean => {
    if (!selectedBrand || selectedBrand === ALL_TEXT) return true
    return item.brand === selectedBrand;
  },
  type: (item: ApiProductListData, selectedType: string): boolean => {
    if (!selectedType || selectedType === ALL_TEXT) return true
    return item.type === selectedType;
  },
  category: (item: ApiProductListData, selectedCate: string[]): boolean => {
    // if selected 全部, return true
    if (selectedCate.some(cate => cate === ALL_TEXT)) return true

    // if selected 全部, change to ""
    const [cate1, operator, cate2] = selectedCate.map(cate => cate === ALL_TEXT ? "" : cate)
    
    // if no category selected, return true
    const hasCategory = !!(cate1 || cate2)
    if (!hasCategory) return true

    // if product has no categories, return false
    const productCate = item.categories || []
    if (!productCate || !productCate.length) return false

    const isOrOperator = (operator || "or") === "or"
    
    // if selectedCate[0] and selectedCate[2] are both selected, isOrOperator 才會是『或』以外的值
    if (isOrOperator) {
      return (productCate.includes(cate1) || productCate.includes(cate2))
    } else {
      return productCate.includes(cate1) && productCate.includes(cate2)
    }
  }
}

const filterProducts = (products: ApiProductListData[], searchState: SearchState) => {
  if (!products || !products.length) return []

  return products.filter((item: ApiProductListData) => {
    const { searchValue, selectedBrand, selectedType, selectedCate } = searchState

    return (
      searchFilter.brand(item, selectedBrand) && 
      searchFilter.type(item, selectedType) && 
      searchFilter.category(item, selectedCate) && 
      searchFilter.name(item, searchValue)
    )
  })
}

interface SearchContextType {
  formState: SearchState
  filteredData: ApiProductListData[]
  updateField: (field: keyof SearchState, value: string | string[]) => void
  applySearch: () => void
  reset: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { allProducts } = useProduct()
  const [formState, dispatch] = useReducer(searchReducer, initialState)
  const [appliedState, setAppliedState] = useState<SearchState>(initialState)

  const filteredData = useMemo(() => {
    return filterProducts(allProducts, appliedState)
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

  return (
    <SearchContext.Provider value={{
      formState,
      filteredData,
      updateField,
      applySearch,
      reset,
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}