export type ThemeColorKey =
  | "main"
  | "secondary"
  | "third"
  | "complement"
  | "font";

export type ThemeColors = Record<ThemeColorKey, string>;

export const THEME_STORAGE_KEY = "studyhub-theme-colors";

export const DEFAULT_THEME_COLORS: ThemeColors = {
  main: "#1e1e1e",
  secondary: "#242424",
  third: "#2a2a2a",
  complement: "#a882ff",
  font: "#dcddde",
};

export const THEME_COLOR_DEFINITIONS: Array<{
  key: ThemeColorKey;
  label: string;
  cssVar: `--color-${string}`;
  sourceVar: `--theme-${string}`;
}> = [
  {
    key: "main",
    label: "Main",
    cssVar: "--color-main",
    sourceVar: "--theme-main",
  },
  {
    key: "font",
    label: "Font color",
    cssVar: "--color-font",
    sourceVar: "--theme-font",
  },
  {
    key: "secondary",
    label: "Secondary",
    cssVar: "--color-secondary",
    sourceVar: "--theme-secondary",
  },
  {
    key: "complement",
    label: "Complement Color",
    cssVar: "--color-complement",
    sourceVar: "--theme-complement",
  },
  {
    key: "third",
    label: "Third color",
    cssVar: "--color-third",
    sourceVar: "--theme-third",
  },
];

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function normalizeThemeColors(
  colors: Partial<Record<ThemeColorKey, string>> = {},
): ThemeColors {
  return THEME_COLOR_DEFINITIONS.reduce<ThemeColors>((acc, definition) => {
    const value = colors[definition.key];
    acc[definition.key] =
      typeof value === "string" && HEX_COLOR_PATTERN.test(value)
        ? value
        : DEFAULT_THEME_COLORS[definition.key];
    return acc;
  }, {} as ThemeColors);
}

export function applyThemeColors(colors: Partial<ThemeColors>) {
  if (typeof document === "undefined") return;

  const normalizedColors = normalizeThemeColors(colors);
  const root = document.documentElement;

  THEME_COLOR_DEFINITIONS.forEach((definition) => {
    const value = normalizedColors[definition.key];
    root.style.setProperty(definition.cssVar, value);
    root.style.setProperty(definition.sourceVar, value);
  });

  window.dispatchEvent(
    new CustomEvent("studyhub-theme-change", { detail: normalizedColors }),
  );
}
