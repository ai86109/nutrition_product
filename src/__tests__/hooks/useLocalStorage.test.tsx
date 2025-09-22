import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const LOCALSTORAGE_KEY = 'testKey';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('basic functionality', () => {
    test('initializes with default value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage(LOCALSTORAGE_KEY, { a: 1, b: 2 }));
      const [value] = result.current;

      expect(value).toEqual({ a: 1, b: 2 });
    });

    test('initializes with stored value when localStorage has valid data', () => {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({ a: 3, b: 4 }));
      const { result } = renderHook(() => useLocalStorage(LOCALSTORAGE_KEY, { a: 1, b: 2 }));
      const [value] = result.current;

      expect(value).toEqual({ a: 3, b: 4 });
    });

    test('updates state and localStorage when setValue is called with new value', () => {
      const { result } = renderHook(() => useLocalStorage(LOCALSTORAGE_KEY, { a: 1, b: 2 }));
      const setValue = result.current[1];

      act(() => {
        setValue({ a: 5, b: 6 });
      });

      const value = result.current[0];
      expect(value).toEqual({ a: 5, b: 6 });
    });

    test('updates state and localStorage when setValue is called with function', () => {
      const { result } = renderHook(() => useLocalStorage(LOCALSTORAGE_KEY, { a: 1, b: 2 }));
      const setValue = result.current[1];

      act(() => {
        setValue((prev) => ({ ...prev, a: prev.a + 10 }));
      });

      const value = result.current[0];
      expect(value).toEqual({ a: 11, b: 2 });
    });
  })

  describe('options handling', () => {
    test('uses custom serialize and deserialize functions', () => {
      const serialize = jest.fn((value) => `custom-${value.a}-${value.b}`);
      const deserialize = jest.fn((str) => {
        const parts = str.split('-');
        return { a: Number(parts[1]), b: Number(parts[2]) };
      });

      localStorage.setItem(LOCALSTORAGE_KEY, 'custom-7-8');

      const { result } = renderHook(() => useLocalStorage(LOCALSTORAGE_KEY, { a: 1, b: 2 }, { serialize, deserialize }));
      const [value] = result.current;

      expect(deserialize).toHaveBeenCalled();
      expect(value).toEqual({ a: 7, b: 8 });

      act(() => {
        const setValue = result.current[1];
        setValue({ a: 9, b: 10 });
      });

      expect(serialize).toHaveBeenCalled();
      expect(localStorage.getItem(LOCALSTORAGE_KEY)).toBe('custom-9-10');
    });

    test('falls back to default value when validator fails', () => {
      const validator = jest.fn((value) => value && typeof value.a === 'number' && typeof value.b === 'number');
      const defaultValue = { a: 1, b: 2 };

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({ a: 'invalid', b: 4 }));

      const { result } = renderHook(() => useLocalStorage(LOCALSTORAGE_KEY, defaultValue, { validator }));
      const [value] = result.current;

      expect(validator).toHaveBeenCalled();
      expect(value).toEqual(defaultValue); // should fall back to default
    });
  });
});
