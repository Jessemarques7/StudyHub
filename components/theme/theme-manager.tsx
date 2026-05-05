"use client";

import { useEffect } from "react";

import { useLocalStorage } from "@/hooks/useLocalStorageState";
import {
  applyThemeColors,
  DEFAULT_THEME_COLORS,
  THEME_STORAGE_KEY,
  type ThemeColors,
} from "@/lib/theme-colors";

export function ThemeManager() {
  const [themeColors] = useLocalStorage<ThemeColors>(
    THEME_STORAGE_KEY,
    DEFAULT_THEME_COLORS,
  );

  useEffect(() => {
    applyThemeColors(themeColors);
  }, [themeColors]);

  return null;
}
