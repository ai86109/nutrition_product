import { act, renderHook } from "@testing-library/react";
import { useProductSearch } from "@/hooks/useProductSearch";
import { mockProductContext, mockProducts, productSearchHelper } from "../utils/test-data";

const { DEFAULT_FORM_STATE } = productSearchHelper;

jest.mock('@/contexts/ProductContext', () => ({
  useProduct: () => mockProductContext()
}))

describe('useProductSearch', () => {
  describe('initial', () => {
    test('search form state', () => {
      const { result } = renderHook(() => useProductSearch());
      expect(result.current.formState).toEqual(DEFAULT_FORM_STATE);
    })

    test('filtered data', () => {
      const { result } = renderHook(() => useProductSearch());
      expect(result.current.filteredData).toEqual(mockProducts);
    })

    test('returned functions', () => {
      const { result } = renderHook(() => useProductSearch());
      expect(typeof result.current.updateField).toBe('function')
      expect(typeof result.current.applySearch).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })
  })

  describe('updateField', () => {
    test('update searchValue but not apply search button', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateField('searchValue', 'test');
      });
      expect(result.current.formState.searchValue).toEqual('test');
      expect(result.current.filteredData).toEqual(mockProducts);
    })

    test('update selectedBrand but not apply search button', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateField('selectedBrand', '雀巢');
      });
      expect(result.current.formState.selectedBrand).toEqual('雀巢');
      expect(result.current.filteredData).toEqual(mockProducts);
    })

    test('update selectedType but not apply search button', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateField('selectedType', '液劑');
      });
      expect(result.current.formState.selectedType).toEqual('液劑');
      expect(result.current.filteredData).toEqual(mockProducts);
    })

    test('update selectedCate but not apply search button', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateField('selectedCate', ['均衡配方', 'or', '濃縮配方']);
      });
      expect(result.current.formState.selectedCate).toEqual(['均衡配方', 'or', '濃縮配方']);
      expect(result.current.filteredData).toEqual(mockProducts);
    })
  })

  describe('applySearch', () => {
    test('apply search with searchValue only', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateField('searchValue', '立攝適');
      });
      act(() => {
        result.current.applySearch();
      });
      expect(result.current.formState.searchValue).toEqual('立攝適');
      expect(result.current.filteredData).toEqual([mockProducts[0]]);
    })

    test('apply search with selectedBrand only', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateField('selectedBrand', '亞培');
      });
      act(() => {
        result.current.applySearch();
      });
      expect(result.current.formState.selectedBrand).toEqual('亞培');
      expect(result.current.filteredData).toEqual([mockProducts[1]]);
    })

    test('apply search with selectedType only', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateField('selectedType', '液劑');
      });
      act(() => {
        result.current.applySearch();
      });
      expect(result.current.formState.selectedType).toEqual('液劑');
      expect(result.current.filteredData).toEqual(mockProducts);
    })

    test('apply search with selectedCate only', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateField('selectedCate', ['均衡配方', 'and', '濃縮配方']);
      });
      act(() => {
        result.current.applySearch();
      });
      expect(result.current.formState.selectedCate).toEqual(['均衡配方', 'and', '濃縮配方']);
      expect(result.current.filteredData).toEqual(mockProducts);
    })

    test('apply search with multiple fields', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateField('searchValue', '健力體');
        result.current.updateField('selectedBrand', '亞培');
        result.current.updateField('selectedType', '液劑');
        result.current.updateField('selectedCate', ['均衡配方', 'or', '濃縮配方']);
      });
      act(() => {
        result.current.applySearch();
      });

      expect(result.current.formState).toEqual({
        searchValue: '健力體',
        selectedBrand: '亞培',
        selectedType: '液劑',
        selectedCate: ['均衡配方', 'or', '濃縮配方']
      });
      expect(result.current.filteredData).toEqual([mockProducts[1]]);
    })
  })

  describe('reset', () => {
    test('reset form state and filtered data', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateField('searchValue', '健力體');
        result.current.updateField('selectedBrand', '亞培');
        result.current.updateField('selectedType', '液劑');
        result.current.updateField('selectedCate', ['均衡配方', 'or', '濃縮配方']);
      });
      act(() => {
        result.current.applySearch();
      });

      expect(result.current.formState).toEqual({
        searchValue: '健力體',
        selectedBrand: '亞培',
        selectedType: '液劑',
        selectedCate: ['均衡配方', 'or', '濃縮配方']
      });
      expect(result.current.filteredData).toEqual([mockProducts[1]]);

      act(() => {
        result.current.reset();
      });

      expect(result.current.formState).toEqual(DEFAULT_FORM_STATE);

      act(() => {
        result.current.applySearch();
      })
      expect(result.current.filteredData).toEqual(mockProducts);
    })
  })
})
