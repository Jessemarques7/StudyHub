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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast"; // Importando para feedback visual

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [currentDateTitle, setCurrentDateTitle] = useState("");
  const { toast } = useToast();

  const supabase = createClient();

  // 1. Dicionário de Cores Oficiais do Google Calendar
  const GOOGLE_COLORS: { [key: string]: string } = {
    "1": "#7986cb", // Lavender
    "2": "#33b679", // Sage
    "3": "#8e24aa", // Grape
    "4": "#e67c73", // Flamingo
    "5": "#f6bf26", // Banana
    "6": "#f4511e", // Tangerine
    "7": "#039be5", // Peacock (Azul Padrão)
    "8": "#616161", // Graphite
    "9": "#3f51b5", // Blueberry
    "10": "#0b8043", // Basil
    "11": "#d50000", // Tomato
  };

  const fetchGoogleEvents = async (start: string, end: string) => {
    try {
      // ... (código de pegar sessão e token igual ao anterior) ...
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const providerToken = session?.provider_token;

      if (!providerToken) return [];

      const params = new URLSearchParams({ start, end });
      const res = await fetch(`/api/calendar?${params.toString()}`, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });

      if (!res.ok) throw new Error("Falha ao buscar eventos");

      const rawData = await res.json();

      // 2. Mapeamento Atualizado com Cores
      const mappedEvents = rawData.map((event: any) => {
        // Tenta pegar a cor pelo ID, se não tiver, usa o Azul Padrão (#039BE5)
        const eventColor = event.colorId
          ? GOOGLE_COLORS[event.colorId]
          : "#039BE5";

        return {
          id: event.id,
          title: event.summary || "Sem título",
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          allDay: !event.start.dateTime,

          // Aplica a cor dinâmica
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: "#ffffff", // Texto branco sempre fica bom nessas cores

          extendedProps: {
            description: event.description,
            location: event.location,
          },
        };
      });

      return mappedEvents;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // const fetchGoogleEvents = async (start: string, end: string) => {
  //   try {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();

  //     const providerToken = session?.provider_token;

  //     if (!providerToken) {
  //       console.warn("Provider token não encontrado.");
  //       return [];
  //     }

  //     const params = new URLSearchParams({ start, end });
  //     const res = await fetch(`/api/calendar?${params.toString()}`, {
  //       headers: {
  //         Authorization: `Bearer ${providerToken}`,
  //       },
  //     });

  //     if (!res.ok) {
  //       const errorData = await res.json().catch(() => ({}));
  //       console.error("Erro API Calendar:", res.status, errorData);
  //       throw new Error("Falha ao buscar eventos");
  //     }

  //     const rawData = await res.json();

  //     // --- CORREÇÃO IMPORTANTE: Mapeamento Google -> FullCalendar ---
  //     const mappedEvents = rawData.map((event: any) => ({
  //       id: event.id,
  //       title: event.summary || "Sem título", // Google usa 'summary', FullCalendar usa 'title'
  //       start: event.start.dateTime || event.start.date, // dateTime para horas específicas, date para dia todo
  //       end: event.end.dateTime || event.end.date,
  //       allDay: !event.start.dateTime, // Se não tiver hora, é dia todo
  //       // Estilização Opcional (Estilo Notion)
  //       backgroundColor: "#4285F4",
  //       borderColor: "#4285F4",
  //       textColor: "#ffffff",
  //       classNames: ["notion-calendar-event"], // Para estilizarmos no CSS abaixo
  //       extendedProps: {
  //         description: event.description,
  //         location: event.location,
  //       },
  //     }));

  //     return mappedEvents;
  //   } catch (error) {
  //     console.error(error);
  //     toast({
  //       title: "Erro ao carregar calendário",
  //       description: "Tente fazer logout e login novamente com o Google.",
  //       variant: "destructive",
  //     });
  //     return [];
  //   }
  // };

  // Hook do FullCalendar para carregar eventos quando a data muda
  const handleDatesSet = async (dateInfo: any) => {
    // Evita loop infinito ou chamadas desnecessárias se o componente não estiver montado
    if (!calendarRef.current) return;

    setLoading(true);
    setCurrentDateTitle(dateInfo.view.title);

    const googleEvents = await fetchGoogleEvents(
      dateInfo.startStr,
      dateInfo.endStr,
    );

    setEvents(googleEvents);
    setLoading(false);
  };

  // Controles Customizados
  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();
  const changeView = (view: string) => {
    calendarRef.current?.getApi().changeView(view);
    setCurrentView(view);
  };

  return (
    <div className="h-full my-8 mx-4 md:mx-16 flex flex-col rounded-2xl bg-white dark:bg-slate-900 text-[#37352F] dark:text-[#D4D4D4] shadow-sm border border-gray-200 dark:border-gray-800">
      {/* Header Estilo Notion */}
      <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-[#E9E9E8] dark:border-[#2F2F2F] gap-4">
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

        <div className="flex bg-[#F1F1EF] dark:bg-[#202020] p-1 rounded-md w-full md:w-auto">
          {["dayGridMonth", "timeGridWeek", "timeGridDay"].map((view) => (
            <button
              key={view}
              onClick={() => changeView(view)}
              className={cn(
                "flex-1 md:flex-none px-3 py-1.5 text-xs font-medium rounded-sm transition-all duration-200",
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
      </header>

      {/* Área do Calendário */}
      <div className="flex-1 overflow-hidden relative p-0 calendar-wrapper">
        {loading && (
          <div className="absolute top-4 right-8 z-50 bg-white/80 dark:bg-black/80 p-2 rounded-full shadow-sm">
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
          editable={false} // Google Calendar é read-only por enquanto nesta integração
          selectable={true}
          datesSet={handleDatesSet}
          height="100%"
          locale="pt-br"
          dayMaxEvents={true}
          nowIndicator={true}
          allDayText="Dia todo"
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

      {/* Estilos Globais para Override do FullCalendar (Notion Style) */}
      <style jsx global>{`
        /* Remove bordas e backgrounds padrão */
        .calendar-wrapper .fc {
          font-family:
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            "Helvetica Neue",
            Arial,
            sans-serif;
          --fc-border-color: #e9e9e8;
          --fc-today-bg-color: transparent;
          --fc-neutral-bg-color: #f7f7f5;
        }
        .dark .calendar-wrapper .fc {
          --fc-border-color: #2f2f2f;
          --fc-neutral-bg-color: #202020;
        }

        /* Grid limpo */
        .fc-theme-standard td,
        .fc-theme-standard th {
          border: 1px solid var(--fc-border-color);
        }

        /* Headers dos dias */
        .fc-col-header-cell-cushion {
          padding: 12px 0;
          font-weight: 600;
          color: #9b9a97;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
        }

        /* Números dos dias */
        .fc-daygrid-day-number {
          font-size: 0.85rem;
          color: #37352f;
          padding: 8px;
          font-weight: 500;
        }
        .dark .fc-daygrid-day-number {
          color: #d4d4d4;
        }

        /* Eventos estilo Notion */
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

        /* Nossa classe customizada para eventos */
        .notion-calendar-event {
          background-color: rgba(235, 87, 87, 0.15); /* Vermelho Notion leve */
          color: #eb5757;
          border-left: 3px solid #eb5757;
        }

        .dark .notion-calendar-event {
          background-color: rgba(235, 87, 87, 0.25);
          color: #ff8080;
        }

        /* TimeGrid Slots */
        .fc-timegrid-slot {
          height: 3rem;
        }
        .fc-timegrid-slot-label {
          font-size: 0.7rem;
          color: #9b9a97;
          font-weight: 400;
        }

        /* Indicador de Agora */
        .fc-now-indicator-line {
          border-color: #eb5757;
          border-width: 2px;
          z-index: 10;
        }
        .fc-now-indicator-arrow {
          border-color: #eb5757;
          border-width: 5px;
        }

        /* Scrollbars finas */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
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
