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
  const [isEditing, setIsEditing] = useState(false);
  const [initialValue, setInitialValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInitialValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    onSave();
  }, [onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        onChange(initialValue);
        setIsEditing(false);
        e.currentTarget.blur();
      }
    },
    [initialValue, onChange]
  );

  const handleFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      placeholder="Untitled"
      aria-label="Note title"
      className="w-full px-[54px] mt-10 mb-4 text-gray-50 text-5xl font-bold bg-transparent border-none outline-none placeholder:text-gray-400 focus:placeholder:text-gray-500 transition-colors"
    />
  );
}
