"use client";

import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { User, Plus, Check, Flame, Award } from "lucide-react";

// --- Mock Data & Constants ---
const DAYS_IN_VIEW = 28; // 4 weeks
const WEEKS = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
const HABITS_INITIAL = [
  {
    id: 1,
    name: "Estudar",
    completed: [
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
    ],
  },
  {
    id: 2,
    name: "Beber 4l de água",
    completed: [
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
    ],
  },
  {
    id: 3,
    name: "Cardio matinal",
    completed: [
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
    ],
  },
  {
    id: 4,
    name: "Leitura",
    completed: [
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
    ],
  },
  {
    id: 5,
    name: "Treinar",
    completed: [
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
    ],
  },
  {
    id: 6,
    name: "Meditar",
    completed: [
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
    ],
  },
];

const CHART_DATA = [
  { day: 1, progress: 100 },
  { day: 2, progress: 95 },
  { day: 3, progress: 90 },
  { day: 4, progress: 85 },
  { day: 5, progress: 20 },
  { day: 6, progress: 5 },
  { day: 7, progress: 0 },
  { day: 14, progress: 0 },
  { day: 21, progress: 0 },
  { day: 28, progress: 0 },
];

// --- Helper Functions ---

const calculateStreaks = (completed = []) => {
  let current = 0;
  let max = 0;
  let tempMax = 0;

  // Calculate Record (Longest) Streak
  completed.forEach((val) => {
    if (val) {
      tempMax++;
      max = Math.max(max, tempMax);
    } else {
      tempMax = 0;
    }
  });

  // Calculate Current Streak
  const lastIndex = completed.length - 1;
  for (let i = lastIndex; i >= 0; i--) {
    if (completed[i]) {
      current++;
    } else {
      break;
    }
  }

  return { current, max };
};

const ProgressBar = ({ progress, color = "bg-red-600" }) => (
  <div className="w-24 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
    <div
      className={`${color} h-full transition-all duration-500`}
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default function App() {
  const [habits, setHabits] = useState(HABITS_INITIAL);

  const toggleHabit = (habitId, dayIndex) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const newCompleted = [...(h.completed || [])];
          // Ensure the array can accommodate the index
          while (newCompleted.length <= dayIndex) newCompleted.push(false);
          newCompleted[dayIndex] = !newCompleted[dayIndex];
          return { ...h, completed: newCompleted };
        }
        return h;
      }),
    );
  };

  const getOverallProgress = (completedArray) => {
    if (!completedArray || completedArray.length === 0) return 0;
    const count = completedArray.filter(Boolean).length;
    return Math.round((count / DAYS_IN_VIEW) * 100);
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans selection:bg-red-500/30 pb-20">
      {/* Header */}

      <main className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Overall Progress Chart */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Progresso Geral dos Hábitos
            </h2>
          </div>

          <div className="relative bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
            <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-6 px-12">
              <span className="w-1/4 text-center">Semana 1</span>
              <span className="w-1/4 text-center">Semana 2</span>
              <span className="w-1/4 text-center">Semana 3</span>
              <span className="w-1/4 text-center">Semana 4</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient
                      id="colorProgress"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#27272a"
                  />
                  <XAxis dataKey="day" hide />
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
                    itemStyle={{ color: "#ef4444" }}
                    labelClassName="hidden"
                  />
                  <Area
                    type="monotone"
                    dataKey="progress"
                    stroke="#ef4444"
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Grade de Hábitos
            </h2>
            <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-600/20">
              <Plus size={16} /> Adicionar Hábito
            </button>
          </div>

          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase tracking-widest">
                  <th className="text-left pb-6 font-medium w-64">Hábito</th>
                  {WEEKS.map((week, wIdx) => (
                    <th
                      key={week}
                      className={`pb-6 px-2 font-medium border-l border-zinc-800/50 ${wIdx === 0 ? "text-zinc-300" : ""}`}
                    >
                      <div className="mb-2 text-center">{week}</div>
                      <div className="flex justify-between gap-1 px-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <span key={d} className="w-7 text-center opacity-60">
                            {d + wIdx * 7}
                          </span>
                        ))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {habits.map((habit) => {
                  const { current, max } = calculateStreaks(habit.completed);
                  const progress = getOverallProgress(habit.completed);

                  return (
                    <tr
                      key={habit.id}
                      className="group hover:bg-zinc-900/20 transition-colors"
                    >
                      <td className="py-5 pr-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-semibold group-hover:text-white transition-colors">
                            {habit.name}
                          </span>

                          {/* Streak Statistics */}
                          <div className="flex items-center gap-3 text-[10px] font-bold">
                            <div className="flex items-center gap-1 text-red-500">
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
                          </div>
                        </div>
                      </td>
                      {WEEKS.map((_, wIdx) => (
                        <td
                          key={wIdx}
                          className="py-5 px-2 border-l border-zinc-800/50"
                        >
                          <div className="flex justify-between gap-1 px-1">
                            {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                              const dayIdx = wIdx * 7 + d;
                              const isCompleted = habit.completed?.[dayIdx];
                              return (
                                <button
                                  key={d}
                                  onClick={() => toggleHabit(habit.id, dayIdx)}
                                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-75
                                    ${
                                      isCompleted
                                        ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                        : "border-2 border-zinc-800 hover:border-zinc-600 bg-zinc-900/50"
                                    }`}
                                >
                                  {isCompleted && (
                                    <Check size={14} strokeWidth={4} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Weekly Footer Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Eficiência Semanal
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Semana 1</span>
              <span className="text-lg font-bold text-green-500">82%</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[82%] shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
            </div>
          </div>
          <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50 flex flex-col justify-center items-center text-center">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
              Total de Checkins
            </p>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              {habits.reduce(
                (acc, h) => acc + h.completed.filter(Boolean).length,
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
