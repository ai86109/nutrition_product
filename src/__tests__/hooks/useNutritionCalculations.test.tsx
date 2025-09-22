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
  useBioInfo: () => ({ submittedValues: mockSubmittedValues })
}))

describe('useNutritionCalculations', () => {
  beforeEach(() => {
    mockSubmittedValues.height = defaultHeight;
    mockSubmittedValues.weight = defaultWeight;
    mockSubmittedValues.age = defaultAge;
    mockSubmittedValues.gender = defaultGender;
  });

  describe('rounding', () => {
    test('rounds to specified digits', () => {
      const { result } = renderHook(() => useNutritionCalculations());

      // Test rounding for different values
      expect(result.current.rounding(2.3456, 0)).toBe(2);
      expect(result.current.rounding(2.3456, 1)).toBe(2.3);
      expect(result.current.rounding(2.3456, 2)).toBe(2.35);
      expect(result.current.rounding(2.3456, 3)).toBe(2.346);
    });
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

  describe('calculateTDEE', () => {
    test('calculates TDEE correctly', () => {
      const { result } = renderHook(() => useNutritionCalculations())

      // BEE = 13.7 * 70 + 5 * 180 - 6.8 * 30 + 66 = 1721
      expect(result.current.calculateTDEE(1.2)).toBe(2065);
      expect(result.current.calculateTDEE(1.55)).toBe(2668);
      expect(result.current.calculateTDEE(1.9)).toBe(3270);
    })

    test('returns 0 for invalid parameters', () => {
      const { result } = renderHook(() => useNutritionCalculations())

      expect(result.current.calculateTDEE(0)).toBe(0);
      expect(result.current.calculateTDEE(-1)).toBe(0);
      expect(result.current.calculateTDEE(NaN)).toBe(0);
    })

    test('returns 0 for invalid input values', () => {
      const { result } = renderHook(() => useNutritionCalculations())

      // Invalid height
      mockSubmittedValues.height = 0;
      expect(result.current.calculateTDEE(1.2)).toBe(0);

      mockSubmittedValues.height = -170;
      expect(result.current.calculateTDEE(1.2)).toBe(0);

      mockSubmittedValues.height = NaN;
      expect(result.current.calculateTDEE(1.2)).toBe(0);

      // Reset height and make weight invalid
      mockSubmittedValues.height = defaultHeight;

      mockSubmittedValues.weight = 0;
      expect(result.current.calculateTDEE(1.2)).toBe(0);

      mockSubmittedValues.weight = -70;
      expect(result.current.calculateTDEE(1.2)).toBe(0);

      mockSubmittedValues.weight = NaN;
      expect(result.current.calculateTDEE(1.2)).toBe(0);

      // Reset weight and make age invalid
      mockSubmittedValues.weight = defaultWeight;

      mockSubmittedValues.age = 0;
      expect(result.current.calculateTDEE(1.2)).toBe(0);

      mockSubmittedValues.age = -30;
      expect(result.current.calculateTDEE(1.2)).toBe(0);

      mockSubmittedValues.age = NaN;
      expect(result.current.calculateTDEE(1.2)).toBe(0);
    });
  });

  describe('calculateProtein', () => {
    test('calculates protein correctly', () => {
      const { result } = renderHook(() => useNutritionCalculations())

      // IBW = 71
      expect(result.current.calculateProtein(0.8)).toBe(56.8);
      expect(result.current.calculateProtein(1.2)).toBe(85.2);
      expect(result.current.calculateProtein(1.5)).toBe(106.5);
    })

    test('returns 0 for invalid protein factor', () => {
      const { result } = renderHook(() => useNutritionCalculations())

      expect(result.current.calculateProtein(0)).toBe(0);
      expect(result.current.calculateProtein(-1)).toBe(0);
      expect(result.current.calculateProtein(NaN)).toBe(0);
    })

    test('returns 0 for invalid IBW', () => {
      const { result } = renderHook(() => useNutritionCalculations())

      mockSubmittedValues.height = 0;
      expect(result.current.calculateProtein(1)).toBe(0);

      mockSubmittedValues.height = -170;
      expect(result.current.calculateProtein(1)).toBe(0);

      mockSubmittedValues.height = NaN;
      expect(result.current.calculateProtein(1)).toBe(0);
    });
  });
});
