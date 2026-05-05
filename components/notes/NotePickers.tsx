"use client";
import { useState, useRef } from "react";
import { X, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_COVER_FILE_SIZE } from "@/types/notes";

interface CoverPickerProps {
  currentCover: string | null;
  onSelect: (cover: string) => void;
  onRemove: () => void;
}

const GRADIENT_PRESETS = [
  "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500",
  "bg-gradient-to-r from-green-300 via-blue-500 to-purple-600",
  "bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400",
  "bg-gradient-to-r from-gray-700 via-gray-900 to-black",
  "bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100",
  "bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-500",
  "bg-gradient-to-r from-yellow-200 via-green-200 to-green-500",
  "bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600",
  "bg-gradient-to-r from-red-200 via-red-300 to-yellow-200",
  "bg-gradient-to-r from-green-200 via-green-300 to-blue-500",
  "bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-700",
  "bg-gradient-to-r from-green-200 via-green-400 to-purple-700",
  "bg-gradient-to-r from-red-200 to-red-600",
  "bg-gradient-to-r from-green-300 via-yellow-300 to-pink-300",
  "bg-gradient-to-r from-indigo-300 to-purple-400",
  "bg-gradient-to-r from-green-200 to-green-500",
  "bg-gradient-to-r from-purple-200 via-purple-400 to-purple-800",
  "bg-gradient-to-r from-gray-400 via-gray-600 to-blue-800",
  "bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500",
  "bg-gradient-to-r from-green-200 via-green-400 to-green-500",
  "bg-gradient-to-r from-purple-400 to-yellow-400",
  "bg-gradient-to-r from-red-400 via-gray-300 to-blue-500",
  "bg-gradient-to-r from-red-800 via-yellow-600 to-yellow-500",
  "bg-gradient-to-r from-yellow-200 to-yellow-500",
  "bg-gradient-to-r from-blue-300 via-green-200 to-yellow-300",
  "bg-gradient-to-r from-yellow-200 via-green-200 to-green-300",
  "bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400",
  "bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900",
  "bg-gradient-to-r from-green-300 to-purple-400",
  "bg-gradient-to-r from-yellow-200 via-pink-200 to-pink-400",
  "bg-gradient-to-r from-pink-400 to-pink-600",
  "bg-gradient-to-r from-yellow-600 to-red-600",
  "bg-gradient-to-r from-green-500 to-green-700",
  "bg-gradient-to-r from-red-500 to-green-500",
  "bg-gradient-to-r from-orange-600 to-orange-500",
  "bg-gradient-to-r from-lime-600 via-yellow-300 to-red-600",
  "bg-gradient-to-r from-rose-700 to-pink-600",
  "bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500",
  "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900",
  "bg-gradient-to-r from-sky-400 via-rose-400 to-lime-400",
  "bg-gradient-to-r from-blue-500 to-blue-600",
  "bg-gradient-to-r from-rose-100 to-teal-100",
  "bg-gradient-to-b from-sky-400 to-sky-200",
  "bg-gradient-to-b from-orange-500 to-yellow-300",
  "bg-gradient-to-r from-rose-400 to-orange-300",
  "bg-gradient-to-b from-gray-900 to-gray-600",
  "bg-gradient-to-r from-teal-200 to-lime-200",
  "bg-gradient-to-r from-fuchsia-500 via-red-600 to-orange-400",
  "bg-gradient-to-r from-sky-400 to-blue-500",
  "bg-gradient-to-r from-cyan-200 to-cyan-400",
  "bg-gradient-to-r from-sky-400 to-cyan-300",
  "bg-gradient-to-r from-red-500 to-red-800",
  "bg-gradient-to-r from-rose-500 via-red-400 to-red-500",
  "bg-gradient-to-r from-violet-300 to-violet-400",
  "bg-gradient-to-r from-orange-300 to-rose-300",
  "bg-gradient-to-r from-fuchsia-600 to-pink-600",
  "bg-gradient-to-r from-slate-500 to-yellow-100",
  "bg-gradient-to-r from-emerald-500 to-lime-600",
  "bg-gradient-to-r from-rose-300 to-rose-500",
  "bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800",
  "bg-gradient-to-r from-gray-100 to-gray-300",
  "bg-gradient-to-r from-orange-400 to-rose-400",
  "bg-gradient-to-r from-blue-400 to-emerald-400",
  "bg-gradient-to-bl from-indigo-900 via-indigo-400 to-indigo-900",
  "bg-gradient-to-r from-yellow-400 via-gray-50 to-teal-300",
  "bg-gradient-to-tr from-violet-500 to-orange-300",
  "bg-gradient-to-t from-orange-400 to-sky-400",
  "bg-gradient-to-b from-gray-900 via-purple-900 to-violet-600",
];

type TabType = "gallery" | "upload" | "link";

export function CoverPicker({
  currentCover,
  onSelect,
  onRemove,
}: CoverPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<TabType>("gallery");
  const [customUrl, setCustomUrl] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setIsOpen(false);
    setCustomUrl("");
  };

  const handleCustomUrl = () => {
    const trimmedUrl = customUrl.trim();
    if (!trimmedUrl) return;

    onSelect(trimmedUrl);
    handleClose();
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_COVER_FILE_SIZE) {
      alert(
        `File is too large. Maximum size is ${
          MAX_COVER_FILE_SIZE / (1024 * 1024)
        }MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onSelect(reader.result as string);
      handleClose();
    };
    reader.onerror = () => {
      alert("Error reading file. Please try again.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleGradientSelect = (gradient: string) => {
    onSelect(gradient);
    handleClose();
  };

  const handleRemove = () => {
    onRemove();
    handleClose();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md bg-third/50 px-3 py-1.5 text-sm text-font/80 transition-colors hover:bg-third/70"
      >
        <Image className="w-4 h-4" />
        <span>{currentCover ? "Change cover" : "Add cover"}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose} />

          <div className="absolute right-0 top-full z-50 mt-2 max-h-[500px] w-96 overflow-y-auto rounded-lg border border-border bg-secondary p-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-font">
                Select Cover
              </h3>
              <div className="flex gap-2">
                {currentCover && (
                  <button
                    onClick={handleRemove}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="text-font/60 hover:text-font"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex gap-2 border-b border-border">
              {(["gallery", "upload", "link"] as TabType[]).map((tabName) => (
                <button
                  key={tabName}
                  onClick={() => setTab(tabName)}
                  className={cn(
                    "text-sm px-4 py-2 capitalize",
                    tab === tabName
                      ? "border-b-2 border-complement text-font"
                      : "text-font/60 hover:text-font"
                  )}
                >
                  {tabName}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {tab === "gallery" && (
              <div className="mb-4">
                <h4 className="mb-2 text-xs font-medium text-font/60">
                  Gradients
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {GRADIENT_PRESETS.map((gradient, index) => (
                    <button
                      key={index}
                      onClick={() => handleGradientSelect(gradient)}
                      className={cn(
                        "h-16 rounded-lg border-2 border-transparent transition-all hover:border-complement",
                        gradient
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {tab === "upload" && (
              <div className="p-2">
                <label className="mb-2 block text-xs font-medium text-font/60">
                  Upload an image (max {MAX_COVER_FILE_SIZE / (1024 * 1024)}MB)
                </label>
                <input
                  ref={uploadRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="text-sm text-font/80 file:mr-2 file:rounded file:border-0 file:bg-complement file:px-2 file:py-1 file:text-xs file:font-semibold file:text-font hover:file:bg-complement/90"
                />
              </div>
            )}

            {tab === "link" && (
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-font/60">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 rounded border border-border bg-third px-3 py-2 text-sm text-font placeholder:text-muted-foreground focus:border-complement focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleCustomUrl()}
                  />
                  <button
                    onClick={handleCustomUrl}
                    className="rounded bg-complement px-3 py-2 text-sm text-font transition-colors hover:bg-complement/90"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
