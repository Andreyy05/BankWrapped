import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value by a given delay in milliseconds.
 * Useful for debouncing search input to avoid recalculating filters on every keystroke.
 */
export function useDebounce<T>(value: T, delayMs: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

