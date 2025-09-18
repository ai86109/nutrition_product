import { renderHook } from "@testing-library/react";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";

const defaultHeight = 180;
const defaultWeight = 70;
const defaultAge = 30;
const defaultGender = 'man';

const mockSubmittedValues = {
  height: defaultHeight,
  weight: defaultWeight,
  age: defaultAge,
  gender: defaultGender
}

jest.mock('@/contexts/BioInfoContext', () => ({
  useBioInfo: () => ({
    submittedValues: mockSubmittedValues
  })
}))

describe('useNutritionCalculations', () => {
  beforeEach(() => {
    mockSubmittedValues.height = defaultHeight;
    mockSubmittedValues.weight = defaultWeight;
    mockSubmittedValues.age = defaultAge;
    mockSubmittedValues.gender = defaultGender;
  });
  
  describe('calculateBMI', () => {
    test('calculates BMI correctly', () => {
      const { result } = renderHook(() => useNutritionCalculations());

      // BMI = 70 / (1.8 * 1.8) = 21.6
      expect(result.current.calculateBMI()).toBe(21.6);
    });

    test('returns 0 for invalid height or weight', () => {
      const { result } = renderHook(() => useNutritionCalculations());

      // Temporarily override mockSubmittedValues
      mockSubmittedValues.height = 0;
      expect(result.current.calculateBMI()).toBe(0);

      mockSubmittedValues.height = -170;
      expect(result.current.calculateBMI()).toBe(0);

      mockSubmittedValues.height = NaN;
      expect(result.current.calculateBMI()).toBe(0);

      // reset height
      mockSubmittedValues.height = defaultHeight;

      mockSubmittedValues.weight = 0;
      expect(result.current.calculateBMI()).toBe(0);

      mockSubmittedValues.weight = -70;
      expect(result.current.calculateBMI()).toBe(0);

      mockSubmittedValues.weight = NaN;
      expect(result.current.calculateBMI()).toBe(0);
    });
  });

  describe('calculateIBW', () => {
    test('calculates IBW correctly', () => {
      const { result } = renderHook(() => useNutritionCalculations());

      // IBW = 1.8 * 1.8 * 22 = 71.28 -> 71
      expect(result.current.calculateIBW()).toBe(71);
    });

    test('returns 0 for invalid height', () => {
      const { result } = renderHook(() => useNutritionCalculations());

      mockSubmittedValues.height = 0;
      expect(result.current.calculateIBW()).toBe(0);

      mockSubmittedValues.height = -170;
      expect(result.current.calculateIBW()).toBe(0);

      mockSubmittedValues.height = NaN;
      expect(result.current.calculateIBW()).toBe(0);
    });
  });

  describe('calculatePBW', () => {
    test('calculates PBW correctly', () => {
      const { result } = renderHook(() => useNutritionCalculations());

      // PBW = 70 -> 70
      expect(result.current.calculatePBW()).toBe(70);
    });

    test('returns 0 for invalid weight', () => {
      const { result } = renderHook(() => useNutritionCalculations());

      mockSubmittedValues.weight = 0;
      expect(result.current.calculatePBW()).toBe(0);

      mockSubmittedValues.weight = -70;
      expect(result.current.calculatePBW()).toBe(0);

      mockSubmittedValues.weight = NaN;
      expect(result.current.calculatePBW()).toBe(0);
    });
  });

  describe('calculateABW', () => {
    test('calculates ABW correctly', () => {
      const { result } = renderHook(() => useNutritionCalculations());

      // ABW = 71 + 0.25 * (70 - 71) = 70.75 -> 71
      expect(result.current.calculateABW()).toBe(71);
    });

    test('returns 0 for invalid IBW or PBW', () => {
      const { result } = renderHook(() => useNutritionCalculations());

      // Invalid IBW
      mockSubmittedValues.height = 0;
      expect(result.current.calculateABW()).toBe(0);

      mockSubmittedValues.height = -170;
      expect(result.current.calculateABW()).toBe(0);

      mockSubmittedValues.height = NaN;
      expect(result.current.calculateABW()).toBe(0);

      // Reset height and make weight invalid
      mockSubmittedValues.height = defaultHeight;

      mockSubmittedValues.weight = 0;
      expect(result.current.calculateABW()).toBe(0);

      mockSubmittedValues.weight = -70;
      expect(result.current.calculateABW()).toBe(0);

      mockSubmittedValues.weight = NaN;
      expect(result.current.calculateABW()).toBe(0);
    });
  });
});
