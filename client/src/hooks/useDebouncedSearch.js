import { useState, useEffect, useCallback, useRef } from 'react';

export function useDebouncedSearch(initialValue = '', delay = 400, onChange) {
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  // Follow outside changes (e.g. the Reset button clearing filters) and drop any pending commit,
  // so a half-typed search doesn't re-apply itself after the reset.
  useEffect(() => {
    clearTimeout(timerRef.current);
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback(
    (nextValue) => {
      setValue(nextValue);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChangeRef.current?.(nextValue);
      }, delay);
    },
    [delay]
  );

  return [value, handleChange];
}
