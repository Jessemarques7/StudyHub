import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Smile, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_ICON_FILE_SIZE, Note } from "@/types/notes";
import { CoverPicker } from "./NotePickers";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface NoteHeaderProps {
  note: Note;
  onIconUpdate: (icon: string | null) => void;
  onCoverUpdate: (coverImage: string | null) => void;
}

function isImageValue(value: string) {
  return value.startsWith("data:") || value.startsWith("http");
}

export function NoteHeader({
  note,
  onIconUpdate,
  onCoverUpdate,
}: NoteHeaderProps) {
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const iconUploadRef = useRef<HTMLInputElement>(null);
  const hasIcon = Boolean(note.icon);

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ICON_FILE_SIZE) {
      alert(
        `File is too large. Maximum size is ${MAX_ICON_FILE_SIZE / 1024}KB.`,
      );
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onIconUpdate(reader.result as string);
    };
    reader.onerror = () => {
      alert("Error reading file. Please try again.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleEmojiSelect = (emojiData: { emoji: string }) => {
    onIconUpdate(emojiData.emoji);
    setEmojiPickerVisible(false);
  };

  const renderIcon = () => {
    if (!note.icon) return null;

    if (isImageValue(note.icon)) {
      return (
        <img
          src={note.icon}
          alt="Note icon"
          className="h-20 w-20 rounded-md object-cover"
        />
      );
    }

    return <span className="text-7xl leading-none">{note.icon}</span>;
  };

  const iconTools = (
    <div className="relative flex items-center gap-1">
      <Button
        type="button"
        size="xs"
        variant="ghost"
        className="h-7 px-2 text-font/60 hover:bg-third/60 hover:text-font"
        onClick={() => setEmojiPickerVisible((prev) => !prev)}
      >
        <Smile className="h-4 w-4" />
        <span>{hasIcon ? "Change icon" : "Add icon"}</span>
      </Button>

      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        className="text-font/60 hover:bg-third/60 hover:text-font"
        onClick={() => iconUploadRef.current?.click()}
        aria-label="Upload icon"
      >
        <Upload className="h-3.5 w-3.5" />
      </Button>

      {hasIcon && (
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          className="text-font/50 hover:bg-third/60 hover:text-red-400"
          onClick={() => onIconUpdate(null)}
          aria-label="Remove icon"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}

      {emojiPickerVisible && (
        <div className="fixed left-4 right-4 top-20 z-[70] sm:absolute sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:w-[350px]">
          <EmojiPicker
            style={
              {
                width: "100%",
                "--epr-bg-color": "var(--color-third)",
                "--epr-category-label-bg-color": "var(--color-secondary)",
                "--epr-search-bg-color": "var(--color-secondary)",
                "--epr-search-text-color": "var(--color-font)",
                "--epr-emoji-hover-bg-color": "var(--color-secondary)",
                "--epr-scrollbar-bg-color": "var(--color-secondary)",
                "--epr-scrollbar-thumb-bg-color": "var(--color-complement)",
              } as React.CSSProperties
            }
            theme={"dark" as never}
            onEmojiClick={handleEmojiSelect}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="px-8 mb-1">
      {hasIcon && (
        <div
          className={cn(
            "group/icon relative z-10 mb-3 flex  items-end gap-2",
            note.coverImage && "-mt-16",
          )}
        >
          <button
            type="button"
            onClick={() => setEmojiPickerVisible((prev) => !prev)}
            className="rounded-md p-1 transition-colors hover:bg-third/50"
            aria-label="Change icon"
          >
            {renderIcon()}
          </button>
          <div className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover/icon:opacity-100">
            {iconTools}
          </div>
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-1 text-sm text-font/60">
        {!hasIcon && iconTools}
        <CoverPicker
          currentCover={note.coverImage}
          onSelect={onCoverUpdate}
          onRemove={() => onCoverUpdate(null)}
        />
      </div>

      <input
        type="file"
        ref={iconUploadRef}
        accept="image/*,.svg"
        onChange={handleIconUpload}
        className="hidden"
      />
    </div>
  );
}

export function NoteCover({ note }: { note: Note }) {
  if (!note.coverImage) return null;

  const cover = note.coverImage;

  if (isImageValue(cover)) {
    return (
      <div className="h-[clamp(10rem,28vh,18rem)] w-full overflow-hidden bg-third">
        <img
          src={cover}
          alt="Note cover"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (cover.startsWith("bg-") || cover.startsWith("from-")) {
    return (
      <div className="h-[clamp(10rem,28vh,18rem)] w-full overflow-hidden bg-third">
        <div className={cn("h-full w-full", cover)} />
      </div>
    );
  }

  return (
    <div
      className="h-[clamp(10rem,28vh,18rem)] w-full overflow-hidden bg-third"
      style={{ background: cover }}
    />
  );
}
