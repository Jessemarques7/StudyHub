import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/flashcards/ui/button";
import { Bold, Italic, Underline, Image, Mic, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/flashcards/ui/popover";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => void;
  onAudioUpload?: (file: File) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  onImageUpload,
  onAudioUpload,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize content only once
  useEffect(() => {
    if (editorRef.current && !isInitialized && value) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const applyColor = (color: string) => {
    applyFormat("foreColor", color);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAudioUpload) {
      onAudioUpload(file);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="flex gap-1 p-2 border-b border-border bg-muted/20">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("bold")}
          className="h-8 w-8"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("italic")}
          className="h-8 w-8"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("underline")}
          className="h-8 w-8"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="grid grid-cols-5 gap-2">
              {[
                "#000000",
                "#FF0000",
                "#00FF00",
                "#0000FF",
                "#FFFF00",
                "#FF00FF",
                "#00FFFF",
                "#FFA500",
                "#800080",
                "#008000",
                "#FFC0CB",
                "#A52A2A",
                "#808080",
                "#FFFFFF",
                "#FFD700",
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => applyColor(color)}
                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  aria-label={`Set text color to ${color}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {onImageUpload && (
          <>
            <div className="w-px bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => imageInputRef.current?.click()}
              className="h-8 w-8"
            >
              <Image className="h-4 w-4" />
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </>
        )}
        {onAudioUpload && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => audioInputRef.current?.click()}
              className="h-8 w-8"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleAudioSelect}
            />
          </>
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        onInput={handleInput}
        className={cn(
          "min-h-[120px] p-4 outline-none prose prose-invert max-w-none",
          !value &&
            "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        )}
        data-placeholder={placeholder}
        style={{ direction: "ltr", textAlign: "left", unicodeBidi: "embed" }}
        suppressContentEditableWarning
      />
    </div>
  );
}
