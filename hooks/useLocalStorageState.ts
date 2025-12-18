// "use client";

// import {
//   useState,
//   useEffect,
//   useCallback,
//   Dispatch,
//   SetStateAction,
// } from "react";

// interface UseLocalStorageOptions<T> {
//   serializer?: (value: T) => string;
//   deserializer?: (value: string) => T;
//   initializeWithValue?: boolean;
// }

// export function useLocalStorage<T>(
//   key: string,
//   initialValue: T,
//   options: UseLocalStorageOptions<T> = {}
// ): [T, Dispatch<SetStateAction<T>>, () => void] {
//   const {
//     serializer = JSON.stringify,
//     deserializer = JSON.parse,
//     initializeWithValue = true,
//   } = options;

//   // Estado para rastrear se estamos no cliente
//   const [isClient, setIsClient] = useState(false);

//   // Função para ler do localStorage
//   const readValue = useCallback((): T => {
//     if (typeof window === "undefined") {
//       return initialValue;
//     }

//     try {
//       const item = window.localStorage.getItem(key);
//       return item ? deserializer(item) : initialValue;
//     } catch (error) {
//       console.warn(`Error reading localStorage key "${key}":`, error);
//       return initialValue;
//     }
//   }, [initialValue, key, deserializer]);

//   // Estado com valor inicial correto
//   const [storedValue, setStoredValue] = useState<T>(
//     initializeWithValue ? readValue : initialValue
//   );

//   // Detecta quando estamos no cliente
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   // Carrega o valor do localStorage no mount (apenas no cliente)
//   useEffect(() => {
//     if (!isClient || !initializeWithValue) return;
//     setStoredValue(readValue());
//   }, [isClient, initializeWithValue, readValue]);

//   // Função para setar o valor
//   const setValue: Dispatch<SetStateAction<T>> = useCallback(
//     (value) => {
//       if (!isClient) {
//         console.warn(
//           `Tried to set localStorage key "${key}" even though environment is not a client`
//         );
//         return;
//       }

//       try {
//         const newValue = value instanceof Function ? value(storedValue) : value;
//         window.localStorage.setItem(key, serializer(newValue));
//         setStoredValue(newValue);

//         // Dispara evento customizado para sincronização entre tabs
//         window.dispatchEvent(new Event("local-storage"));
//       } catch (error) {
//         console.warn(`Error setting localStorage key "${key}":`, error);
//       }
//     },
//     [key, storedValue, serializer, isClient]
//   );

//   // Função para remover o valor
//   const removeValue = useCallback(() => {
//     if (!isClient) return;

//     try {
//       window.localStorage.removeItem(key);
//       setStoredValue(initialValue);
//       window.dispatchEvent(new Event("local-storage"));
//     } catch (error) {
//       console.warn(`Error removing localStorage key "${key}":`, error);
//     }
//   }, [key, initialValue, isClient]);

//   // Sincroniza entre tabs
//   useEffect(() => {
//     if (!isClient) return;

//     const handleStorageChange = (e: StorageEvent | Event) => {
//       if ((e as StorageEvent).key && (e as StorageEvent).key !== key) return;
//       setStoredValue(readValue());
//     };

//     window.addEventListener("storage", handleStorageChange);
//     window.addEventListener("local-storage", handleStorageChange);

//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//       window.removeEventListener("local-storage", handleStorageChange);
//     };
//   }, [key, readValue, isClient]);

//   return [storedValue, setValue, removeValue];
// }

// "use client";

// import {
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
//   Dispatch,
//   SetStateAction,
// } from "react";

// interface UseLocalStorageOptions<T> {
//   serializer?: (value: T) => string;
//   deserializer?: (value: string) => T;
//   initializeWithValue?: boolean;
// }

// export function useLocalStorage<T>(
//   key: string,
//   initialValue: T,
//   options: UseLocalStorageOptions<T> = {}
// ): [T, Dispatch<SetStateAction<T>>, () => void] {
//   const {
//     serializer = JSON.stringify,
//     deserializer = JSON.parse,
//     initializeWithValue = true,
//   } = options;

//   // Use ref to keep track of initialValue without triggering re-renders in callbacks
//   const initialValueRef = useRef(initialValue);

//   // Update ref if initialValue changes (optional, but good practice)
//   useEffect(() => {
//     initialValueRef.current = initialValue;
//   }, [initialValue]);

//   const [isClient, setIsClient] = useState(false);

//   const readValue = useCallback((): T => {
//     // Prevent usage during SSR if logic dictates, but generally safe to access ref
//     if (typeof window === "undefined") {
//       return initialValueRef.current;
//     }

//     try {
//       const item = window.localStorage.getItem(key);
//       return item ? deserializer(item) : initialValueRef.current;
//     } catch (error) {
//       console.warn(`Error reading localStorage key "${key}":`, error);
//       return initialValueRef.current;
//     }
//     // Remove initialValue from dependencies to avoid loop when passing [] or {} literals
//   }, [key, deserializer]);

//   const [storedValue, setStoredValue] = useState<T>(
//     initializeWithValue ? readValue : initialValue
//   );

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     if (!isClient || !initializeWithValue) return;
//     setStoredValue(readValue());
//   }, [isClient, initializeWithValue, readValue]);

//   const setValue: Dispatch<SetStateAction<T>> = useCallback(
//     (value) => {
//       if (!isClient) {
//         console.warn(
//           `Tried to set localStorage key "${key}" even though environment is not a client`
//         );
//         return;
//       }

//       try {
//         const newValue = value instanceof Function ? value(storedValue) : value;
//         window.localStorage.setItem(key, serializer(newValue));
//         setStoredValue(newValue);

//         window.dispatchEvent(new Event("local-storage"));
//       } catch (error) {
//         console.warn(`Error setting localStorage key "${key}":`, error);
//       }
//     },
//     [key, storedValue, serializer, isClient]
//   );

//   const removeValue = useCallback(() => {
//     if (!isClient) return;

//     try {
//       window.localStorage.removeItem(key);
//       setStoredValue(initialValueRef.current);
//       window.dispatchEvent(new Event("local-storage"));
//     } catch (error) {
//       console.warn(`Error removing localStorage key "${key}":`, error);
//     }
//   }, [key, isClient]); // Removed initialValue from deps

//   useEffect(() => {
//     if (!isClient) return;

//     const handleStorageChange = (e: StorageEvent | Event) => {
//       if ((e as StorageEvent).key && (e as StorageEvent).key !== key) return;
//       setStoredValue(readValue());
//     };

//     window.addEventListener("storage", handleStorageChange);
//     window.addEventListener("local-storage", handleStorageChange);

//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//       window.removeEventListener("local-storage", handleStorageChange);
//     };
//   }, [key, readValue, isClient]);

//   return [storedValue, setValue, removeValue];
// }

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

  // Ref para manter o valor inicial estável
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // FIX: Inicializamos SEMPRE com initialValue para garantir match com SSR
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  const [isClient, setIsClient] = useState(false);

  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValueRef.current;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key, deserializer]);

  // Define que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // FIX: Hidratação acontece apenas após a montagem no cliente
  useEffect(() => {
    if (initializeWithValue) {
      setStoredValue(readValue());
    }
  }, [initializeWithValue, readValue]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      // Previne execução no server ou antes da hidratação completa
      if (!isClient) {
        console.warn(
          `Tried to set localStorage key "${key}" before client hydration`
        );
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, serializer(newValue));
        setStoredValue(newValue);

        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serializer, isClient]
  );

  const removeValue = useCallback(() => {
    if (!isClient) return;

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValueRef.current);
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, isClient]);

  // Sincronização entre abas
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
