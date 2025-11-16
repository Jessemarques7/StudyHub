"use client";

import React, { useState } from "react";
import { X, Image, Smile } from "lucide-react";

interface IconPickerProps {
  currentIcon: string | null;
  onSelect: (icon: string) => void;
  onRemove: () => void;
}

export function IconPicker({
  currentIcon,
  onSelect,
  onRemove,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const emojiCategories = {
    Smileys: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
    ],
    Animals: [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐸",
      "🐵",
      "🐔",
    ],
    Nature: [
      "🌸",
      "🌺",
      "🌻",
      "🌷",
      "🌹",
      "🥀",
      "🌿",
      "🍀",
      "🌾",
      "🌱",
      "🌲",
      "🌳",
      "🌴",
      "🌵",
      "🎋",
      "🎍",
    ],
    Food: [
      "🍎",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🥑",
    ],
    Activities: [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
    ],
    Objects: [
      "💻",
      "📱",
      "⌚",
      "📷",
      "📹",
      "🎥",
      "📞",
      "☎️",
      "📺",
      "📻",
      "🎙️",
      "🎚️",
      "🎛️",
      "🧭",
      "⏰",
      "⏱️",
    ],
    Symbols: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
    ],
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-slate-800 rounded-md transition-colors"
      >
        <Smile className="w-4 h-4" />
        {currentIcon ? (
          <span className="text-2xl">{currentIcon}</span>
        ) : (
          <span>Add icon</span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-200">
                Select Icon
              </h3>
              <div className="flex gap-2">
                {currentIcon && (
                  <button
                    onClick={() => {
                      onRemove();
                      setIsOpen(false);
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category} className="mb-4">
                <h4 className="text-xs font-medium text-gray-400 mb-2">
                  {category}
                </h4>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onSelect(emoji);
                        setIsOpen(false);
                      }}
                      className="text-2xl hover:bg-slate-700 rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface CoverPickerProps {
  currentCover: string | null;
  onSelect: (cover: string) => void;
  onRemove: () => void;
}

export function CoverPicker({
  currentCover,
  onSelect,
  onRemove,
}: CoverPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)",
    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  ];

  const solidColors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      onSelect(customUrl.trim());
      setCustomUrl("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-slate-800 rounded-md transition-colors"
      >
        <Image className="w-4 h-4" />
        <span>{currentCover ? "Change cover" : "Add cover"}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-4 max-h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-200">
                Select Cover
              </h3>
              <div className="flex gap-2">
                {currentCover && (
                  <button
                    onClick={() => {
                      onRemove();
                      setIsOpen(false);
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-400 mb-2 block">
                Custom Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && handleCustomUrl()}
                />
                <button
                  onClick={handleCustomUrl}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-400 mb-2">
                Gradients
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {gradients.map((gradient, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSelect(gradient);
                      setIsOpen(false);
                    }}
                    className="h-16 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all"
                    style={{ background: gradient }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-2">Colors</h4>
              <div className="grid grid-cols-9 gap-2">
                {solidColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onSelect(color);
                      setIsOpen(false);
                    }}
                    className="h-10 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
