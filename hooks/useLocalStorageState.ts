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
