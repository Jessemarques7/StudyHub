"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Plus,
  Check,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Edit2,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorageState";
import { ProgressRing } from "@/components/ui/ProgressRing";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";

// --- Types ---
type Habit = {
  id: number;
  name: string;
  icon: string;
  completedDates: Record<string, boolean>;
};

type TabType = "emoji" | "upload" | "link";

// --- Helpers ---
const toDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isImageUrl = (str: string) => {
  return str.startsWith("http") || str.startsWith("data:image");
};

const calculateStreaks = (completedDates: Record<string, boolean>) => {
  if (!completedDates) return { current: 0, max: 0 };

  let current = 0;
  const d = new Date();
  while (completedDates[toDateString(d)]) {
    current++;
    d.setDate(d.getDate() - 1);
  }

  const dates = Object.keys(completedDates)
    .filter((k) => completedDates[k])
    .sort();

  let max = 0;
  let tempMax = 0;
  let prevDate: Date | null = null;

  for (const dateStr of dates) {
    const currDate = new Date(`${dateStr}T00:00:00`);
    if (!prevDate) {
      tempMax = 1;
    } else {
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays === 1) tempMax++;
      else tempMax = 1;
    }
    max = Math.max(max, tempMax);
    prevDate = currDate;
  }

  return { current, max: Math.max(max, current) };
};

// --- Custom Icon Picker (Using React Portal + Dynamic Positioning) ---
function HabitIconPicker({
  currentIcon,
  onSelect,
  onRemove,
  children,
}: {
  currentIcon: string;
  onSelect: (icon: string) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<TabType>("emoji");
  const [customUrl, setCustomUrl] = useState("");
  const [rect, setRect] = useState<DOMRect | null>(null);

  const uploadRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = () => {
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
    setIsOpen(true);
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
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

  // Ensure picker doesn't go off the bottom of the screen
  const POPUP_HEIGHT = 480;
  const topPos = rect
    ? rect.bottom + POPUP_HEIGHT > window.innerHeight
      ? rect.top - POPUP_HEIGHT - 8
      : rect.bottom + 8
    : 0;

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[999]">
      {/* Invisible backdrop to catch clicks outside the popover */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Positioned Popover Modal */}
      <div
        className="absolute bg-slate-900 border border-slate-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4 w-full max-w-[340px] animate-in fade-in zoom-in-95 duration-200 custom-emoji-theme"
        style={{
          top: topPos,
          left: rect ? rect.left : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-200">
            Escolher Ícone
          </h3>
          <div className="flex items-center gap-3">
            {currentIcon !== "🎯" && (
              <button
                onClick={() => {
                  onRemove();
                  handleClose();
                }}
                className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Remover
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-200 p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-slate-700">
          {(["emoji", "upload", "link"] as TabType[]).map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={cn(
                "text-sm px-4 py-2 capitalize transition-colors",
                tab === tabName
                  ? "border-b-2 border-blue-500 text-gray-200 font-medium"
                  : "text-gray-400 hover:text-gray-200",
              )}
            >
              {tabName}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "emoji" && (
          <div className="mb-2 w-full rounded-lg overflow-hidden flex justify-center custom-emoji-picker-container">
            <EmojiPicker
              theme={Theme.DARK}
              onEmojiClick={(emojiData) => {
                onSelect(emojiData.emoji);
                handleClose();
              }}
              width="100%"
              height={350}
            />
          </div>
        )}

        {tab === "upload" && (
          <div className="p-2">
            <label className="text-xs font-medium text-gray-400 mb-2 block">
              Envie uma imagem (máx 5MB)
            </label>
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="text-sm text-gray-300 w-full file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
            />
          </div>
        )}

        {tab === "link" && (
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-400 mb-2 block">
              URL da Imagem
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://exemplo.com/icone.png"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleCustomUrl()}
              />
              <button
                onClick={handleCustomUrl}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors font-medium"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div ref={triggerRef} onClick={handleOpen} className="cursor-pointer">
        {children}
      </div>
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}

// --- Constants ---
const DAYS_IN_VIEW = 7;
const HABITS_INITIAL: Habit[] = [
  {
    id: 1,
    name: "Estudar Programação",
    icon: "💻",
    completedDates: { [toDateString(new Date())]: true },
  },
  {
    id: 2,
    name: "Beber 4l de água",
    icon: "💧",
    completedDates: {},
  },
];

export default function App() {
  const [habits, setHabits] = useLocalStorage<Habit[]>(
    "studyhub_habits_v3",
    HABITS_INITIAL,
  );

  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // --- Calendar Logic ---
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();

    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    const currentDayOfWeek = today.getDay();

    // Simply subtract the currentDayOfWeek to get back to Sunday
    const thisSunday = new Date(today);
    thisSunday.setDate(today.getDate() - currentDayOfWeek + weekOffset * 7);

    for (let i = 0; i < DAYS_IN_VIEW; i++) {
      const d = new Date(thisSunday);
      d.setDate(thisSunday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    if (weekOffset === 0) return "Semana Atual";
    if (weekOffset === -1) return "Semana Passada";

    const start = calendarDays[0];
    const end = calendarDays[6];
    const startStr = `${start.getDate()} ${start.toLocaleString("pt-BR", {
      month: "short",
    })}`;
    const endStr = `${end.getDate()} ${end.toLocaleString("pt-BR", {
      month: "short",
    })}`;
    return `${startStr} - ${endStr}`;
  }, [weekOffset, calendarDays]);

  // --- Functional Graph Data ---
  const chartData = useMemo(() => {
    return calendarDays.map((date) => {
      const dateStr = toDateString(date);
      const totalHabits = habits.length;
      const completedHabits = habits.filter(
        (h) => h.completedDates?.[dateStr],
      ).length;
      const progress =
        totalHabits === 0
          ? 0
          : Math.round((completedHabits / totalHabits) * 100);

      return {
        day: date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        progress,
      };
    });
  }, [habits, calendarDays]);

  const thisWeekProgress = useMemo(() => {
    const totalPossible = habits.length * DAYS_IN_VIEW;
    let totalDone = 0;

    habits.forEach((h) => {
      calendarDays.forEach((day) => {
        if (h.completedDates?.[toDateString(day)]) totalDone++;
      });
    });

    return totalPossible === 0
      ? 0
      : Math.round((totalDone / totalPossible) * 100);
  }, [habits, calendarDays]);

  // --- Actions ---
  const toggleHabit = (habitId: number, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const newDates = { ...(h.completedDates || {}) };
          if (newDates[dateStr]) {
            delete newDates[dateStr];
          } else {
            newDates[dateStr] = true;
          }
          return { ...h, completedDates: newDates };
        }
        return h;
      }),
    );
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now(),
      name: newHabitName.trim(),
      icon: "🎯",
      completedDates: {},
    };

    setHabits((prev) => [...prev, newHabit]);
    setNewHabitName("");
    setIsAdding(false);
  };

  const handleDeleteHabit = (habitId: number) => {
    if (confirm("Tem certeza que deseja remover este hábito?")) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
    }
  };

  const handleSaveEdit = (habitId: number) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, name: editName.trim() } : h)),
    );
    setEditingId(null);
  };

  const handleIconChange = (habitId: number, newIcon: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, icon: newIcon } : h)),
    );
  };

  const getOverallProgress = (completedDates: Record<string, boolean>) => {
    if (!completedDates) return 0;
    let doneInView = 0;
    calendarDays.forEach((day) => {
      if (completedDates[toDateString(day)]) doneInView++;
    });
    return Math.round((doneInView / DAYS_IN_VIEW) * 100);
  };

  return (
    <div className="min-h-screen mt-24 bg-background text-zinc-100 font-sans selection:bg-blue-500/30 pb-20">
      {/* Global override to style the React Emoji Picker */}
      <style>{`
        .custom-emoji-theme .EmojiPickerReact {
          --epr-bg-color: #0f172a !important; /* Tailwind slate-900 */
          --epr-category-label-bg-color: #0f172a !important;
          border: none !important;
        }
      `}</style>

      <main className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Overall Progress Chart */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Progresso da Semana</h2>
          </div>

          <div className="relative bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ left: -20, top: 10, right: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorProgress"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#27272a"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#3f3f46",
                      color: "#fff",
                      borderRadius: "12px",
                    }}
                    itemStyle={{ color: "#2563eb" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="progress"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorProgress)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Habit Grid */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Grade de Hábitos
            </h2>

            {/* Pagination Controls */}
            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-full px-2 py-1">
              <button
                onClick={() => setWeekOffset((p) => p - 1)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-semibold text-zinc-300 w-32 text-center capitalize">
                {weekLabel}
              </span>
              <button
                onClick={() => setWeekOffset((p) => p + 1)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              >
                <ChevronRight size={18} />
              </button>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-400 ml-2 mr-2 transition-colors uppercase"
                >
                  Hoje
                </button>
              )}
            </div>

            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <Plus size={16} /> Adicionar Hábito
              </button>
            )}
          </div>

          {/* Add Habit Form */}
          {isAdding && (
            <form
              onSubmit={handleAddHabit}
              className="mb-6 flex items-center gap-3 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50"
            >
              <input
                type="text"
                autoFocus
                placeholder="Qual novo hábito você quer construir?"
                className="flex-1 bg-transparent border-none text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
                <button
                  type="submit"
                  disabled={!newHabitName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-xs font-bold transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase tracking-widest">
                  <th className="text-left pb-4 font-medium w-72">Hábito</th>
                  <th className="pb-4 px-2 font-medium border-l border-zinc-800/50 text-zinc-300">
                    <div className="flex justify-between gap-1 px-1">
                      {calendarDays.map((dateObj, d) => {
                        const isToday =
                          dateObj.toDateString() === new Date().toDateString();

                        // Gets localized short name: "dom", "seg", "ter"...
                        const weekDayName = dateObj
                          .toLocaleDateString("pt-BR", { weekday: "short" })
                          .replace(".", "");

                        return (
                          <div
                            key={d}
                            className={`w-10 flex flex-col items-center gap-1.5 ${
                              isToday ? "text-blue-500 font-bold" : "opacity-60"
                            }`}
                          >
                            <span className="text-[9px] uppercase tracking-widest">
                              {weekDayName}
                            </span>
                            <span
                              className={`w-7 h-7 flex items-center justify-center text-sm ${
                                isToday ? "bg-blue-500/10 rounded-full" : ""
                              }`}
                            >
                              {dateObj.getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </th>
                  <th className="pb-4 pl-8 font-medium text-right w-64">
                    Estatísticas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {habits.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-12 text-center text-zinc-500 text-sm"
                    >
                      Nenhum hábito cadastrado. Comece adicionando um!
                    </td>
                  </tr>
                )}
                {habits.map((habit) => {
                  const { current, max } = calculateStreaks(
                    habit.completedDates,
                  );
                  const progress = getOverallProgress(habit.completedDates);

                  const currentIcon = habit.icon || "🎯";

                  return (
                    <tr
                      key={habit.id}
                      className="group hover:bg-zinc-900/20 transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          {/* Habit Icon Picker using a Positioned Portal Modal */}
                          <HabitIconPicker
                            currentIcon={currentIcon}
                            onSelect={(newIcon) =>
                              handleIconChange(habit.id, newIcon)
                            }
                            onRemove={() => handleIconChange(habit.id, "🎯")}
                          >
                            <div
                              className="w-10 h-10 flex items-center justify-center bg-zinc-800/50 rounded-xl hover:bg-blue-500/10 transition-colors overflow-hidden"
                              title="Alterar Ícone"
                            >
                              {isImageUrl(currentIcon) ? (
                                <img
                                  src={currentIcon}
                                  alt={habit.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xl">{currentIcon}</span>
                              )}
                            </div>
                          </HabitIconPicker>

                          {/* Edit Mode vs Display Mode */}
                          {editingId === habit.id ? (
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onBlur={() => handleSaveEdit(habit.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit(habit.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <span
                              onDoubleClick={() => {
                                setEditingId(habit.id);
                                setEditName(habit.name);
                              }}
                              className="text-sm font-semibold group-hover:text-white transition-colors cursor-pointer select-none"
                            >
                              {habit.name}
                            </span>
                          )}

                          {/* Quick Actions */}
                          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingId(habit.id);
                                setEditName(habit.name);
                              }}
                              className="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                              title="Remover"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-2 border-l border-zinc-800/50">
                        <div className="flex justify-between gap-1 px-1">
                          {calendarDays.map((dateObj, d) => {
                            const dateStr = toDateString(dateObj);
                            const isCompleted = habit.completedDates?.[dateStr];

                            return (
                              <div key={d} className="flex justify-center w-10">
                                <button
                                  onClick={() => toggleHabit(habit.id, dateStr)}
                                  className={`w-14 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-90
                                      ${
                                        isCompleted
                                          ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                          : "border-2 border-zinc-800 hover:border-zinc-600 bg-zinc-900/50"
                                      }`}
                                >
                                  {isCompleted && (
                                    <Check size={16} strokeWidth={3} />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-4 pl-8">
                        <div className="flex items-center justify-end gap-6">
                          <div className="flex items-center gap-4 text-right">
                            <div className="flex flex-col">
                              <span className="text-xl font-bold text-white leading-none">
                                {current}
                              </span>
                              <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                                Atual
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xl font-bold text-white leading-none">
                                {max}
                              </span>
                              <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                                Recorde
                              </span>
                            </div>
                          </div>

                          <div className="w-12 h-12 flex-shrink-0">
                            <ProgressRing
                              progress={progress}
                              color={progress === 100 ? "#22c55e" : "#3b82f6"}
                              size={48}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Weekly Footer Summary */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Eficiência da {weekLabel}
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso Geral</span>
              <span className="text-lg font-bold text-green-500">
                {thisWeekProgress}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                style={{ width: `${thisWeekProgress}%` }}
              />
            </div>
          </div>
          <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50 flex flex-col justify-center items-center text-center">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
              Total de Checkins (Geral)
            </p>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              {habits.reduce(
                (acc, h) => acc + Object.keys(h.completedDates || {}).length,
                0,
              )}
              <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">
                Feitos
              </span>
            </div>
          </div>
        </section>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        main { animation: fade-in 0.8s ease-out; }
      `,
        }}
      />
    </div>
  );
}
