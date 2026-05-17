// components/notes/NoteTitleInput.tsx
import { useCallback, useLayoutEffect, useRef, useState } from "react";

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
  const [snapshotValue, setSnapshotValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const resizeTitle = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    if (inputRef.current) resizeTitle(inputRef.current);
  }, [resizeTitle, value]);

  useLayoutEffect(() => {
    const textarea = inputRef.current;
    const parent = textarea?.parentElement;

    if (!textarea || !parent) return;

    const resizeObserver = new ResizeObserver(() => {
      resizeTitle(textarea);
    });

    resizeObserver.observe(parent);

    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeTitle]);

  const handleFocus = useCallback(() => {
    setSnapshotValue(value);
  }, [value]);

  const handleBlur = useCallback(() => {
    onSave();
  }, [onSave]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
      resizeTitle(event.currentTarget);
    },
    [onChange, resizeTitle],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        onChange(snapshotValue);
        e.currentTarget.blur();
      }
    },
    [snapshotValue, onChange],
  );

  return (
    <textarea
      ref={inputRef}
      rows={1}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      placeholder="Untitled"
      aria-label="Note title"
      className="mb-4 block min-h-[2.9rem] w-full resize-none overflow-hidden border-none bg-transparent px-3 py-0.5 text-[2rem] font-bold leading-[1.18] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:placeholder:text-gray-500 md:min-h-[3.2rem] md:px-13 md:text-[2.5rem]"
    />
  );
}
