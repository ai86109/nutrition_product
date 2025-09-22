import React from 'react';
import  { act, renderHook } from '@testing-library/react';
import { BioInfoProvider, useBioInfo, DEFAULT_CALORIE_TYPE_SETTINGS } from '@/contexts/BioInfoContext';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return <BioInfoProvider>{children}</BioInfoProvider>;
}

describe('BioInfoContext', () => {
  describe('initial values', () => {
    test('provides correct initial values', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper });
  
      expect(result.current.formData).toEqual({
        height: "",
        weight: "",
        age: "",
      })
  
      expect(result.current.gender).toBe('man');
    })
  
    test('provides correct initial calorie type list', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper })
  
      expect(result.current.calorieTypeLists).toEqual(DEFAULT_CALORIE_TYPE_SETTINGS)
    })
  
    test('provides correct initial TDEE', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper })
  
      expect(result.current.tdee).toBe("")
    })
  
    test('provides correct initial protein range', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper })
  
      expect(result.current.proteinRange).toEqual({ min: "", max: "" })
    })
  })

  describe('update bio-info values', () => {
    test('updates formData correctly', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper });
  
      const newFormData = {
        height: 170,
        weight: 65,
        age: 28,
      };

      act(() => {
        result.current.setFormData(newFormData);
      });

      expect(result.current.formData).toEqual(newFormData);
    });

    test('updates partial formData correctly', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper });
  
      act(() => {
        result.current.setFormData((prev) => ({ ...prev, weight: 75 }));
      });

      expect(result.current.formData).toEqual({
        height: "",
        weight: 75,
        age: "",
      });
    });

    test('updates age correctly', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper });
  
      act(() => {
        result.current.setGender('woman');
      });

      expect(result.current.gender).toBe('woman');

      act(() => {
        result.current.setGender('man');
      });

      expect(result.current.gender).toBe('man');
    });

    test('updates submittedValues correctly', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper });
  
      act(() => {
        result.current.setSubmittedValues(prev => ({
          ...prev,
          height: 180,
          weight: 75,
          age: 30,
          gender: 'woman',
        }));
      });
  
      expect(result.current.submittedValues).toEqual({
        height: 180,
        weight: 75,
        age: 30,
        gender: 'woman',
      });
    });
  
    test('updates partial submittedValues correctly', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper });
  
      act(() => {
        result.current.setSubmittedValues(prev => ({
          ...prev,
          weight: 80,
        }));
      });
  
      expect(result.current.submittedValues).toEqual({
        height: 0,
        weight: 80,
        age: 0,
        gender: 'man'
      });
    });
  });

  describe('update calorie type checked status', () => {
    test('toggle PBW checked status', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper })
  
      act(() => {
        result.current.setCalorieTypeLists(prev => {
          return prev.map(item => {
            if (item.id === 'PBW') {
              return { ...item, checked: !item.checked }
            }
            return item
          })
        })
      })

      expect(result.current.calorieTypeLists).toEqual([
        { id: 'PBW', label: 'PBW', checked: false },
        { id: 'IBW', label: 'IBW', checked: true },
        { id: 'ABW', label: 'ABW', checked: false },
      ])
    })
  });

  describe('update TDEE', () => {
    test('sets TDEE correctly', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper })
  
      act(() => {
        result.current.setTdee(2200)
      })
  
      expect(result.current.tdee).toBe(2200)
    })
  });

  describe('update protein range', () => {
    test('sets protein range correctly', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper })
  
      act(() => {
        result.current.setProteinRange({ min: 60, max: 120 })
      })
  
      expect(result.current.proteinRange).toEqual({ min: 60, max: 120 })
    })
  });
});
