import { useCallback, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string,
    deserialize?: (value: string) => T,
    validator?: (value: T) => boolean,
  }
) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    validator = () => true,
  } = options || {};

  // get initial value
  const [storedValue, setStoredValue] = useState(() => {

    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      const parsedItem = deserialize(item);

      if (validator(parsedItem)) {
        return parsedItem;
      } else {
        console.warn(`Invalid data format for "${key}", using default settings.`);
        return defaultValue;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  })

  // update localStorage value
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        localStorage.setItem(key, serialize(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue])

  return [storedValue, setValue] as const;
}
