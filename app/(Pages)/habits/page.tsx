"use client";

import React, { useState, useMemo } from "react";
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
  User,
  Plus,
  Check,
  Flame,
  Award,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Smile,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorageState";
import { ProgressRing } from "@/components/ui/ProgressRing";

// --- Types ---
type Habit = {
  id: number;
  name: string;
  completedDates: Record<string, boolean>; // e.g., { "2023-10-24": true }
};

// --- Helpers ---
const toDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateStreaks = (completedDates: Record<string, boolean>) => {
  if (!completedDates) return { current: 0, max: 0 };

  // 1. Current Streak: count backwards from today
  let current = 0;
  const d = new Date();
  while (completedDates[toDateString(d)]) {
    current++;
    d.setDate(d.getDate() - 1);
  }

  // 2. Record Streak: sort dates and count consecutive days
  const dates = Object.keys(completedDates)
    .filter((k) => completedDates[k])
    .sort();

  let max = 0;
  let tempMax = 0;
  let prevDate: Date | null = null;

  for (const dateStr of dates) {
    // Parse strictly at midnight to avoid timezone shifts
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

  // Max should at least be the current streak
  return { current, max: Math.max(max, current) };
};

const ProgressBar = ({
  progress,
  color = "bg-blue-600",
}: {
  progress: number;
  color?: string;
}) => (
  <div className="w-24 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
    <div
      className={`${color} h-full transition-all duration-500`}
      style={{ width: `${progress}%` }}
    />
  </div>
);

// --- Constants ---
const DAYS_IN_VIEW = 7;
const HABITS_INITIAL: Habit[] = [
  {
    id: 1,
    name: "Estudar",
    completedDates: { [toDateString(new Date())]: true },
  },
  {
    id: 2,
    name: "Beber 4l de água",
    completedDates: {},
  },
];

export default function App() {
  const [habits, setHabits] = useLocalStorage<Habit[]>(
    "studyhub_habits_v2",
    HABITS_INITIAL,
  );

  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week, 1 = next week

  // --- Calendar Logic ---
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    const thisMonday = new Date(today);
    // Apply distance to Monday AND the week offset
    thisMonday.setDate(today.getDate() - distanceToMonday + weekOffset * 7);

    for (let i = 0; i < DAYS_IN_VIEW; i++) {
      const d = new Date(thisMonday);
      d.setDate(thisMonday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekOffset]);

  // Labels for the Week Navigation
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

  // --- Current Week Efficiency ---
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
            delete newDates[dateStr]; // Toggle off
          } else {
            newDates[dateStr] = true; // Toggle on
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

  const getOverallProgress = (completedDates: Record<string, boolean>) => {
    if (!completedDates) return 0;
    // For overall progress bar on the card, let's show how much of the CURRENT VIEW they've done
    let doneInView = 0;
    calendarDays.forEach((day) => {
      if (completedDates[toDateString(day)]) doneInView++;
    });
    return Math.round((doneInView / DAYS_IN_VIEW) * 100);
  };

  return (
    <div className="min-h-screen mt-24 bg-background text-zinc-100 font-sans selection:bg-blue-500/30 pb-20">
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
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase tracking-widest">
                  <th className="text-left pb-6 font-medium w-64">Hábito</th>
                  <th className="pb-6 px-2 font-medium border-l border-zinc-800/50 text-zinc-300">
                    <div className="flex justify-between gap-1 px-1">
                      {calendarDays.map((dateObj, d) => {
                        const isToday =
                          dateObj.toDateString() === new Date().toDateString();

                        return (
                          <span
                            key={d}
                            className={`w-10 text-center ${
                              isToday
                                ? "text-blue-500 font-bold bg-blue-500/10 rounded-full py-1"
                                : "opacity-60 py-1"
                            }`}
                          >
                            {dateObj.getDate()}
                          </span>
                        );
                      })}
                    </div>
                  </th>
                  <th className="pb-6 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {habits.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-zinc-500 text-sm"
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

                  return (
                    <tr
                      key={habit.id}
                      className="group hover:bg-zinc-900/20 transition-colors"
                    >
                      <td className="py-5 pr-4">
                        <div className="flex items-center gap-1.5">
                          <Smile className="w-16 h-16 text-slate-600 p-2" />
                          <span className="text-sm font-semibold group-hover:text-white transition-colors">
                            {habit.name}
                          </span>

                          {/* <div className="flex items-center gap-3 text-[10px] font-bold">
                            <div className="flex items-center gap-1 text-blue-500">
                              <Flame size={10} fill="currentColor" />
                              <span>{current} DIAS ATUAL</span>
                            </div>
                            <div className="flex items-center gap-1 text-zinc-500">
                              <Award size={10} />
                              <span>RECORDE: {max}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-1">
                            <ProgressBar progress={progress} />
                            <span className="text-[10px] font-bold text-zinc-600 tracking-tighter">
                              {progress}%
                            </span>
                          </div> */}
                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            title="Remover hábito"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                      <td className="py-5 px-2 border-l border-zinc-800/50">
                        <div className="flex justify-between gap-1 px-1">
                          {calendarDays.map((dateObj, d) => {
                            const dateStr = toDateString(dateObj);
                            const isCompleted = habit.completedDates?.[dateStr];

                            return (
                              <div key={d} className="flex justify-center w-10">
                                <button
                                  onClick={() => toggleHabit(habit.id, dateStr)}
                                  className={`w-14 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-75
                                      ${
                                        isCompleted
                                          ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                          : "border-2 border-zinc-800 hover:border-zinc-600 bg-zinc-900/50"
                                      }`}
                                >
                                  {isCompleted && (
                                    <Check size={14} strokeWidth={4} />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      {/* Delete Action */}
                      <td className="py-5 pl-4 text-right"></td>
                      <td className="flex items-center gap-6 ml-auto">
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">
                            {current}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Current
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">
                            {max}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Longest
                          </p>
                        </div>
                        {/* <div className="flex items-center gap-3 mt-1">
                              <ProgressBar progress={progress} />
                              <span className="text-[10px] font-bold text-zinc-600 tracking-tighter">
                                {progress}%
                              </span>
                            </div> */}
                        <ProgressRing
                          progress={progress}
                          color={"currentColor"}
                          size={60}
                        />
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
              <span className="text-sm font-medium">Progresso</span>
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
