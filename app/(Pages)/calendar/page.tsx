"use client";

import { useState, useRef } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface EventModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  id?: string;
  title: string;
  description: string;
  start: string;
  end: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  // 1. MUDANÇA: Estado inicial agora é a Semana
  const [currentView, setCurrentView] = useState("timeGridWeek");

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
  });

  const ICON_THEMES: {
    [key: string]: { bg: string; border: string; text: string };
  } = {
    "1": {
      bg: "rgba(99, 102, 241, 0.1)",
      border: "rgba(99, 102, 241, 0.2)",
      text: "#818cf8",
    },
    "2": {
      bg: "rgba(34, 197, 94, 0.1)",
      border: "rgba(34, 197, 94, 0.2)",
      text: "#4ade80",
    },
    "3": {
      bg: "rgba(168, 85, 247, 0.1)",
      border: "rgba(168, 85, 247, 0.2)",
      text: "#c084fc",
    },
    "4": {
      bg: "rgba(244, 63, 94, 0.1)",
      border: "rgba(244, 63, 94, 0.2)",
      text: "#fb7185",
    },
    "5": {
      bg: "rgba(245, 158, 11, 0.1)",
      border: "rgba(245, 158, 11, 0.2)",
      text: "#fbbf24",
    },
    "6": {
      bg: "rgba(239, 68, 68, 0.1)",
      border: "rgba(239, 68, 68, 0.2)",
      text: "#f87171",
    },
    "7": {
      bg: "rgba(14, 165, 233, 0.1)",
      border: "rgba(14, 165, 233, 0.2)",
      text: "#7dd3fc",
    },
    "8": {
      bg: "rgba(100, 116, 139, 0.1)",
      border: "rgba(100, 116, 139, 0.2)",
      text: "#94a3b8",
    },
    "9": {
      bg: "rgba(59, 130, 246, 0.1)",
      border: "rgba(59, 130, 246, 0.2)",
      text: "#60a5fa",
    },
    "10": {
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.2)",
      text: "#34d399",
    },
    "11": {
      bg: "rgba(124, 58, 237, 0.1)",
      border: "rgba(124, 58, 237, 0.2)",
      text: "#a78bfa",
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
      const rawData = await res.json();
      return rawData.map((event: any) => ({
        id: event.id,
        title: event.summary || "Sem título",
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        allDay: !event.start.dateTime,
        extendedProps: {
          description: event.description,
          theme: event.colorId ? ICON_THEMES[event.colorId] : ICON_THEMES["11"],
        },
      }));
    } catch {
      return [];
    }
  };

  const handleCreateEvent = async () => {
    try {
      setLoading(true);
      const token = await getProviderToken();
      if (!token) throw new Error("Não autenticado");

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
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar evento");
      toast({ title: "Evento criado com sucesso!" });
      setModal({ ...modal, isOpen: false });
      refreshCalendar();
    } catch (error) {
      toast({ title: "Erro ao criar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (id: string, updates: any) => {
    try {
      setLoading(true);
      const token = await getProviderToken();
      const res = await fetch(`/api/calendar?eventId=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Erro ao atualizar");
      toast({ title: "Evento atualizado!" });
      if (modal.isOpen) setModal({ ...modal, isOpen: false });
      refreshCalendar();
    } catch (error) {
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
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setModal({
      isOpen: true,
      mode: "create",
      title: "",
      description: "",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
  };

  const handleEventDrop = (info: any) => {
    handleUpdateEvent(info.event.id, {
      start: info.event.startStr,
      end: info.event.endStr || info.event.startStr,
    });
  };

  const handleEventResize = (info: any) => {
    handleUpdateEvent(info.event.id, {
      start: info.event.startStr,
      end: info.event.endStr || info.event.startStr,
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

  const handleDatesSet = async (dateInfo: any) => {
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
    <div className="h-full my-8 mx-4 md:mx-16 flex flex-col rounded-2xl glass text-foreground shadow-glow border border-white/10 relative overflow-hidden bg-background/30">
      <header className="flex flex-col md:flex-row items-center justify-between px-6 py-6 border-b border-white/10 gap-4 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(145,36,255,0.1)] transition-transform hover:scale-110">
              <CalendarIcon size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gradient capitalize">
              {currentDateTitle}
            </span>
          </div>

          <div className="flex items-center gap-1 ml-4 bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => calendarRef.current?.getApi().prev()}
              className="h-9 w-9 hover:bg-white/10 text-white"
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
              className="h-9 w-9 hover:bg-white/10 text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() =>
              setModal({
                isOpen: true,
                mode: "create",
                title: "",
                description: "",
                start: new Date().toISOString(),
                end: new Date(Date.now() + 3600000).toISOString(),
              })
            }
            className="hidden md:flex gradient-primary hover:opacity-90 text-white h-10 px-6 rounded-xl shadow-lg font-bold border border-white/10"
          >
            <Plus className="w-5 h-5 mr-1" /> Novo Evento
          </Button>

          <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
            {/* 2. MUDANÇA: Opção Dia removida do array */}
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
                    ? "gradient-primary text-white shadow-md scale-105"
                    : "text-gray-400 hover:text-white hover:bg-white/5",
                )}
              >
                {view === "timeGridWeek" && "Semana"}
                {view === "dayGridMonth" && "Mês"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 relative p-4 calendar-wrapper overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 animate-spin text-primary shadow-glow" />
          </div>
        )}

        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          /* 3. MUDANÇA: View inicial definida para a Semana */
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
          dayMaxEvents={true}
          moreLinkContent={(args) => `+${args.num}`}
          select={handleDateSelect}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
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
                el.style.setProperty(
                  "border-left",
                  `3px solid ${theme.text}`,
                  "important",
                );
                el.style.setProperty("color", theme.text, "important");
                el.style.borderRadius = "4px";
                el.style.paddingLeft = "6px";
              } else {
                el.style.setProperty("background-color", theme.bg, "important");
                el.style.setProperty(
                  "border",
                  `1px solid ${theme.text}`,
                  "important",
                );
                el.style.setProperty("color", theme.text, "important");
                el.style.borderRadius = "12px";
              }

              const titleEl = el.querySelector(
                ".fc-event-title",
              ) as HTMLElement;
              if (titleEl) titleEl.style.color = theme.text;

              const timeEl = el.querySelector(".fc-event-time") as HTMLElement;
              if (timeEl) timeEl.style.color = theme.text;

              const dot = el.querySelector(
                ".fc-daygrid-event-dot",
              ) as HTMLElement;
              if (dot) dot.style.display = "none";
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
            })
          }
          datesSet={handleDatesSet}
        />
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 glass">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gradient">
                {modal.mode === "create" ? "Novo Evento" : "Editar Evento"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="text-gray-400 hover:text-white rounded-full"
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
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner placeholder:text-gray-600"
                  placeholder="Nome do compromisso..."
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                  Descrição
                </label>
                <textarea
                  value={modal.description}
                  onChange={(e) =>
                    setModal({ ...modal, description: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none h-32 resize-none shadow-inner placeholder:text-gray-600"
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
                  className="text-gray-400 hover:text-white"
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
                          })
                  }
                  className="gradient-primary rounded-xl px-8 shadow-glow font-bold text-white"
                >
                  {modal.mode === "create" ? "Criar" : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .calendar-wrapper .fc {
          --fc-border-color: rgba(255, 255, 255, 0.03);
          --fc-today-bg-color: rgba(145, 36, 255, 0.05);
          background: transparent;
        }

        .fc-theme-standard .fc-scrollgrid {
          border: none !important;
        }

        .fc-event,
        .fc-timegrid-event {
          padding: 4px 8px !important;
          margin: 2px 4px !important;
          cursor: pointer;
          transition: all 0.2s ease !important;
          background-clip: padding-box;
        }

        .fc-v-event .fc-event-main,
        .fc-event-title,
        .fc-event-time {
          color: inherit !important;
          font-weight: 700 !important;
          font-size: 0.75rem !important;
        }

        .fc-event:hover {
          transform: scale(1.02) !important;
          filter: brightness(1.2);
          z-index: 50;
        }

        .fc-col-header-cell-cushion {
          color: #64748b !important;
          font-weight: 800 !important;
          font-size: 0.65rem;
          padding: 15px 0 !important;
          text-transform: uppercase;
        }

        .fc-daygrid-day-number {
          color: #94a3b8;
          font-size: 0.8rem;
          padding: 12px !important;
          font-weight: 600;
        }

        .fc-timegrid-event {
          border-radius: 12px !important;
          box-shadow: none !important;
          padding: 6px 10px !important;
        }

        .fc-timegrid-event:hover {
          transform: scale(1.05) !important;
        }

        .fc-timegrid-slot-label-cushion {
          color: #64748b;
          font-size: 0.7rem;
        }

        .fc-daygrid-more-link {
          font-size: 0.7rem;
          font-weight: bold;
          color: #64748b !important;
          padding-left: 8px;
        }
        .fc-daygrid-more-link:hover {
          color: var(--color-primary) !important;
          background: transparent !important;
        }

        /* --- ESTILOS DO POPOVER (Eventos Extras) --- */
        .fc-theme-standard .fc-popover {
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
          z-index: 100 !important;
          overflow: hidden;
        }

        .fc-theme-standard .fc-popover-header {
          background: rgba(0, 0, 0, 0.2) !important;
          color: #f8fafc !important;
          padding: 12px 16px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }

        .fc-theme-standard .fc-popover-title {
          font-weight: 700 !important;
          font-size: 0.85rem !important;
          letter-spacing: 0.02em;
        }

        .fc-popover-close {
          color: #94a3b8 !important;
          opacity: 1 !important;
          transition: color 0.2s ease !important;
          cursor: pointer;
        }

        .fc-popover-close:hover {
          color: #ffffff !important;
          background: transparent !important;
        }

        .fc-theme-standard .fc-popover-body {
          padding: 12px !important;
          background: transparent !important;
        }

        .fc-popover-body .fc-daygrid-event-harness {
          margin-bottom: 6px !important;
        }
      `}</style>
    </div>
  );
}
