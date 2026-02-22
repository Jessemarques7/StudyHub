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
  const [loading, setLoading] = useState(false); // Começa false para evitar travamento inicial
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
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

  const GOOGLE_COLORS: { [key: string]: string } = {
    "1": "#7986cb",
    "2": "#33b679",
    "3": "#8e24aa",
    "4": "#e67c73",
    "5": "#f6bf26",
    "6": "#f4511e",
    "7": "#039be5",
    "8": "#616161",
    "9": "#3f51b5",
    "10": "#0b8043",
    "11": "#d50000",
  };

  // Helper para pegar token
  const getProviderToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.provider_token;
  };

  const fetchGoogleEvents = async (start: string, end: string) => {
    try {
      const providerToken = await getProviderToken();

      if (!providerToken) {
        console.warn("Token não encontrado. Logue novamente com Google.");
        return [];
      }

      const params = new URLSearchParams({ start, end });
      const res = await fetch(`/api/calendar?${params.toString()}`, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });

      if (!res.ok) throw new Error("Falha ao buscar eventos");

      const rawData = await res.json();

      return rawData.map((event: any) => {
        const eventColor = event.colorId
          ? GOOGLE_COLORS[event.colorId]
          : "#039BE5";
        return {
          id: event.id,
          title: event.summary || "Sem título",
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          allDay: !event.start.dateTime,
          backgroundColor: eventColor,
          borderColor: "#171515",
          textColor: "#171515",
          extendedProps: {
            description: event.description,
            location: event.location,
          },
        };
      });
    } catch (error) {
      console.error("Erro fetchGoogleEvents:", error);
      return [];
    }
  };

  // --- CRUD Operations ---

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
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (id: string, updates: any) => {
    try {
      setLoading(true);
      const token = await getProviderToken();
      if (!token) throw new Error("Não autenticado");

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
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    try {
      setLoading(true);
      const token = await getProviderToken();
      if (!token) throw new Error("Não autenticado");

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
      setLoading(false);
    }
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
    if (!calendarRef.current) return;
    setLoading(true);
    setCurrentDateTitle(dateInfo.view.title);

    // Executa o fetch
    const googleEvents = await fetchGoogleEvents(
      dateInfo.startStr,
      dateInfo.endStr,
    );

    setEvents(googleEvents);
    setLoading(false); // Garante que o loading pare
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

  const handleEventClick = (clickInfo: any) => {
    setModal({
      isOpen: true,
      mode: "edit",
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description || "",
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr || clickInfo.event.startStr,
    });
  };

  const handleEventDrop = (info: any) => {
    handleUpdateEvent(info.event.id, {
      start: info.event.startStr,
      end: info.event.endStr,
    });
  };

  const handleEventResize = (info: any) => {
    handleUpdateEvent(info.event.id, {
      start: info.event.startStr,
      end: info.event.endStr,
    });
  };

  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();
  const changeView = (view: string) => {
    calendarRef.current?.getApi().changeView(view);
    setCurrentView(view);
  };

  return (
    <div className="h-full my-8 mx-4 md:mx-16 flex flex-col rounded-2xl bg-white dark:bg-background text-[#37352F] dark:text-[#D4D4D4] shadow-sm border border-gray-200 dark:border-gray-800 relative">
      <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b  dark:border-[#2F2F2F] gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <span className="text-lg font-semibold capitalize">
              {currentDateTitle}
            </span>
          </div>

          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-8 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3"
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
          >
            <Plus className="w-4 h-4 mr-1" /> Novo Evento
          </Button>

          <div className="flex bg-[#F1F1EF] dark:bg-[#202020] p-1 rounded-md">
            {["dayGridMonth", "timeGridWeek", "timeGridDay"].map((view) => (
              <button
                key={view}
                onClick={() => changeView(view)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-sm transition-all duration-200",
                  currentView === view
                    ? "bg-white dark:bg-[#2F2F2F] shadow-sm text-black dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                )}
              >
                {view === "dayGridMonth" && "Mês"}
                {view === "timeGridWeek" && "Semana"}
                {view === "timeGridDay" && "Dia"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative p-0 calendar-wrapper">
        {loading && (
          <div className="absolute top-4 right-8 z-50 bg-white/80 dark:bg-black/80 p-2 rounded-full shadow-sm pointer-events-none">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
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
          initialView="dayGridMonth"
          headerToolbar={false}
          events={events}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          nowIndicator={true}
          locale="pt-br"
          allDayText="Dia todo"
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          datesSet={handleDatesSet}
          height="100%"
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            meridiem: false,
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md border  dark:border-gray-800 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {modal.mode === "create" ? "Novo Evento" : "Editar Evento"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModal({ ...modal, isOpen: false })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={modal.title}
                  onChange={(e) =>
                    setModal({ ...modal, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border    dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Reunião de Estudos"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descrição
                </label>
                <textarea
                  value={modal.description}
                  onChange={(e) =>
                    setModal({ ...modal, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Detalhes do evento..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                {modal.mode === "edit" && modal.id && (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => handleDeleteEvent(modal.id!)}
                    className="mr-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setModal({ ...modal, isOpen: false })}
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
          font-family: ui-sans-serif, system-ui, sans-serif;
          --fc-border-color: "#171515";
          --fc-today-bg-color: transparent;
          --fc-neutral-bg-color: #f7f7f5;
        }
        .dark .calendar-wrapper .fc {
          --fc-border-color: #2f2f2f;
          --fc-neutral-bg-color: #202020;
        }
        .fc-theme-standard td,
        .fc-theme-standard th {
          border: 1px solid var(--fc-border-color);
        }
        .fc-col-header-cell-cushion {
          padding: 12px 0;
          font-weight: 600;
          color: #9b9a97;
          text-transform: uppercase;
          font-size: 0.7rem;
        }
        .fc-daygrid-day-number {
          font-size: 0.85rem;
          color: #37352f;
          padding: 8px;
          font-weight: 500;
        }
        .dark .fc-daygrid-day-number {
          color: #d4d4d4;
        }
        .fc-event {
          border-radius: 3px;
          border: none;
          padding: 2px 4px;
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 1px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .fc-event:hover {
          transform: scale(1.01);
          filter: brightness(0.95);
        }

        .fc-timegrid-event {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 5px;
        }
        .fc-timegrid-slot {
          height: 3rem;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-thumb {
          background: #e3e2e0;
          border-radius: 4px;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: #37352f;
        }
      `}</style>
    </div>
  );
}
