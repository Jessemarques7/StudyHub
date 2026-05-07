import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Note, MAX_ICON_FILE_SIZE } from "@/types/notes";
import { cn } from "@/lib/utils";
import { Smile, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverPicker } from "./NotePickers";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface NoteHeaderProps {
  note: Note;
  onIconUpdate: (icon: string | null) => void;
  onCoverUpdate: (coverImage: string | null) => void;
}

export function NoteHeader({
  note,
  onIconUpdate,
  onCoverUpdate,
}: NoteHeaderProps) {
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const iconUploadRef = useRef<HTMLInputElement>(null);
  const hasCover = Boolean(note.coverImage);
  const hasIcon = Boolean(note.icon);

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ICON_FILE_SIZE) {
      alert(
        `File is too large. Maximum size is ${MAX_ICON_FILE_SIZE / 1024}KB.`,
      );
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

  const renderCover = () => {
    if (!note.coverImage) return null;

    const cover = note.coverImage;

    if (cover.startsWith("http") || cover.startsWith("data:")) {
      return (
        <img
          src={cover}
          alt="Note cover"
          className="h-full w-full object-cover"
        />
      );
    }

    if (cover.startsWith("bg-") || cover.startsWith("from-")) {
      return <div className={cn("h-full w-full", cover)} />;
    }

    return <div className="h-full w-full" style={{ background: cover }} />;
  };

  const renderIcon = () => {
    if (!note.icon) return null;

    if (note.icon.startsWith("data:") || note.icon.startsWith("http")) {
      return (
        <img
          src={note.icon}
          alt="Note icon"
          className="h-16 w-16 rounded object-cover"
        />
      );
    }

    return <span className="text-6xl leading-none">{note.icon}</span>;
  };

  const renderIconTools = () => (
    <div className="relative flex gap-1">
      <Button
        size="icon-sm"
        variant="outline"
        className="border-border  hover:bg-third/70"
        onClick={() => setEmojiPickerVisible((prev) => !prev)}
        aria-label="Choose icon"
      >
        <Smile className="h-4 w-4" />
      </Button>

      <Button
        size="icon-sm"
        variant="outline"
        className="border-border  hover:bg-third/70"
        onClick={() => iconUploadRef.current?.click()}
        aria-label="Upload icon"
      >
        <Upload className="h-4 w-4" />
      </Button>

      {hasIcon && (
        <Button
          size="icon-sm"
          variant="outline"
          className="border-border bg-third/50 text-red-400 hover:bg-third/70 hover:text-red-400"
          onClick={() => onIconUpdate(null)}
          aria-label="Remove icon"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {emojiPickerVisible && (
        <div className="absolute left-0 top-full z-50 mt-2">
          <EmojiPicker
            style={
              {
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
    <>
      <div
        className={cn("group relative w-full", hasCover ? "h-[25vh]" : "h-16")}
      >
        {renderCover()}

        <div
          className={cn(
            "flex w-full opacity-0 hover:opacity-100 justify-center pr-124 pt-22 gap-2 transition-opacity",
            hasCover
              ? "flex w-full opacity-0 hover:opacity-100 justify-center pr-124 pt-22 gap-2 transition-opacity"
              : "",
          )}
        >
          {!hasIcon && renderIconTools()}
          <CoverPicker
            currentCover={note.coverImage}
            onSelect={onCoverUpdate}
            onRemove={() => onCoverUpdate(null)}
          />
        </div>

        {hasIcon && (
          <div className="pointer-events-none absolute bottom-0 left-0 flex h-full w-full justify-center p-2 md:px-10">
            <div className="relative h-full w-full max-w-[770px]">
              <div className="pointer-events-auto absolute bottom-0 left-[10px] z-50 flex translate-y-1/2 items-end gap-2 md:left-[54px]">
                <button
                  onClick={() => setEmojiPickerVisible((prev) => !prev)}
                  className="cursor-pointer rounded-lg p-1 transition-colors hover:bg-third/40"
                  aria-label="Change icon"
                >
                  {renderIcon()}
                </button>

                <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                  {renderIconTools()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={iconUploadRef}
        accept="image/*,.svg"
        onChange={handleIconUpload}
        className="hidden"
      />
    </>
  );
}
