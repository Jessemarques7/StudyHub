// // components/notes/NoteTitleInput.tsx
// import { useState, useCallback, useRef } from "react";

// interface NoteTitleInputProps {
//   value: string;
//   onChange: (value: string) => void;
//   onSave: () => void;
// }

// export function NoteTitleInput({
//   value,
//   onChange,
//   onSave,
// }: NoteTitleInputProps) {
//   // Guardamos o valor inicial apenas ao focar, para o "Escape" funcionar corretamente
//   const [snapshotValue, setSnapshotValue] = useState(value);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleFocus = useCallback(() => {
//     setSnapshotValue(value); // Tira uma "foto" do valor atual ao entrar
//   }, [value]);

//   const handleBlur = useCallback(() => {
//     onSave(); // Salva ao sair
//   }, [onSave]);

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent<HTMLInputElement>) => {
//       if (e.key === "Enter") {
//         e.currentTarget.blur(); // Dispara o onBlur -> onSave
//       } else if (e.key === "Escape") {
//         onChange(snapshotValue); // Reverte para o valor da "foto"
//         e.currentTarget.blur();
//       }
//     },
//     [snapshotValue, onChange]
//   );

//   return (
//     <textarea
//       ref={inputRef}
//       type="text"
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       onBlur={handleBlur}
//       onKeyDown={handleKeyDown}
//       onFocus={handleFocus}
//       placeholder="Untitled"
//       aria-label="Note title"
//       className="flex w-full px-[54px] focus:outline-none focus:ring-0  mt-10 mb-4 resize-none text-foreground text-3xl md:text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground focus:placeholder:text-gray-500 transition-colors"
//     />
//   );
// }

// components/notes/NoteTitleInput.tsx
import { useState, useCallback, useRef } from "react";

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

  // FIX 1: Change HTMLInputElement to HTMLTextAreaElement matches the <textarea> below
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = useCallback(() => {
    setSnapshotValue(value); // Tira uma "foto" do valor atual ao entrar
  }, [value]);

  const handleBlur = useCallback(() => {
    onSave(); // Salva ao sair
  }, [onSave]);

  const handleKeyDown = useCallback(
    // FIX 2: Update the event type to match the textarea
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur(); // Dispara o onBlur -> onSave
      } else if (e.key === "Escape") {
        onChange(snapshotValue); // Reverte para o valor da "foto"
        e.currentTarget.blur();
      }
    },
    [snapshotValue, onChange],
  );

  return (
    <textarea
      ref={inputRef}
      // FIX 3: Removed 'type="text"' as it is not a valid attribute for textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      placeholder="Untitled"
      aria-label="Note title"
      className="flex w-full px-[54px] focus:outline-none focus:ring-0  mt-10 mb-4 resize-none text-foreground text-3xl md:text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground focus:placeholder:text-gray-500 transition-colors"
    />
  );
}
