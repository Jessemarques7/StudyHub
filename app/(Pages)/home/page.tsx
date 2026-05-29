"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Activity,
  BookOpen,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Flame,
  Loader2,
  Network,
  Shield,
  Target,
  type LucideIcon,
} from "lucide-react";
import Graph from "@/components/notes/Graph";
import { CoverPicker } from "@/components/notes/NotePickers";
import { ReviewHeatmap } from "@/components/flashcards/ReviewHeatmap";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getAllDecks,
  getCardCountsByDeck,
} from "@/lib/storage";
import {
  getCurrentStreak,
  getLongestStreak,
  getReviewActivity,
  getTodayActivityDate,
  type ReviewActivityDay,
} from "@/lib/review-activity";
import { getAllHabits, updateHabit as updateHabitRecord } from "@/lib/habits";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/habits";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import calendarStyles from "../calendar/calendar.module.css";

type Quest = {
  id: number;
  text: string;
  xp: number;
  completed: boolean;
};

type UserProfile = {
  id: string | null;
  fullName: string;
  avatarUrl: string | null;
};

type DeckCounts = {
  total: number;
  new: number;
  learning: number;
  review: number;
  due: number;
};

type CalendarEventTheme = {
  bg: string;
  border: string;
  text: string;
};

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  colorId?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
};

type CalendarPreviewEvent = {
  id: string;
  title: string;
  start?: string;
  end?: string;
  allDay: boolean;
  extendedProps: {
    description?: string;
    theme: CalendarEventTheme;
    colorId: string;
  };
};

const INITIAL_QUESTS: Quest[] = [
  { id: 1, text: "Ler 20 paginas de Clean Code", xp: 50, completed: false },
  { id: 2, text: "Revisar deck de algoritmos", xp: 30, completed: false },
  { id: 3, text: "Criar 3 notas interligadas", xp: 40, completed: false },
  { id: 4, text: "Treino fisico", xp: 100, completed: false },
];

const DEFAULT_PROFILE: UserProfile = {
  id: null,
  fullName: "User",
  avatarUrl: null,
};

const HOME_COVER_STORAGE_KEY = "studyhub:home-cover";
const DAYS_IN_HABIT_PREVIEW = 7;

const calendarEventThemes: Record<string, CalendarEventTheme> = {
  "1": {
    bg: "var(--calendar-color-1-bg)",
    border: "var(--calendar-color-1-border)",
    text: "var(--calendar-color-1-text)",
  },
  "2": {
    bg: "var(--calendar-color-2-bg)",
    border: "var(--calendar-color-2-border)",
    text: "var(--calendar-color-2-text)",
  },
  "3": {
    bg: "var(--calendar-color-3-bg)",
    border: "var(--calendar-color-3-border)",
    text: "var(--calendar-color-3-text)",
  },
  "4": {
    bg: "var(--calendar-color-4-bg)",
    border: "var(--calendar-color-4-border)",
    text: "var(--calendar-color-4-text)",
  },
  "5": {
    bg: "var(--calendar-color-5-bg)",
    border: "var(--calendar-color-5-border)",
    text: "var(--calendar-color-5-text)",
  },
  "6": {
    bg: "var(--calendar-color-6-bg)",
    border: "var(--calendar-color-6-border)",
    text: "var(--calendar-color-6-text)",
  },
  "7": {
    bg: "var(--calendar-color-7-bg)",
    border: "var(--calendar-color-7-border)",
    text: "var(--calendar-color-7-text)",
  },
  "8": {
    bg: "var(--calendar-color-8-bg)",
    border: "var(--calendar-color-8-border)",
    text: "var(--calendar-color-8-text)",
  },
  "9": {
    bg: "var(--calendar-color-9-bg)",
    border: "var(--calendar-color-9-border)",
    text: "var(--calendar-color-9-text)",
  },
  "10": {
    bg: "var(--calendar-color-10-bg)",
    border: "var(--calendar-color-10-border)",
    text: "var(--calendar-color-10-text)",
  },
  "11": {
    bg: "var(--calendar-color-11-bg)",
    border: "var(--calendar-color-11-border)",
    text: "var(--calendar-color-11-text)",
  },
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

function isImageUrl(value: string) {
  return value.startsWith("http") || value.startsWith("data:image");
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return start;
}

function calculateHabitStreak(completedDates: Record<string, boolean>) {
  let current = 0;
  const cursor = new Date();

  while (completedDates[toDateString(cursor)]) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return current;
}

function HomeCover({ cover }: { cover: string | null }) {
  if (!cover) return null;

  if (isCoverImageValue(cover)) {
    return (
      <div className="h-[clamp(11rem,28vh,20rem)] w-full overflow-hidden bg-main">
        <img
          src={cover}
          alt="Home cover"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (cover.startsWith("bg-") || cover.startsWith("from-")) {
    return (
      <div className="h-[clamp(11rem,28vh,20rem)] w-full overflow-hidden bg-main">
        <div className={cn("h-full w-full", cover)} />
      </div>
    );
  }

  return (
    <div
      className="h-[clamp(11rem,28vh,20rem)] w-full overflow-hidden bg-main"
      style={{ background: cover }}
    />
  );
}

type PanelProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
};

function Panel({
  children,
  className,
  title,
  icon: Icon,
  action,
}: PanelProps) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-lg border border-border bg-secondary/45 p-5 text-font shadow-card backdrop-blur-xl transition-colors hover:border-complement/40",
        className,
      )}
    >
      {(title || Icon || action) && (
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/70 pb-3">
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-font">
            {Icon && <Icon className="h-5 w-5 shrink-0 text-complement" />}
            <span className="truncate">{title}</span>
          </h2>
          {action}
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-third px-3 text-xs font-semibold text-complement transition-colors hover:border-complement/60 hover:bg-complement/10"
    >
      {children}
    </Link>
  );
}

function GraphPanel() {
  return (
    <Panel
      title="Visao em grafo"
      icon={Network}
      className="min-h-[440px] md:col-span-2 lg:col-span-2"
      action={<PanelLink href="/notes">Abrir notas</PanelLink>}
    >
      <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-lg border border-border bg-main/60">
        <Graph classname="h-full min-h-[320px]" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-font/60">
        <span className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-complement" />
          Dados sincronizados com notas e diagramas
        </span>
        <span className="hidden sm:inline">Clique em um no para navegar</span>
      </div>
    </Panel>
  );
}

function FlashcardsPanel() {
  const [decksCount, setDecksCount] = useState(0);
  const [cardCounts, setCardCounts] = useState<Record<string, DeckCounts>>({});
  const [reviewActivity, setReviewActivity] = useState<ReviewActivityDay[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadFlashcardData = async () => {
      try {
        const decks = await getAllDecks();
        const counts = await getCardCountsByDeck(decks.map((deck) => deck.id));

        if (cancelled) return;

        setDecksCount(decks.length);
        setCardCounts(counts);
        setReviewActivity(getReviewActivity());
        setIsClientReady(true);
      } catch (error) {
        console.error("Erro ao carregar dados dos flashcards:", error);
        if (!cancelled) {
          setReviewActivity(getReviewActivity());
          setIsClientReady(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadFlashcardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    return Object.values(cardCounts).reduce(
      (acc, counts) => ({
        total: acc.total + counts.total,
        due: acc.due + counts.due,
        learning: acc.learning + counts.learning,
        review: acc.review + counts.review,
      }),
      { total: 0, due: 0, learning: 0, review: 0 },
    );
  }, [cardCounts]);

  const todayStudied =
    reviewActivity.find((day) => day.date === getTodayActivityDate())?.count ??
    0;
  const totalStudied = reviewActivity.reduce((sum, day) => sum + day.count, 0);
  const activeDays = reviewActivity.filter((day) => day.count > 0).length;
  const dailyAverage =
    activeDays > 0 ? Math.round(totalStudied / activeDays) : 0;
  const currentStreak = getCurrentStreak(reviewActivity);
  const longestStreak = getLongestStreak(reviewActivity);
  const heatmapStartDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 8);
    return date;
  }, []);

  return (
    <Panel
      title="Flashcards"
      icon={BookOpen}
      className="md:col-span-1 lg:col-span-2"
      action={<PanelLink href="/flashcards">Abrir</PanelLink>}
    >
      <div className="grid gap-3 text-center text-xs font-medium text-font/70 sm:grid-cols-4">
        <div className="rounded-md border border-border bg-third/60 p-3">
          <p className="text-2xl font-bold text-complement">
            {isLoading ? "..." : totals.due}
          </p>
          <p>Pendentes</p>
        </div>
        <div className="rounded-md border border-border bg-third/60 p-3">
          <p className="text-2xl font-bold text-font">
            {isLoading ? "..." : decksCount}
          </p>
          <p>Decks</p>
        </div>
        <div className="rounded-md border border-border bg-third/60 p-3">
          <p className="text-2xl font-bold text-font">
            {isLoading ? "..." : todayStudied}
          </p>
          <p>Hoje</p>
        </div>
        <div className="rounded-md border border-border bg-third/60 p-3">
          <p className="text-2xl font-bold text-font">
            {isLoading ? "..." : currentStreak}
          </p>
          <p>Sequencia</p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-main/45 px-3 py-4">
        {isClientReady ? (
          <ReviewHeatmap
            value={reviewActivity}
            startDate={heatmapStartDate}
            endDate={new Date()}
          />
        ) : (
          <div className="flex h-[125px] min-w-[760px] items-center justify-center text-sm text-font/50">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando atividade
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-2 text-xs text-font/60 sm:grid-cols-3">
        <p>
          Media diaria:{" "}
          <span className="font-semibold text-complement">
            {dailyAverage} cards
          </span>
        </p>
        <p>
          Maior sequencia:{" "}
          <span className="font-semibold text-complement">
            {longestStreak} dias
          </span>
        </p>
        <p>
          Total revisado:{" "}
          <span className="font-semibold text-complement">
            {totalStudied} cards
          </span>
        </p>
      </div>
    </Panel>
  );
}

function HabitIcon({ habit }: { habit: Habit }) {
  const icon = habit.icon || "";

  if (isImageUrl(icon)) {
    return (
      <img
        src={icon}
        alt={habit.name}
        className="h-full w-full object-cover"
      />
    );
  }

  return <span className="text-lg">{icon || <Flame className="h-4 w-4" />}</span>;
}

function HabitsPanel() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calendarDays = useMemo(() => {
    const start = getStartOfWeek(new Date());

    return Array.from({ length: DAYS_IN_HABIT_PREVIEW }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, []);

  const todayKey = toDateString(new Date());
  const completedToday = habits.filter(
    (habit) => habit.completedDates?.[todayKey],
  ).length;
  const totalCheckins = habits.reduce(
    (acc, habit) => acc + Object.keys(habit.completedDates || {}).length,
    0,
  );

  useEffect(() => {
    let cancelled = false;

    const loadHabits = async () => {
      try {
        const data = await getAllHabits();
        if (!cancelled) setHabits(data);
      } catch (error) {
        console.error("Erro ao carregar habitos:", error);
        if (!cancelled) setHabits([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadHabits();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleHabit = async (habitId: string, dateKey: string) => {
    const currentHabit = habits.find((habit) => habit.id === habitId);
    if (!currentHabit) return;

    const nextCompletedDates = { ...(currentHabit.completedDates || {}) };
    if (nextCompletedDates[dateKey]) {
      delete nextCompletedDates[dateKey];
    } else {
      nextCompletedDates[dateKey] = true;
    }

    const optimisticHabit = {
      ...currentHabit,
      completedDates: nextCompletedDates,
      updatedAt: new Date(),
    };

    setHabits((currentHabits) =>
      currentHabits.map((habit) =>
        habit.id === habitId ? optimisticHabit : habit,
      ),
    );

    try {
      const savedHabit = await updateHabitRecord(habitId, {
        completedDates: nextCompletedDates,
      });

      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit.id === habitId ? savedHabit : habit,
        ),
      );
    } catch (error) {
      console.error("Erro ao atualizar habito:", error);
      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit.id === habitId ? currentHabit : habit,
        ),
      );
    }
  };

  return (
    <Panel
      title="Habit tracker"
      icon={Flame}
      className="md:col-span-2 lg:col-span-2"
      action={<PanelLink href="/habits">Abrir</PanelLink>}
    >
      <div className="mb-4 grid gap-3 text-center text-xs text-font/70 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-third/60 p-3">
          <p className="text-2xl font-bold text-complement">
            {isLoading ? "..." : completedToday}
          </p>
          <p>Concluidos hoje</p>
        </div>
        <div className="rounded-md border border-border bg-third/60 p-3">
          <p className="text-2xl font-bold text-font">
            {isLoading ? "..." : habits.length}
          </p>
          <p>Habitos ativos</p>
        </div>
        <div className="rounded-md border border-border bg-third/60 p-3">
          <p className="text-2xl font-bold text-font">
            {isLoading ? "..." : totalCheckins}
          </p>
          <p>Check-ins</p>
        </div>
      </div>

      <div className="min-h-[220px] overflow-x-auto rounded-lg border border-border bg-main/45 p-3">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[minmax(180px,1fr)_repeat(7,44px)_64px] items-center gap-2 border-b border-border pb-3 text-[10px] font-semibold uppercase tracking-wide text-font/50">
            <span>Habito</span>
            {calendarDays.map((day) => (
              <span key={day.toISOString()} className="text-center">
                {day
                  .toLocaleDateString("pt-BR", { weekday: "short" })
                  .replace(".", "")}
              </span>
            ))}
            <span className="text-right">Seq.</span>
          </div>

          {isLoading && (
            <div className="flex min-h-32 items-center justify-center text-sm text-font/50">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando habitos
            </div>
          )}

          {!isLoading && habits.length === 0 && (
            <div className="flex min-h-32 items-center justify-center text-center text-sm text-font/50">
              Nenhum habito cadastrado ainda.
            </div>
          )}

          {!isLoading &&
            habits.slice(0, 5).map((habit) => (
              <div
                key={habit.id}
                className="grid grid-cols-[minmax(180px,1fr)_repeat(7,44px)_64px] items-center gap-2 border-b border-border/50 py-3 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-third">
                    <HabitIcon habit={habit} />
                  </div>
                  <span className="truncate text-sm font-medium text-font">
                    {habit.name}
                  </span>
                </div>

                {calendarDays.map((day) => {
                  const dateKey = toDateString(day);
                  const isCompleted = Boolean(habit.completedDates?.[dateKey]);

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      aria-label={`${habit.name} ${dateKey}`}
                      onClick={() => toggleHabit(habit.id, dateKey)}
                      className={cn(
                        "mx-auto flex h-9 w-9 items-center justify-center rounded-md border transition-colors active:scale-95",
                        isCompleted
                          ? "border-complement bg-complement text-main shadow-glow"
                          : "border-border bg-secondary hover:border-complement/50 hover:bg-complement/10",
                      )}
                    >
                      {isCompleted && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}

                <span className="text-right text-xs font-semibold text-complement">
                  {calculateHabitStreak(habit.completedDates)}d
                </span>
              </div>
            ))}
        </div>
      </div>
    </Panel>
  );
}

function DailyCalendarPanel() {
  const supabase = useMemo(() => createClient(), []);
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarPreviewEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDateTitle, setCurrentDateTitle] = useState("Hoje");
  const [emptyMessage, setEmptyMessage] = useState("");

  const getProviderToken = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.provider_token;
  }, [supabase]);

  const loadCalendarEvents = useCallback(
    async (start: string, end: string) => {
      setIsLoading(true);
      setEmptyMessage("");

      try {
        const token = await getProviderToken();
        if (!token) {
          setEvents([]);
          setEmptyMessage("Conecte o Google Calendar para ver sua agenda.");
          return;
        }

        const params = new URLSearchParams({ start, end });
        const response = await fetch(`/api/calendar?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar eventos");
        }

        const rawEvents = (await response.json()) as GoogleCalendarEvent[];
        const mappedEvents = rawEvents.map((event) => {
          const colorId = event.colorId || "11";

          return {
            id: event.id,
            title: event.summary || "Sem titulo",
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            allDay: !event.start.dateTime,
            extendedProps: {
              description: event.description,
              colorId,
              theme: calendarEventThemes[colorId] || calendarEventThemes["11"],
            },
          };
        });

        setEvents(mappedEvents);
        setEmptyMessage(mappedEvents.length === 0 ? "Nenhum evento hoje." : "");
      } catch (error) {
        console.error("Erro ao carregar calendario:", error);
        setEvents([]);
        setEmptyMessage("Nao foi possivel carregar o calendario.");
      } finally {
        setIsLoading(false);
      }
    },
    [getProviderToken],
  );

  return (
    <Panel
      title="Calendario diario"
      icon={CalendarDays}
      className="md:col-span-1 lg:col-span-2"
      action={<PanelLink href="/calendar">Abrir</PanelLink>}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold capitalize text-font">
            {currentDateTitle}
          </p>
          <p className="text-xs text-font/55">
            Visao diaria sincronizada com a agenda
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-third p-1">
          <button
            type="button"
            aria-label="Dia anterior"
            onClick={() => calendarRef.current?.getApi().prev()}
            className="flex h-8 w-8 items-center justify-center rounded-md text-font/70 transition-colors hover:bg-complement/10 hover:text-complement"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => calendarRef.current?.getApi().today()}
            className="h-8 rounded-md px-3 text-xs font-semibold text-complement transition-colors hover:bg-complement/10"
          >
            Hoje
          </button>
          <button
            type="button"
            aria-label="Proximo dia"
            onClick={() => calendarRef.current?.getApi().next()}
            className="flex h-8 w-8 items-center justify-center rounded-md text-font/70 transition-colors hover:bg-complement/10 hover:text-complement"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          calendarStyles.calendarWrapper,
          "calendar-wrapper relative h-[360px] min-h-0 overflow-hidden rounded-lg border border-border bg-main/45",
        )}
      >
        {isLoading && (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-md border border-border bg-third px-3 py-2 text-xs text-font/70 shadow-card">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Atualizando
          </div>
        )}

        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={false}
          events={events}
          editable={false}
          selectable={false}
          nowIndicator
          locale="pt-br"
          height="100%"
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          dayHeaderContent={(args) => {
            const dayName = args.date.toLocaleDateString("pt-BR", {
              weekday: "long",
            });
            const shortDay = dayName.charAt(0).toUpperCase() + dayName.slice(1, 3);

            return (
              <div className="flex items-center justify-center gap-2 pb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-font/50">
                  {shortDay}
                </span>
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold",
                    args.isToday
                      ? "bg-complement text-main shadow-glow"
                      : "text-font",
                  )}
                >
                  {args.date.getDate()}
                </span>
              </div>
            );
          }}
          datesSet={(dateInfo) => {
            setCurrentDateTitle(dateInfo.view.title);
            void loadCalendarEvents(dateInfo.startStr, dateInfo.endStr);
          }}
          eventDidMount={(info) => {
            const theme = info.event.extendedProps.theme as
              | CalendarEventTheme
              | undefined;

            if (!theme) return;

            info.el.style.setProperty("background-color", theme.bg, "important");
            info.el.style.setProperty(
              "border",
              `1px solid ${theme.text}`,
              "important",
            );
            info.el.style.setProperty("color", theme.text, "important");
            info.el.style.borderRadius = "var(--radius-card)";
          }}
        />
      </div>

      {emptyMessage && (
        <p className="mt-3 text-xs text-font/55">{emptyMessage}</p>
      )}
    </Panel>
  );
}

function TodoPanel({
  quests,
  onToggleQuest,
}: {
  quests: Quest[];
  onToggleQuest: (id: number) => void;
}) {
  const completedQuestsCount = quests.filter((quest) => quest.completed).length;

  return (
    <Panel
      title="To-do list"
      icon={Target}
      className="md:col-span-1 lg:col-span-2"
      action={
        <span className="rounded-md border border-border bg-third px-2 py-1 text-xs font-bold text-complement">
          {completedQuestsCount}/{quests.length}
        </span>
      }
    >
      <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
        {quests.map((quest) => (
          <button
            key={quest.id}
            type="button"
            onClick={() => onToggleQuest(quest.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors",
              quest.completed
                ? "border-border bg-third/40 text-font/45"
                : "border-border bg-third/60 text-font hover:border-complement/50 hover:bg-complement/10",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                quest.completed
                  ? "border-complement bg-complement text-main"
                  : "border-font/30",
              )}
            >
              {quest.completed && <CheckSquare className="h-4 w-4" />}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 text-sm",
                quest.completed && "line-through",
              )}
            >
              {quest.text}
            </span>
            <span className="shrink-0 rounded-md border border-border bg-main/50 px-2 py-1 text-xs font-bold text-complement">
              +{quest.xp} XP
            </span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

export default function HomePage() {
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [xp, setXp] = useState(1240);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [homeCover, setHomeCover] = useState<string | null>(null);
  const level = Math.floor(xp / 1000) + 7;
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
    setQuests((currentQuests) =>
      currentQuests.map((quest) => {
        if (quest.id !== id) return quest;

        const isCompleting = !quest.completed;
        setXp((currentXp) =>
          isCompleting ? currentXp + quest.xp : currentXp - quest.xp,
        );

        return { ...quest, completed: isCompleting };
      }),
    );
  };

  return (
    <div className="min-h-screen bg-main px-4 py-8 text-font selection:bg-complement/30 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-visible rounded-lg border border-border bg-secondary/55 shadow-card backdrop-blur-xl">
          <HomeCover cover={homeCover} />

          <div className="absolute left-4 top-4 z-30">
            <CoverPicker
              currentCover={homeCover}
              onSelect={(cover) => handleHomeCoverUpdate(cover)}
              onRemove={() => handleHomeCoverUpdate(null)}
              triggerClassName="border border-border bg-main/80 text-font backdrop-blur hover:bg-third hover:text-complement"
            />
          </div>

          <header
            className={cn(
              "relative z-10 flex flex-col gap-6 px-5 pb-8 md:flex-row md:items-end md:px-8",
              homeCover ? "-mt-16 pt-0" : "pt-16",
            )}
          >
            <Avatar className="h-32 w-32 border-4 border-main bg-third shadow-glow md:h-40 md:w-40">
              <AvatarImage
                src={profile.avatarUrl || undefined}
                alt={`${profile.fullName} avatar`}
                className="object-cover"
              />
              <AvatarFallback className="bg-third text-5xl font-black text-font">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 pb-2">
              <h1 className="flex flex-wrap items-center gap-3 text-3xl font-bold text-gradient">
                <Shield className="h-8 w-8 text-complement" />
                {profile.fullName}
              </h1>

              <div className="mt-3 max-w-md">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-font/70">
                  <span>Nivel {level}</span>
                  <span>
                    {currentLevelXp}/{nextLevelXp} XP
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-third">
                  <div
                    className="h-full rounded-full bg-complement shadow-glow"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </header>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          <GraphPanel />
          <TodoPanel quests={quests} onToggleQuest={toggleQuest} />
          <FlashcardsPanel />
          <HabitsPanel />
          <DailyCalendarPanel />
        </div>
      </div>
    </div>
  );
}
