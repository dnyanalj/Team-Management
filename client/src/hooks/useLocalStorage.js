import { useState, useCallback } from 'react';

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const update = useCallback(
    (nextValue) => {
      setValue((prev) => {
        const resolved = typeof nextValue === 'function' ? nextValue(prev) : nextValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage unavailable; ignore
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, update];
}
