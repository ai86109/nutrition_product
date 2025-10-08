import  { act, renderHook } from '@testing-library/react';
import { useBioInfo, DEFAULT_CALORIE_TYPE_SETTINGS } from '@/contexts/BioInfoContext';
import { createBioInfoWrapper, defaultFormData, defaultGender, defaultSubmittedValues } from '../utils/test-data';
import { Gender } from '@/types';

const wrapper = createBioInfoWrapper()

describe('BioInfoContext', () => {
  describe('initial values', () => {
    test('provides correct initial values', () => {
      const { result } = renderHook(() => useBioInfo(), { wrapper });

      expect(result.current.formData).toEqual(defaultFormData);
      expect(result.current.gender).toBe(defaultGender);
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
        ...defaultFormData,
        weight: 75,
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
      const updatedValues = {
        height: 180,
        weight: 75,
        age: 30,
        gender: 'woman' as Gender,
      };
      
      act(() => {
        result.current.setSubmittedValues(prev => ({
          ...prev,
          ...updatedValues
        }));
      });
      expect(result.current.submittedValues).toEqual(updatedValues);
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
        ...defaultSubmittedValues,
        weight: 80,
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
