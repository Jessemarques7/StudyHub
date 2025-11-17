"use client";

import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  initializeWithValue?: boolean;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    initializeWithValue = true,
  } = options;

  // Estado para rastrear se estamos no cliente
  const [isClient, setIsClient] = useState(false);

  // Função para ler do localStorage
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key, deserializer]);

  // Estado com valor inicial correto
  const [storedValue, setStoredValue] = useState<T>(
    initializeWithValue ? readValue : initialValue
  );

  // Detecta quando estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carrega o valor do localStorage no mount (apenas no cliente)
  useEffect(() => {
    if (!isClient || !initializeWithValue) return;
    setStoredValue(readValue());
  }, [isClient, initializeWithValue, readValue]);

  // Função para setar o valor
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      if (!isClient) {
        console.warn(
          `Tried to set localStorage key "${key}" even though environment is not a client`
        );
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, serializer(newValue));
        setStoredValue(newValue);

        // Dispara evento customizado para sincronização entre tabs
        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serializer, isClient]
  );

  // Função para remover o valor
  const removeValue = useCallback(() => {
    if (!isClient) return;

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, isClient]);

  // Sincroniza entre tabs
  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (e: StorageEvent | Event) => {
      if ((e as StorageEvent).key && (e as StorageEvent).key !== key) return;
      setStoredValue(readValue());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [key, readValue, isClient]);

  return [storedValue, setValue, removeValue];
}
