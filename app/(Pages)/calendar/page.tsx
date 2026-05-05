"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { createClient } from "@/utils/supabase/client";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  X,
  Trash2,
  Sunrise,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { IconSun } from "@tabler/icons-react";
import styles from "./calendar.module.css";

interface EventModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  id?: string;
  title: string;
  description: string;
  start: string;
  end: string;
  colorId?: string;
  recurrenceRule?: string;
  recurrenceDays?: string[];
  // Novos campos para gerir edições de eventos recorrentes
  recurringEventId?: string;
  updateMode?: "this" | "all" | "following";
}

type CalendarUpdateMode = NonNullable<EventModalState["updateMode"]>;

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  colorId?: string;
  recurringEventId?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start?: string;
  end?: string;
  allDay: boolean;
  extendedProps: {
    description?: string;
    theme: { bg: string; border: string; text: string };
    colorId: string;
    recurringEventId?: string;
  };
}

interface CalendarEventUpdate {
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  colorId?: string;
  updateMode?: CalendarUpdateMode;
}

interface CalendarSelectInfo {
  startStr: string;
  endStr: string;
}

interface CalendarEventMoveInfo {
  event: {
    id: string;
    startStr: string;
    endStr?: string;
  };
}

interface CalendarDatesSetInfo {
  view: {
    title: string;
    activeStart?: Date;
    activeEnd?: Date;
  };
  startStr: string;
  endStr: string;
}

const DAYS_OF_WEEK = [
  { value: "SU", label: "Dom" },
  { value: "MO", label: "Seg" },
  { value: "TU", label: "Ter" },
  { value: "WE", label: "Qua" },
  { value: "TH", label: "Qui" },
  { value: "FR", label: "Sex" },
  { value: "SA", label: "Sáb" },
];

// Helper para formatar a data ISO para o input type="datetime-local"
const formatDateTimeLocal = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [value, setValue] = useState([6, 22]);

  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (currentView !== "timeGridWeek") return;
    let resizeObserver: ResizeObserver | null = null;
    let scrollerEl: Element | null = null;
    let onScroll: ((e: Event) => void) | null = null;
    let mounted = true;

    const timer = setTimeout(() => {
      if (!mounted) return;
      const calendarEl = document.querySelector(".calendar-wrapper");
      if (!calendarEl) return;
      const timeGridBody = calendarEl.querySelector(".fc-timegrid-body");
      scrollerEl = timeGridBody?.closest(".fc-scroller") || null;
      const headerElement = calendarEl.querySelector(".fc-col-header");
      if (!scrollerEl || !timeGridBody) return;

      onScroll = (e: Event) => {
        if (sidebarScrollRef.current) {
          sidebarScrollRef.current.scrollTop = (
            e.target as HTMLElement
          ).scrollTop;
        }
      };
      scrollerEl.addEventListener("scroll", onScroll);

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === timeGridBody) setGridHeight(entry.contentRect.height);
          if (entry.target === headerElement) setHeaderHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(timeGridBody);
      if (headerElement) resizeObserver.observe(headerElement);
      setGridHeight(timeGridBody.getBoundingClientRect().height);
      if (headerElement) setHeaderHeight(headerElement.getBoundingClientRect().height);
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      if (scrollerEl && onScroll) scrollerEl.removeEventListener("scroll", onScroll);
    };
  }, [currentView, value, events]);

  const minHour = value[0];
  const maxHour = value[1];
  const totalHours = Math.max(1, maxHour - minHour);

  const getPercent = (start: number, end: number) => {
    const s = Math.max(minHour, start);
    const e = Math.min(maxHour, end);
    const h = Math.max(0, e - s);
    return (h / totalHours) * 100;
  };

  const heights = {
    manha: getPercent(0, 12),
    tarde: getPercent(12, 18),
    noite: getPercent(18, 24),
  };

  const [currentDateTitle, setCurrentDateTitle] = useState("");
  const { toast } = useToast();
  const supabase = createClient();

  const [modal, setModal] = useState<EventModalState>({
    isOpen: false,
    mode: "create",
    title: "",
    description: "",
    start: "",
    end: "",
    colorId: "11",
    recurrenceRule: "NONE",
    recurrenceDays: [],
  });

  const ICON_THEMES: {
    [key: string]: { bg: string; border: string; text: string };
  } = {
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

  const getProviderToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.provider_token;
  };

  const fetchGoogleEvents = async (start: string, end: string) => {
    try {
      const providerToken = await getProviderToken();
      if (!providerToken) return [];
      const params = new URLSearchParams({ start, end });
      const res = await fetch(`/api/calendar?${params.toString()}`, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      const rawData = (await res.json()) as GoogleCalendarEvent[];
      return rawData.map((event) => ({
        id: event.id,
        title: event.summary || "Sem título",
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        allDay: !event.start.dateTime,
        extendedProps: {
          description: event.description,
          theme: event.colorId ? ICON_THEMES[event.colorId] : ICON_THEMES["11"],
          colorId: event.colorId || "11",
          recurringEventId: event.recurringEventId, // CAPTURA O ID DO EVENTO REPETIDO
        },
      }));
    } catch {
      return [];
    }
  };

  const buildRecurrenceRule = () => {
    if (modal.recurrenceRule === "DAILY") return ["RRULE:FREQ=DAILY"];
    else if (
      modal.recurrenceRule === "WEEKLY" &&
      modal.recurrenceDays &&
      modal.recurrenceDays.length > 0
    ) {
      return [`RRULE:FREQ=WEEKLY;BYDAY=${modal.recurrenceDays.join(",")}`];
    }
    return undefined;
  };

  const handleCreateEvent = async () => {
    try {
      setLoading(true);
      const token = await getProviderToken();
      if (!token) throw new Error("Não autenticado");

      const recurrence = buildRecurrenceRule();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: modal.title,
          description: modal.description,
          start: modal.start,
          end: modal.end,
          colorId: modal.colorId,
          timeZone: userTimeZone,
          ...(recurrence && { recurrence }),
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar evento");
      toast({ title: "Evento criado com sucesso!" });
      setModal({ ...modal, isOpen: false });
      refreshCalendar();
    } catch {
      toast({ title: "Erro ao criar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (id: string, updates: CalendarEventUpdate) => {
    try {
      setLoading(true);
      const token = await getProviderToken();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const payload = {
        ...updates,
        colorId: updates.colorId || modal.colorId,
        timeZone: userTimeZone,
        updateMode: modal.updateMode, // Envia o modo escolhido
        recurringEventId: modal.recurringEventId, // Envia o ID mestre
      };

      const res = await fetch(`/api/calendar?eventId=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao atualizar");
      toast({ title: "Evento atualizado!" });
      if (modal.isOpen) setModal({ ...modal, isOpen: false });
      refreshCalendar();
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      refreshCalendar();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    try {
      setLoading(true);
      const token = await getProviderToken();
      const res = await fetch(`/api/calendar?eventId=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao excluir");
      toast({ title: "Evento excluído!" });
      setModal({ ...modal, isOpen: false });
      refreshCalendar();
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectInfo: CalendarSelectInfo) => {
    setModal({
      isOpen: true,
      mode: "create",
      title: "",
      description: "",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      colorId: "11",
      recurrenceRule: "NONE",
      recurrenceDays: [],
    });
  };

  const handleEventDrop = (info: CalendarEventMoveInfo) => {
    handleUpdateEvent(info.event.id, {
      start: info.event.startStr,
      end: info.event.endStr || info.event.startStr,
      updateMode: "this", // Drops e resizes aplicam-se por defeito só ao evento atual
    });
  };

  const handleEventResize = (info: CalendarEventMoveInfo) => {
    handleUpdateEvent(info.event.id, {
      start: info.event.startStr,
      end: info.event.endStr || info.event.startStr,
      updateMode: "this",
    });
  };

  const refreshCalendar = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      handleDatesSet({
        view: calendarApi.view,
        startStr: calendarApi.view.activeStart.toISOString(),
        endStr: calendarApi.view.activeEnd.toISOString(),
      });
    }
  };

  const handleDatesSet = async (dateInfo: CalendarDatesSetInfo) => {
    setLoading(true);
    setCurrentDateTitle(dateInfo.view.title);
    const googleEvents = await fetchGoogleEvents(
      dateInfo.startStr,
      dateInfo.endStr,
    );
    setEvents(googleEvents);
    setLoading(false);
  };

  return (
    <div className="relative mx-32 mt-15 flex h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background/30 text-foreground shadow-glow glass">
      <header className="flex flex-col items-center justify-between gap-4 border-b border-border bg-third/40 px-6 py-3 backdrop-blur-md md:flex-row">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow transition-transform hover:scale-110">
              <CalendarIcon size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gradient capitalize">
              {currentDateTitle}
            </span>
          </div>

          <div className="ml-4 flex items-center gap-1 rounded-xl border border-border bg-background-secondary p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => calendarRef.current?.getApi().prev()}
              className="h-9 w-9 text-font hover:bg-font/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => calendarRef.current?.getApi().today()}
              className="h-9 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 px-4 font-semibold transition-all"
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => calendarRef.current?.getApi().next()}
              className="h-9 w-9 text-font hover:bg-font/10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="mx-auto grid w-full max-w-xs gap-2">
              <div className="flex items-center justify-center mr-6 gap-2">
                <Label htmlFor="slider-demo-temperature text-center">
                  <IconSun className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                  Time
                </Label>
              </div>
              <div className="flex w-42 items-center space-x-2">
                <span className="text-muted-foreground text-sm">
                  {value[0]}:00
                </span>
                <Slider
                  id="slider-demo-temperature"
                  value={value}
                  onValueChange={setValue}
                  min={0}
                  max={24}
                  step={1}
                />
                <span className="text-muted-foreground text-sm">
                  {value[1]}:00
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              // Quando clica no botão externo, inicializa a data/hora agora até +1h
              const now = new Date();
              const end = new Date(now.getTime() + 60 * 60 * 1000);
              setModal({
                isOpen: true,
                mode: "create",
                title: "",
                description: "",
                start: now.toISOString(),
                end: end.toISOString(),
                colorId: "11",
                recurrenceRule: "NONE",
                recurrenceDays: [],
              });
            }}
            className="hidden h-10 rounded-xl border border-border px-6 font-bold text-font shadow-lg gradient-primary hover:opacity-90 md:flex"
          >
            <Plus className="w-5 h-5 mr-1" /> Novo Evento
          </Button>

          <div className="flex rounded-xl border border-border bg-background-secondary p-1.5">
            {["timeGridWeek", "dayGridMonth"].map((view) => (
              <button
                key={view}
                onClick={() => {
                  calendarRef.current?.getApi().changeView(view);
                  setCurrentView(view);
                }}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300",
                  currentView === view
                    ? "scale-105 text-font shadow-md gradient-primary"
                    : "text-font/55 hover:bg-font/5 hover:text-font",
                )}
              >
                {view === "timeGridWeek" && "Semana"}
                {view === "dayGridMonth" && "Mês"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div
        className={cn(
          "flex-1 relative p-4 calendar-wrapper overflow-hidden flex flex-row",
          styles.calendarWrapper,
        )}
      >
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 animate-spin text-primary shadow-glow" />
          </div>
        )}

        {currentView === "timeGridWeek" && (
          <div className="relative z-10 mr-1 hidden w-20 shrink-0 flex-col border-r border-border md:flex">
            <div
              style={{
                height: headerHeight > 0 ? `${headerHeight}px` : "50px",
              }}
              className="w-full shrink-0 border-b border-border transition-all duration-200"
            />
            <div
              ref={sidebarScrollRef}
              className="flex-1 overflow-hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div
                style={{ height: gridHeight > 0 ? `${gridHeight}px` : "100%" }}
                className="w-full flex flex-col transition-all duration-200"
              >
                {heights.manha > 0 && (
                  <div
                    style={{ height: `${heights.manha}%` }}
                    className="flex w-full flex-col items-center justify-center gap-2 border-b border-border text-font/45"
                  >
                    <Sunrise className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      Manhã
                    </span>
                  </div>
                )}
                {heights.tarde > 0 && (
                  <div
                    style={{ height: `${heights.tarde}%` }}
                    className="flex w-full flex-col items-center justify-center gap-2 border-b border-border text-font/45"
                  >
                    <Sun className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      Tarde
                    </span>
                  </div>
                )}
                {heights.noite > 0 && (
                  <div
                    style={{ height: `${heights.noite}%` }}
                    className="flex w-full flex-col items-center justify-center gap-2 border-b border-border text-font/45"
                  >
                    <Moon className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      Noite
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0 relative h-full">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            dayHeaderContent={(args) => {
              const dayName = args.date.toLocaleDateString("pt-BR", {
                weekday: "long",
              });
              const shortDay =
                dayName.charAt(0).toUpperCase() + dayName.slice(1, 3);
              return (
                <div className="flex items-center gap-1 pb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    {shortDay}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-bold w-7 h-7 flex items-center justify-center rounded-sm transition-all",
                      args.isToday
                        ? "bg-primary text-font shadow-glow"
                        : "text-slate-300",
                    )}
                  >
                    {args.date.getDate()}
                  </span>
                </div>
              );
            }}
            initialView="timeGridWeek"
            headerToolbar={false}
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            nowIndicator={true}
            locale="pt-br"
            height="100%"
            showNonCurrentDates={false}
            fixedWeekCount={false}
            expandRows={true}
            allDaySlot={false}
            dayMaxEvents={true}
            moreLinkContent={(args) => `+${args.num}`}
            select={handleDateSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            slotMinTime={`${value[0]}:00:00`}
            slotMaxTime={`${value[1]}:00:00`}
            eventDidMount={(info) => {
              const theme = info.event.extendedProps.theme;
              if (theme) {
                const el = info.el;
                if (info.view.type === "dayGridMonth") {
                  el.style.setProperty(
                    "background-color",
                    "transparent",
                    "important",
                  );
                  el.style.setProperty("border", "none", "important");
                  el.style.setProperty("padding", "2px 4px", "important");
                  const dot = el.querySelector(
                    ".fc-daygrid-event-dot",
                  ) as HTMLElement;
                  if (dot) {
                    dot.style.display = "inline-block";
                    dot.style.borderColor = theme.text;
                    dot.style.borderWidth = "4px";
                    dot.style.marginRight = "8px";
                  }
                  const titleEl = el.querySelector(
                    ".fc-event-title",
                  ) as HTMLElement;
                  if (titleEl) {
                    titleEl.style.color = "var(--color-font)";
                    titleEl.style.fontWeight = "500";
                  }
                } else {
                  el.style.setProperty(
                    "background-color",
                    theme.bg,
                    "important",
                  );
                  el.style.setProperty(
                    "border",
                    `1px solid ${theme.text}`,
                    "important",
                  );
                  el.style.setProperty("color", theme.text, "important");
                  el.style.borderRadius = "12px";
                  const titleEl = el.querySelector(
                    ".fc-event-title",
                  ) as HTMLElement;
                  if (titleEl) titleEl.style.color = theme.text;
                  const timeEl = el.querySelector(
                    ".fc-event-time",
                  ) as HTMLElement;
                  if (timeEl) timeEl.style.color = theme.text;
                  const dot = el.querySelector(
                    ".fc-daygrid-event-dot",
                  ) as HTMLElement;
                  if (dot) dot.style.display = "none";
                }
              }
            }}
            eventClick={(info) =>
              setModal({
                isOpen: true,
                mode: "edit",
                id: info.event.id,
                title: info.event.title,
                description: info.event.extendedProps.description || "",
                start: info.event.startStr,
                end: info.event.endStr || info.event.startStr,
                colorId: info.event.extendedProps.colorId || "11",
                recurringEventId: info.event.extendedProps.recurringEventId, // Puxa do Google API
                updateMode: "this", // Padrão: atualizar só a instância
              })
            }
            datesSet={handleDatesSet}
          />
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-third/80 p-4 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="max-h-screen w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-background-secondary p-8 shadow-2xl glass">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gradient">
                {modal.mode === "create" ? "Novo Evento" : "Editar Evento"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="rounded-full text-font/55 hover:text-font"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                  Título
                </label>
                <input
                  type="text"
                  value={modal.title}
                  onChange={(e) =>
                    setModal({ ...modal, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-third/60 px-4 py-3 text-font shadow-inner outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                  placeholder="Nome do compromisso..."
                  autoFocus
                />
              </div>

              {/* CAMPOS DE DATA E HORA INSERIDOS AQUI */}
              <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(modal.start)}
                    onChange={(e) => {
                      if (e.target.value)
                        setModal({
                          ...modal,
                          start: new Date(e.target.value).toISOString(),
                        });
                    }}
                    className="w-full rounded-xl border border-border bg-third/60 px-4 py-3 text-font shadow-inner outline-none transition-all focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                    Fim
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(modal.end)}
                    onChange={(e) => {
                      if (e.target.value)
                        setModal({
                          ...modal,
                          end: new Date(e.target.value).toISOString(),
                        });
                    }}
                    className="w-full rounded-xl border border-border bg-third/60 px-4 py-3 text-font shadow-inner outline-none transition-all focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                  Cor do Evento
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ICON_THEMES).map(([id, theme]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setModal({ ...modal, colorId: id })}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${modal.colorId === id ? "scale-110 ring-2 ring-offset-2 ring-offset-third" : "hover:scale-105"}`}
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        borderWidth: "1px",
                      }}
                    >
                      {modal.colorId === id && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.text }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* MODO EDIÇÃO PARA EVENTOS REPETIDOS */}
              {modal.mode === "edit" && modal.recurringEventId && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 ml-1 uppercase text-yellow-500">
                    Evento Repetido
                  </label>
                  <select
                    value={modal.updateMode}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        updateMode: e.target.value as CalendarUpdateMode,
                      })
                    }
                    className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-400 focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                  >
                    <option value="this" className="bg-background text-font">
                      Apenas este evento
                    </option>
                    <option
                      value="following"
                      className="bg-background text-font"
                    >
                      Este e os seguintes
                    </option>
                    <option value="all" className="bg-background text-font">
                      Todos os eventos
                    </option>
                  </select>
                </div>
              )}

              {modal.mode === "create" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                      Repetição
                    </label>
                    <select
                      value={modal.recurrenceRule}
                      onChange={(e) =>
                        setModal({ ...modal, recurrenceRule: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-third/60 px-4 py-3 text-font shadow-inner outline-none transition-all focus:ring-2 focus:ring-primary"
                    >
                      <option value="NONE" className="bg-background">
                        Não se repete
                      </option>
                      <option value="DAILY" className="bg-background">
                        Todos os dias
                      </option>
                      <option value="WEEKLY" className="bg-background">
                        Semanalmente (Escolher dias)
                      </option>
                    </select>
                  </div>

                  {modal.recurrenceRule === "WEEKLY" && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                        Repetir nos dias
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              const days = modal.recurrenceDays || [];
                              const isSelected = days.includes(day.value);
                              const newDays = isSelected
                                ? days.filter((d) => d !== day.value)
                                : [...days, day.value];
                              setModal({ ...modal, recurrenceDays: newDays });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              (modal.recurrenceDays || []).includes(day.value)
                                ? "border border-primary bg-primary text-font shadow-glow"
                                : "border border-border bg-third/60 text-font/55 hover:bg-font/5"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                  Descrição
                </label>
                <textarea
                  value={modal.description}
                  onChange={(e) =>
                    setModal({ ...modal, description: e.target.value })
                  }
                  className="h-32 w-full resize-none rounded-xl border border-border bg-third/60 px-4 py-3 text-font shadow-inner outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                  placeholder="Detalhes adicionais..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                {modal.mode === "edit" && modal.id && (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => handleDeleteEvent(modal.id!)}
                    className="mr-auto rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="text-font/55 hover:text-font"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={
                    modal.mode === "create"
                      ? handleCreateEvent
                      : () =>
                          handleUpdateEvent(modal.id!, {
                            title: modal.title,
                            description: modal.description,
                            start: modal.start,
                            end: modal.end,
                            colorId: modal.colorId,
                          })
                  }
                  className="rounded-xl px-8 font-bold text-font shadow-glow gradient-primary"
                >
                  {modal.mode === "create" ? "Criar" : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
