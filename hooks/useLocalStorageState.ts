// "use client";

// import { useState, useEffect, Dispatch, SetStateAction } from "react";

// export function useLocalStorageState<T>(
//   initialState: T,
//   key: string
// ): [T, Dispatch<SetStateAction<T>>] {
//   const [value, setValue] = useState<T>(() => {
//     if (typeof window === "undefined") return initialState;
//     try {
//       const storedValue = localStorage.getItem(key);
//       return storedValue ? (JSON.parse(storedValue) as T) : initialState;
//     } catch {
//       return initialState;
//     }
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem(key, JSON.stringify(value));
//     } catch {
//       // Evita erro se localStorage estiver desabilitado
//     }
//   }, [value, key]);

//   return [value, setValue];
// }

"use client";

import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";

export function useLocalStorageState<T>(
  initialState: T,
  key: string
): [T, Dispatch<SetStateAction<T>>] {
  // Estado para controlar se estamos no cliente
  const [isClient, setIsClient] = useState(false);

  // Inicializa com o valor inicial sempre (evita hidratação mismatch)
  const [value, setValue] = useState<T>(initialState);

  // Detecta quando estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carrega o valor do localStorage apenas no cliente
  useEffect(() => {
    if (!isClient) return;

    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        setValue(JSON.parse(storedValue) as T);
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    }
  }, [key, isClient]);

  // Salva no localStorage quando o valor muda
  useEffect(() => {
    if (!isClient) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [value, key, isClient]);

  return [value, setValue];
}

// Hook alternativo com callback para melhor performance
export function useLocalStorageStateWithCallback<T>(
  initialState: T,
  key: string
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialState);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, isClient]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (isClient) {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, isClient]
  );

  return [storedValue, setValue];
}
