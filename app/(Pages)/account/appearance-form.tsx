"use client";

import { Palette, RotateCcw } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorageState";
import {
  applyThemeColors,
  DEFAULT_THEME_COLORS,
  normalizeThemeColors,
  THEME_COLOR_DEFINITIONS,
  THEME_STORAGE_KEY,
  type ThemeColorKey,
  type ThemeColors,
} from "@/lib/theme-colors";

export function AppearanceForm() {
  const [themeColors, setThemeColors, resetThemeColors] =
    useLocalStorage<ThemeColors>(THEME_STORAGE_KEY, DEFAULT_THEME_COLORS);

  const colors = useMemo(
    () => normalizeThemeColors(themeColors),
    [themeColors],
  );

  useEffect(() => {
    applyThemeColors(colors);
  }, [colors]);

  const handleColorChange = (key: ThemeColorKey, value: string) => {
    const nextColors = normalizeThemeColors({ ...colors, [key]: value });
    setThemeColors(nextColors);
    applyThemeColors(nextColors);
  };

  const handleReset = () => {
    resetThemeColors();
    applyThemeColors(DEFAULT_THEME_COLORS);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-md border border-border">
        <div className="flex min-h-16 items-center justify-between gap-4 bg-main px-4 py-3 text-font">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-complement text-font">
              <Palette className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Theme Customization</p>
              <p className="text-xs text-font/60">StudyHub theme preview</p>
            </div>
          </div>
          <div className="hidden h-10 w-28 overflow-hidden rounded-md border border-font/10 sm:grid sm:grid-cols-5">
            {THEME_COLOR_DEFINITIONS.map((definition) => (
              <span
                key={definition.key}
                style={{ backgroundColor: colors[definition.key] }}
              />
            ))}
          </div>
        </div>
        <div className="grid h-2 grid-cols-5">
          <div className="bg-main" />
          <div className="bg-secondary" />
          <div className="bg-third" />
          <div className="bg-font" />
          <div className="bg-complement" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {THEME_COLOR_DEFINITIONS.map((definition) => (
          <div
            key={definition.key}
            className="flex items-center justify-between gap-4 rounded-md border border-border bg-background/40 p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="size-10 shrink-0 rounded-md border border-border"
                style={{ backgroundColor: colors[definition.key] }}
              />
              <div className="min-w-0">
                <Label
                  htmlFor={`theme-${definition.key}`}
                  className="text-sm font-medium"
                >
                  {definition.label}
                </Label>
                <p className="truncate text-xs text-muted-foreground">
                  {definition.cssVar}
                </p>
              </div>
            </div>
            <input
              id={`theme-${definition.key}`}
              type="color"
              value={colors[definition.key]}
              onChange={(event) =>
                handleColorChange(definition.key, event.target.value)
              }
              className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={handleReset}>
          <RotateCcw className="size-4" />
          Restaurar padrão
        </Button>
      </div>
    </div>
  );
}
