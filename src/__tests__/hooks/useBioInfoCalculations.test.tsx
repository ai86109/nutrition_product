import { renderHook } from "@testing-library/react";
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations";
import { defaultHeight, defaultWeight, defaultGender, defaultAge } from "../utils/test-data";

const defaultSubmittedValues = {
  height: defaultHeight,
  weight: defaultWeight,
  age: defaultAge,
  gender: defaultGender
};

const invalidHeight = [0, -170, NaN]
const invalidWeight = [0, -70, NaN]
const invalidAge = [0, -30, NaN]
const invalidFactor = [0, -1, NaN]

const mockSubmittedValues = jest.fn()
jest.mock('@/contexts/BioInfoContext', () => ({
  useBioInfo: () => mockSubmittedValues()
}))

describe('useBioInfoCalculations', () => {
  beforeEach(() => {
    mockSubmittedValues.mockReturnValue({ submittedValues: defaultSubmittedValues });
  });

  describe('rounding', () => {
    test('rounds to specified digits', () => {
      const { result } = renderHook(() => useBioInfoCalculations());

      // Test rounding for different values
      const testValue = 2.3456;
      expect(result.current.rounding(testValue, 0)).toBe(2);
      expect(result.current.rounding(testValue, 1)).toBe(2.3);
      expect(result.current.rounding(testValue, 2)).toBe(2.35);
      expect(result.current.rounding(testValue, 3)).toBe(2.346);
    });
  });

  describe('bmi', () => {
    test('calculates BMI correctly', () => {
      const { result } = renderHook(() => useBioInfoCalculations());

      // BMI = 70 / (1.8 * 1.8) = 21.6
      expect(result.current.bmi).toBe(21.6);
    });

    test('returns 0 for invalid height', () => {
      invalidHeight.forEach(height => {
        mockSubmittedValues.mockReturnValue({ submittedValues: { ...defaultSubmittedValues, height } });
        const { result } = renderHook(() => useBioInfoCalculations());
        expect(result.current.bmi).toBe(0);
      });
    })

    test('returns 0 for invalid weight', () => {
      invalidWeight.forEach(weight => {
        mockSubmittedValues.mockReturnValue({ submittedValues: { ...defaultSubmittedValues, weight } });
        const { result } = renderHook(() => useBioInfoCalculations());
        expect(result.current.bmi).toBe(0);
      });
    })
  });

  describe('ibw', () => {
    test('calculates IBW correctly', () => {
      const { result } = renderHook(() => useBioInfoCalculations());

      // IBW = 1.8 * 1.8 * 22 = 71.28 -> 71
      expect(result.current.ibw).toBe(71);
    });

    test('returns 0 for invalid height', () => {
      invalidHeight.forEach(height => {
        mockSubmittedValues.mockReturnValue({ submittedValues: { ...defaultSubmittedValues, height } });
        const { result } = renderHook(() => useBioInfoCalculations());
        expect(result.current.ibw).toBe(0);
      });
    })
  });

  describe('pbw', () => {
    test('calculates PBW correctly', () => {
      const { result } = renderHook(() => useBioInfoCalculations());

      // PBW = 70 -> 70
      expect(result.current.pbw).toBe(70);
    });

    test('returns 0 for invalid weight', () => {
      invalidWeight.forEach(weight => {
        mockSubmittedValues.mockReturnValue({ submittedValues: { ...defaultSubmittedValues, weight } });
        const { result } = renderHook(() => useBioInfoCalculations());
        expect(result.current.pbw).toBe(0);
      });
    })
  });

  describe('abw', () => {
    test('calculates ABW correctly', () => {
      const { result } = renderHook(() => useBioInfoCalculations());

      // ABW = 71 + 0.25 * (70 - 71) = 70.75 -> 71
      expect(result.current.abw).toBe(71);
    });

    test('returns 0 for invalid height', () => {
      invalidHeight.forEach(height => {
        mockSubmittedValues.mockReturnValue({ submittedValues: { ...defaultSubmittedValues, height } });
        const { result } = renderHook(() => useBioInfoCalculations());
        expect(result.current.abw).toBe(0);
      });
    })

    test('returns 0 for invalid weight', () => {
      invalidWeight.forEach(weight => {
        mockSubmittedValues.mockReturnValue({ submittedValues: { ...defaultSubmittedValues, weight } });
        const { result } = renderHook(() => useBioInfoCalculations());
        expect(result.current.abw).toBe(0);
      });
    })
  });

  describe('calculateTDEE', () => {
    test('calculates TDEE correctly', () => {
      const { result } = renderHook(() => useBioInfoCalculations())

      // BEE = 13.7 * 70 + 5 * 180 - 6.8 * 30 + 66 = 1721
      expect(result.current.calculateTDEE(1.2)).toBe(2065);
      expect(result.current.calculateTDEE(1.55)).toBe(2668);
      expect(result.current.calculateTDEE(1.9)).toBe(3270);
    })

    test('returns 0 for invalid parameters', () => {
      const { result } = renderHook(() => useBioInfoCalculations())

      invalidFactor.forEach(adjustedFactor => {
        expect(result.current.calculateTDEE(adjustedFactor)).toBe(0);
      });
    })

    test('returns 0 for invalid input values', () => {
      invalidHeight.forEach(height => {
        mockSubmittedValues.mockReturnValue({ submittedValues: { ...defaultSubmittedValues, height } });
        const { result } = renderHook(() => useBioInfoCalculations())
        expect(result.current.calculateTDEE(1.2)).toBe(0);
      });

      invalidWeight.forEach(weight => {
        mockSubmittedValues.mockReturnValue({ submittedValues: { ...defaultSubmittedValues, weight } });
        const { result } = renderHook(() => useBioInfoCalculations())
        expect(result.current.calculateTDEE(1.2)).toBe(0);
      });

      invalidAge.forEach(age => {
        mockSubmittedValues.mockReturnValue({ submittedValues: { ...defaultSubmittedValues, age } });
        const { result } = renderHook(() => useBioInfoCalculations())
        expect(result.current.calculateTDEE(1.2)).toBe(0);
      });
    });
  });

  describe('calculateProtein', () => {
    test('calculates protein correctly', () => {
      const { result } = renderHook(() => useBioInfoCalculations())

      // IBW = 71
      expect(result.current.calculateProtein(0.8)).toBe(56.8);
      expect(result.current.calculateProtein(1.2)).toBe(85.2);
      expect(result.current.calculateProtein(1.5)).toBe(106.5);
    })

    test('returns 0 for invalid protein factor', () => {
      const { result } = renderHook(() => useBioInfoCalculations())

      invalidFactor.forEach(proteinFactor => {
        expect(result.current.calculateProtein(proteinFactor)).toBe(0);
      });
    })

    test('returns 0 for invalid IBW', () => {
      invalidHeight.forEach(height => {
        mockSubmittedValues.mockReturnValue({ submittedValues: { ...defaultSubmittedValues, height } });
        const { result } = renderHook(() => useBioInfoCalculations())
        expect(result.current.calculateProtein(1)).toBe(0);
      });
    })
  });
});
