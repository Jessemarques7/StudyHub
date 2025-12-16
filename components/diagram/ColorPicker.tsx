"use client";

const COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#b1b1b7", // Default Gray
];

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
  className?: string;
}

export default function ColorPicker({
  onColorSelect,
  className,
}: ColorPickerProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {COLORS.map((color) => (
        <button
          key={color}
          className="w-6 h-6 rounded-full border border-slate-600 hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
          onClick={(e) => {
            e.stopPropagation(); // Evita selecionar o node/edge ao clicar na cor
            onColorSelect(color);
          }}
        />
      ))}
    </div>
  );
}
