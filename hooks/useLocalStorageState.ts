// hooks/useLocalStorageState.ts
"use client";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const { serializer = JSON.stringify, deserializer = JSON.parse } = options;
  const initialValueRef = useRef(initialValue);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        if (item) setStoredValue(deserializer(item));
      }
    } catch (error) {
      console.warn(`Erro localStorage "${key}":`, error);
    }
  }, [key, deserializer]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, serializer(valueToStore));
          window.dispatchEvent(new Event("local-storage"));
        }
      } catch (error) {
        console.warn(`Erro set localStorage "${key}":`, error);
      }
    },
    [key, storedValue, serializer]
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValueRef.current);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new Event("local-storage"));
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
}
