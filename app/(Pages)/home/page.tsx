"use client";

import React, { useState, useEffect } from "react";
import { CoverPicker } from "@/components/notes/NotePickers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

import {
  Flame,
  Brain,
  Target,
  Zap,
  Calendar,
  CheckSquare,
  ChevronRight,
  Activity,
  Clock,
  Shield,
  type LucideIcon,
} from "lucide-react";

// --- MOCK DATA ---
const INITIAL_QUESTS = [
  { id: 1, text: "Ler 20 páginas de Clean Code", xp: 50, completed: false },
  { id: 2, text: "Revisar deck de Algoritmos", xp: 30, completed: false },
  { id: 3, text: "Criar 3 notas interligadas", xp: 40, completed: false },
  { id: 4, text: "Treino físico (Força)", xp: 100, completed: false },
];

const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "Entrega Projeto Final",
    time: "Amanhã, 23:59",
    type: "urgent",
  },
  {
    id: 2,
    title: "Reunião Grupo de Estudos",
    time: "Quarta, 19:00",
    type: "normal",
  },
  {
    id: 3,
    title: "Prova de Estrutura de Dados",
    time: "Sexta, 08:00",
    type: "warning",
  },
];

const TRAINING_HEATMAP_CLASSES = [
  "bg-orange-500/80",
  "bg-orange-600/40",
  "bg-orange-500/80",
  "bg-orange-500/80",
  "bg-orange-600/40",
  "bg-orange-500/80",
  "bg-orange-600/40",
  "bg-orange-500/80",
  "bg-orange-500/80",
  "bg-orange-600/40",
  "bg-orange-600/40",
  "bg-orange-500/80",
  "bg-orange-500/80",
  "bg-orange-600/40",
  "bg-orange-500/80",
  "bg-orange-600/40",
  "bg-orange-500/80",
  "bg-orange-600/40",
  "bg-orange-500/20 border border-orange-500/50 animate-pulse",
  "bg-slate-800",
  "bg-slate-800",
] as const;

const HOME_COVER_STORAGE_KEY = "studyhub:home-cover";

type UserProfile = {
  id: string | null;
  fullName: string;
  avatarUrl: string | null;
};

const DEFAULT_PROFILE: UserProfile = {
  id: null,
  fullName: "User",
  avatarUrl: null,
};

function getHomeCoverStorageKey(userId: string | null) {
  return userId
    ? `${HOME_COVER_STORAGE_KEY}:${userId}`
    : HOME_COVER_STORAGE_KEY;
}

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase() || "U";
}

function isCoverImageValue(value: string) {
  return value.startsWith("data:") || value.startsWith("http");
}

function HomeCover({ cover }: { cover: string | null }) {
  if (!cover) return null;

  if (isCoverImageValue(cover)) {
    return (
      <div className="h-[clamp(11rem,28vh,20rem)]  w-full overflow-hidden bg-slate-950">
        <img
          src={cover}
          alt="Home cover"
          className="h-full w-full object-cover "
        />
      </div>
    );
  }

  if (cover.startsWith("bg-") || cover.startsWith("from-")) {
    return (
      <div className="h-[clamp(11rem,28vh,20rem)] w-full overflow-hidden bg-slate-950">
        <div className={cn("h-full w-full", cover)} />
      </div>
    );
  }

  return (
    <div
      className="h-[clamp(11rem,28vh,20rem)] w-full overflow-hidden bg-slate-950"
      style={{ background: cover }}
    />
  );
}

// --- COMPONENTES AUXILIARES ---
type CardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
};

const Card = ({
  children,
  className = "",
  title,
  icon: Icon,
  action,
}: CardProps) => (
  <div
    className={`bg-slate-900/60 border border-blue-500/20 rounded-xl p-5 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 flex flex-col ${className}`}
  >
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-blue-500/10">
        <h3 className="text-blue-100 font-semibold flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-blue-400" />}
          {title}
        </h3>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="flex-1 flex flex-col">{children}</div>
  </div>
);

// Mock do Grafo (SVG simulando a rede de notas)
const NetworkGraphMock = () => {
  return (
    <div className="w-full h-full min-h-[250px] relative flex items-center justify-center bg-slate-950/50 rounded-lg overflow-hidden border border-slate-800">
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 400 300"
      >
        {/* Linhas */}
        <line
          x1="200"
          y1="150"
          x2="100"
          y2="80"
          stroke="#3b82f6"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="200"
          y1="150"
          x2="320"
          y2="100"
          stroke="#3b82f6"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="200"
          y1="150"
          x2="250"
          y2="250"
          stroke="#3b82f6"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="200"
          y1="150"
          x2="80"
          y2="200"
          stroke="#3b82f6"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="100"
          y1="80"
          x2="150"
          y2="40"
          stroke="#3b82f6"
          strokeWidth="0.5"
          opacity="0.3"
        />
        <line
          x1="320"
          y1="100"
          x2="350"
          y2="180"
          stroke="#3b82f6"
          strokeWidth="0.5"
          opacity="0.3"
        />
        <line
          x1="250"
          y1="250"
          x2="150"
          y2="270"
          stroke="#3b82f6"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {/* Nós */}
        <circle
          cx="200"
          cy="150"
          r="12"
          fill="#60a5fa"
          className="animate-pulse"
        />
        <circle cx="100" cy="80" r="6" fill="#93c5fd" />
        <circle cx="320" cy="100" r="8" fill="#93c5fd" />
        <circle cx="250" cy="250" r="7" fill="#93c5fd" />
        <circle cx="80" cy="200" r="5" fill="#bfdbfe" />
        <circle cx="150" cy="40" r="4" fill="#bfdbfe" />
        <circle cx="350" cy="180" r="4" fill="#bfdbfe" />
        <circle cx="150" cy="270" r="5" fill="#bfdbfe" />
      </svg>
      <div className="absolute bottom-3 left-3 bg-slate-900/80 px-3 py-1 rounded text-xs text-blue-300 border border-blue-500/30">
        Nós ativos: 142
      </div>
      <div className="absolute top-3 right-3 flex gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [xp, setXp] = useState(1240);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [homeCover, setHomeCover] = useState<string | null>(null);
  const level = Math.floor(xp / 1000) + 7; // Lógica mockada de nível
  const currentLevelXp = xp % 1000;
  const nextLevelXp = 1000;

  const xpPercentage = (currentLevelXp / nextLevelXp) * 100;

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    const updateProfile = (user: User | null) => {
      if (ignore || !user) return;

      setProfile({
        id: user.id,
        fullName: user.user_metadata?.full_name || "User",
        avatarUrl: user.user_metadata?.avatar_url || null,
      });
    };

    supabase.auth.getUser().then(({ data }) => updateProfile(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateProfile(session?.user ?? null);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!profile.id) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;

      try {
        setHomeCover(
          window.localStorage.getItem(getHomeCoverStorageKey(profile.id)),
        );
      } catch {
        setHomeCover(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  const handleHomeCoverUpdate = (cover: string | null) => {
    setHomeCover(cover);

    try {
      const storageKey = getHomeCoverStorageKey(profile.id);

      if (cover) {
        window.localStorage.setItem(storageKey, cover);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      alert("Could not save this cover locally. Try a smaller image.");
    }
  };

  const toggleQuest = (id: number) => {
    setQuests(
      quests.map((q) => {
        if (q.id === id) {
          const isCompleting = !q.completed;
          if (isCompleting) setXp((prev) => prev + q.xp);
          else setXp((prev) => prev - q.xp);
          return { ...q, completed: isCompleting };
        }
        return q;
      }),
    );
  };

  const completedQuestsCount = quests.filter((q) => q.completed).length;

  return (
    <div className="min-h-screen bg-[#020817] mt-8 text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. HEADER & PLAYER STATUS */}
        <section className="relative overflow-visible rounded-2xl border border-blue-500/20 bg-slate-950/70 shadow-[0_0_25px_rgba(59,130,246,0.08)]">
          <HomeCover cover={homeCover} />

          <div className="absolute  left-4 top-4 z-30">
            <CoverPicker
              currentCover={homeCover}
              onSelect={(cover) => handleHomeCoverUpdate(cover)}
              onRemove={() => handleHomeCoverUpdate(null)}
              triggerClassName="border border-white/10 bg-slate-950/70 text-slate-100  backdrop-blur hover:bg-slate-900/90 hover:text-white"
            />
          </div>

          <header
            className={cn(
              "relative z-10 flex flex-col gap-6 px-5 pb-8 md:flex-row md:items-end md:px-8",
              homeCover ? "-mt-16 pt-0" : "pt-16",
            )}
          >
            <Avatar className="h-32 w-32 border-4 border-[#020817] bg-slate-900 shadow-[0_0_25px_rgba(59,130,246,0.35)] md:h-40 md:w-40">
              <AvatarImage
                src={profile.avatarUrl || undefined}
                alt={`${profile.fullName} avatar`}
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-800 text-5xl font-black text-blue-100">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 pb-2">
              <h1 className="flex flex-wrap items-center gap-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                <Shield className="h-8 w-8 text-blue-500" />
                {profile.fullName !== "User" ? `${profile.fullName}` : ""}
              </h1>

              <div className="mt-3 max-w-md">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-blue-200/80">
                  <span>Nível {level}</span>
                  <span>
                    {currentLevelXp}/{nextLevelXp} XP
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </header>
        </section>

        {/* 2. BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Grafo do Conhecimento (Destaque) */}
          <Card
            title="Rede Neural (Segundo Cérebro)"
            icon={Brain}
            className="md:col-span-2 lg:col-span-2"
            action={
              <button className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-500/30 hover:bg-blue-800/50 transition-colors">
                Expandir
              </button>
            }
          >
            <div className="flex-1 flex flex-col">
              <NetworkGraphMock />
              <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Sincronizado há 2 min</span>
                </div>
                <span>+3 Notas hoje</span>
              </div>
            </div>
          </Card>

          {/* Missões Diárias (To-Do list) */}
          <Card
            title="Missões Diárias"
            icon={Target}
            className="md:col-span-1 lg:col-span-2 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
            action={
              <span className="text-xs font-bold text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-500/20">
                {completedQuestsCount}/{quests.length}
              </span>
            }
          >
            <div className="space-y-3 mt-2 overflow-y-auto pr-2 max-h-[300px]">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  onClick={() => toggleQuest(quest.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    quest.completed
                      ? "bg-slate-800/40 border-slate-700 opacity-60"
                      : "bg-indigo-950/20 border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-900/30"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      quest.completed
                        ? "bg-indigo-500 text-white"
                        : "border border-indigo-500/50"
                    }`}
                  >
                    {quest.completed && <CheckSquare className="w-4 h-4" />}
                  </div>
                  <span
                    className={`flex-1 text-sm ${quest.completed ? "line-through text-slate-500" : "text-slate-200"}`}
                  >
                    {quest.text}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-300 bg-indigo-900/40 px-2 py-1 rounded">
                    +{quest.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Revisão de Flashcards */}
          <Card
            title="Sala de Treinamento"
            icon={Zap}
            className="md:col-span-1 lg:col-span-1"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-orange-500">
                  42
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Cartões pendentes para revisão hoje.
                </div>
              </div>

              {/* Mock de Heatmap simplificado */}
              <div className="mt-6">
                <div className="text-xs text-slate-500 mb-2 font-medium">
                  OFENSIVA: 12 DIAS{" "}
                  <Flame className="inline w-3 h-3 text-orange-500" />
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {TRAINING_HEATMAP_CLASSES.map((cellClass, i) => (
                    <div
                      key={i}
                      className={`h-6 rounded-sm ${cellClass}`}
                    ></div>
                  ))}
                </div>
              </div>

              <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                Iniciar Treino <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Card>

          {/* Rastreador de Hábitos */}
          <Card
            title="Hábitos (Passivas)"
            icon={Flame}
            className="md:col-span-1 lg:col-span-2"
          >
            <div className="space-y-4">
              {[
                { name: "Leitura", streak: 5, color: "bg-emerald-500" },
                { name: "Meditação", streak: 12, color: "bg-purple-500" },
                { name: "Programação", streak: 2, color: "bg-blue-500" },
              ].map((habit, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${habit.color} shadow-[0_0_8px_currentColor]`}
                    ></div>
                    <span className="text-sm font-medium">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Mini quadrados do hábito */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-sm ${i < 4 ? habit.color : "bg-slate-800"}`}
                        ></div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 w-12 text-right">
                      {habit.streak} dias
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Eventos / Calendário */}
          <Card
            title="Próximas Quests"
            icon={Calendar}
            className="md:col-span-1 lg:col-span-1"
          >
            <div className="space-y-4">
              {UPCOMING_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="relative pl-4 border-l-2 border-slate-700 hover:border-blue-500 transition-colors"
                >
                  <div
                    className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                      event.type === "urgent"
                        ? "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"
                        : event.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  ></div>
                  <h4 className="text-sm font-medium text-slate-200 line-clamp-1">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <Clock className="w-3 h-3" /> {event.time}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-auto pt-4 text-xs text-blue-400 hover:text-blue-300 font-medium text-center">
              Abrir Calendário Completo
            </button>
          </Card>
        </div>

        {/* CSS Customizado para animações extras */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes progress {
            0% { background-position: 0 0; }
            100% { background-position: 1rem 0; }
          }
        `,
          }}
        />
      </div>
    </div>
  );
}
