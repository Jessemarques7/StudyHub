import { useState, useRef } from "react";
import { Note, MAX_ICON_FILE_SIZE } from "@/types/notes";
import { cn } from "@/lib/utils";
import { Smile, Upload, X } from "lucide-react";
import { Button } from "@/components/notes/ui/button";
import EmojiPicker from "emoji-picker-react";
import { CoverPicker } from "./NotePickers";

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

  const handleIconRemove = () => {
    onIconUpdate(null);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ICON_FILE_SIZE) {
      alert(
        `File is too large. Maximum size is ${MAX_ICON_FILE_SIZE / 1024}KB.`
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
    e.target.value = "";
  };

  const handleEmojiSelect = (emojiData: { emoji: string }) => {
    onIconUpdate(emojiData.emoji);
    setEmojiPickerVisible(false);
  };

  const renderCover = () => {
    if (!note.coverImage) {
      return <div className="w-full h-full bg-slate-800" />;
    }

    const cover = note.coverImage;

    // URL de imagem
    if (cover.startsWith("http") || cover.startsWith("data:")) {
      return (
        <img
          src={cover}
          alt="Note cover"
          className="w-full h-full object-cover"
        />
      );
    }

    // Classe Tailwind
    if (cover.startsWith("bg-") || cover.startsWith("from-")) {
      return <div className={cn("w-full h-full", cover)} />;
    }

    // CSS customizado
    return <div className="w-full h-full" style={{ background: cover }} />;
  };

  const renderIcon = () => {
    if (!note.icon) {
      return <Smile className="w-16 h-16 text-slate-600 p-2" />;
    }

    // Imagem
    if (note.icon.startsWith("data:")) {
      return (
        <img
          src={note.icon}
          alt="Note icon"
          className="w-16 h-16 object-cover rounded"
        />
      );
    }

    // Emoji
    return <span className="text-6xl">{note.icon}</span>;
  };

  return (
    <>
      {/* Cover Section */}
      <div className="h-[25vh] group relative">
        {renderCover()}
        <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <CoverPicker
            currentCover={note.coverImage}
            onSelect={onCoverUpdate}
            onRemove={() => onCoverUpdate(null)}
          />
        </div>
      </div>

      {/* Icon Section */}
      <div
        className="absolute ml-12 group z-50"
        style={{ top: "calc(25vh - 40px)" }}
      >
        <div className="relative flex items-end gap-2">
          <button
            onClick={() => setEmojiPickerVisible((prev) => !prev)}
            className="cursor-pointer rounded-lg p-1 transition-colors "
            aria-label="Change icon"
          >
            {renderIcon()}
          </button>

          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon-sm"
              variant="outline"
              className="bg-black/50 hover:bg-black/70 border-slate-700"
              onClick={() => iconUploadRef.current?.click()}
              aria-label="Upload icon"
            >
              <Upload className="w-4 h-4" />
            </Button>

            {note.icon && (
              <Button
                size="icon-sm"
                variant="outline"
                className="bg-black/50 hover:bg-black/70 border-slate-700 text-red-400 hover:text-red-400"
                onClick={handleIconRemove}
                aria-label="Remove icon"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <input
            type="file"
            ref={iconUploadRef}
            accept="image/*,.svg"
            onChange={handleIconUpload}
            className="hidden"
          />

          {emojiPickerVisible && (
            <div className="absolute top-full mt-2 z-50">
              <EmojiPicker theme="dark" onEmojiClick={handleEmojiSelect} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
