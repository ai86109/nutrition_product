import { renderHook, act } from "@testing-library/react"
import { useSearch } from "@/contexts/SearchContext"
import { mockProducts, createSearchWrapper, productSearchHelper } from "../utils/test-data"
import { SearchState, ApiProductData } from "@/types"

const { DEFAULT_FORM_STATE } = productSearchHelper

interface UpdateFieldParams {
  fn: (field: keyof SearchState, value: string | string[]) => void
  field: keyof SearchState
  value: string | string[]
}

const updateField = ({ fn, field, value }: UpdateFieldParams) => {
  act(() => fn(field, value))
}

const applySearch = (fn: () => void) => act(() => fn())

const reset = (fn: () => void) => act(() => fn())

describe('SearchContext', () => {
  describe('SearchProvider', () => {
    test('provides context values to children', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      expect(result.current.formState).toEqual(DEFAULT_FORM_STATE)
      expect(result.current.filteredData).toEqual(mockProducts)
      expect(result.current.updateField).toBeInstanceOf(Function)
      expect(result.current.applySearch).toBeInstanceOf(Function)
      expect(result.current.reset).toBeInstanceOf(Function)
    })

    test('throws error when used outside provider', () => {
      // 使用 console.error mock 來避免測試輸出錯誤訊息
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        renderHook(() => useSearch())
      }).toThrow('useSearch must be used within a SearchProvider')
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('initial state', () => {
    test('has correct form state', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      expect(result.current.formState).toEqual(DEFAULT_FORM_STATE)
    })

    test('shows all products when no filter applied', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      expect(result.current.filteredData).toEqual(mockProducts)
      expect(result.current.filteredData).toHaveLength(mockProducts.length)
    })
  })

  describe('updateField', () => {
    test('updates searchValue without applying filter', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'searchValue',
        value: 'test'
      })

      expect(result.current.formState.searchValue).toBe('test')
      expect(result.current.filteredData).toEqual(mockProducts)
    })

    test('updates selectedBrand without applying filter', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedBrand',
        value: '雀巢'
      })

      expect(result.current.formState.selectedBrand).toBe('雀巢')
      expect(result.current.filteredData).toEqual(mockProducts)
    })

    test('updates selectedType without applying filter', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedType',
        value: '液劑'
      })

      expect(result.current.formState.selectedType).toBe('液劑')
      expect(result.current.filteredData).toEqual(mockProducts)
    })

    test('updates selectedCate without applying filter', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      const newCategories = ['均衡配方', 'or', '濃縮配方']
      updateField({
        fn: result.current.updateField,
        field: 'selectedCate',
        value: newCategories
      })

      expect(result.current.formState.selectedCate).toEqual(newCategories)
      expect(result.current.filteredData).toEqual(mockProducts)
    })
  })

  describe('applySearch', () => {
    test('filters by searchValue only', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'searchValue',
        value: '立攝適'
      })
      applySearch(result.current.applySearch)

      expect(result.current.formState.searchValue).toBe('立攝適')
      expect(result.current.filteredData).toEqual([mockProducts[0]])
    })

    test('filters by selectedBrand only', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedBrand',
        value: '亞培'
      })
      applySearch(result.current.applySearch)

      expect(result.current.formState.selectedBrand).toBe('亞培')
      expect(result.current.filteredData).toEqual([mockProducts[1]])
    })

    test('filters by selectedType only', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedType',
        value: '液劑'
      })
      applySearch(result.current.applySearch)

      expect(result.current.formState.selectedType).toBe('液劑')
      expect(result.current.filteredData).toEqual([mockProducts[0], mockProducts[1]])
    })

    test('filters by selectedCate with AND operator', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedCate',
        value: ['均衡配方', 'and', '濃縮配方']
      })
      applySearch(result.current.applySearch)

      expect(result.current.formState.selectedCate).toEqual(['均衡配方', 'and', '濃縮配方'])
      expect(result.current.filteredData).toEqual([mockProducts[0], mockProducts[1]])
    })

    test('filters by selectedCate with OR operator', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedCate',
        value: ['均衡配方', 'or', '濃縮配方']
      })
      applySearch(result.current.applySearch)

      expect(result.current.formState.selectedCate).toEqual(['均衡配方', 'or', '濃縮配方'])
      expect(result.current.filteredData).toEqual(mockProducts)
    })

    test('filters with multiple criteria', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      const fn = result.current.updateField
      updateField({ fn, field: 'searchValue', value: '健力體' })
      updateField({ fn, field: 'selectedBrand', value: '亞培' })
      updateField({ fn, field: 'selectedType', value: '液劑' })
      updateField({
        fn,
        field: 'selectedCate',
        value: ['均衡配方', 'or', '濃縮配方']
      })
      applySearch(result.current.applySearch)

      expect(result.current.formState).toEqual({
        searchValue: '健力體',
        selectedBrand: '亞培',
        selectedType: '液劑',
        selectedCate: ['均衡配方', 'or', '濃縮配方']
      })
      expect(result.current.filteredData).toEqual([mockProducts[1]])
    })

    test('returns empty array when no matches found', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'searchValue',
        value: 'NonExistentProduct'
      })
      applySearch(result.current.applySearch)

      expect(result.current.filteredData).toEqual([])
    })
  })

  describe('reset', () => {
    test('resets form state to initial values', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      const fn = result.current.updateField
      updateField({ fn, field: 'searchValue', value: '健力體' })
      updateField({ fn, field: 'selectedBrand', value: '亞培' })
      updateField({ fn, field: 'selectedType', value: '液劑' })
      updateField({
        fn,
        field: 'selectedCate',
        value: ['均衡配方', 'or', '濃縮配方']
      })
      applySearch(result.current.applySearch)

      expect(result.current.formState).toEqual({
        searchValue: '健力體',
        selectedBrand: '亞培',
        selectedType: '液劑',
        selectedCate: ['均衡配方', 'or', '濃縮配方']
      })
      expect(result.current.filteredData).toEqual([mockProducts[1]])

      reset(result.current.reset)

      expect(result.current.formState).toEqual(DEFAULT_FORM_STATE)
      // ⚠️ 注意：reset 後需要再次 apply 才會更新 filteredData
    })

    test('resets filtered data after re-applying search', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'searchValue',
        value: '立攝適'
      })
      applySearch(result.current.applySearch)
      expect(result.current.filteredData).toEqual([mockProducts[0]])

      reset(result.current.reset)
      applySearch(result.current.applySearch)

      expect(result.current.filteredData).toEqual(mockProducts)
    })
  })

  describe('edge cases', () => {
    test('handles empty product list', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper([])
      })

      expect(result.current.filteredData).toEqual([])
    })

    test('handles case-insensitive search', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'searchValue',
        value: '立攝適'
      })
      applySearch(result.current.applySearch)

      expect(result.current.filteredData).toEqual([mockProducts[0]])
    })

    test('handles "全部" selection for brand', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedBrand',
        value: '全部'
      })
      applySearch(result.current.applySearch)

      expect(result.current.filteredData).toEqual(mockProducts)
    })

    test('handles "全部" selection for type', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedType',
        value: '全部'
      })
      applySearch(result.current.applySearch)

      expect(result.current.filteredData).toEqual(mockProducts)
    })

    test('handles "全部" in categories', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedCate',
        value: ['全部', 'or', '']
      })
      applySearch(result.current.applySearch)

      expect(result.current.filteredData).toEqual(mockProducts)
    })

    test('filters products without categories', () => {
      const productsWithoutCategories: ApiProductData[] = [
        { ...mockProducts[0], categories: [] },
        { ...mockProducts[1], categories: undefined }
      ]

      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper(productsWithoutCategories)
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedCate',
        value: ['均衡配方', 'or', '']
      })
      applySearch(result.current.applySearch)

      expect(result.current.filteredData).toEqual([])
    })
  })

  describe('filter combinations', () => {
    test('combines brand and type filters', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'selectedBrand',
        value: '雀巢'
      })
      updateField({
        fn: result.current.updateField,
        field: 'selectedType',
        value: '液劑'
      })
      applySearch(result.current.applySearch)

      expect(result.current.filteredData).toEqual([mockProducts[0]])
    })

    test('combines search value with other filters', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createSearchWrapper()
      })

      updateField({
        fn: result.current.updateField,
        field: 'searchValue',
        value: '體'
      })
      updateField({
        fn: result.current.updateField,
        field: 'selectedBrand',
        value: '亞培'
      })
      applySearch(result.current.applySearch)

      expect(result.current.filteredData).toEqual([mockProducts[1]])
    })
  })
})