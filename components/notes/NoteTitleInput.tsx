// components/notes/NoteTitleInput.tsx
import { useState, useCallback, useRef, useEffect } from "react";

interface NoteTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export function NoteTitleInput({
  value,
  onChange,
  onSave,
}: NoteTitleInputProps) {
  // Guardamos o valor inicial apenas ao focar, para o "Escape" funcionar corretamente
  const [snapshotValue, setSnapshotValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    setSnapshotValue(value); // Tira uma "foto" do valor atual ao entrar
  }, [value]);

  const handleBlur = useCallback(() => {
    onSave(); // Salva ao sair
  }, [onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur(); // Dispara o onBlur -> onSave
      } else if (e.key === "Escape") {
        onChange(snapshotValue); // Reverte para o valor da "foto"
        e.currentTarget.blur();
      }
    },
    [snapshotValue, onChange]
  );

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      placeholder="Untitled"
      aria-label="Note title"
      className="w-full px-[54px] mt-10 mb-4 text-foreground text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground focus:placeholder:text-gray-500 transition-colors"
    />
  );
}
