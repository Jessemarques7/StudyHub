"use client";

import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { createClient } from "@/utils/supabase/client"; // Ajuste o import conforme seu projeto
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Ajuste se usar shadcn
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [currentDateTitle, setCurrentDateTitle] = useState("");

  const supabase = createClient();

  const fetchGoogleEvents = async (start: string, end: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // NOTA: O provider_token geralmente só está disponível na sessão inicial após o login.
      // Se estiver undefined, o usuário pode precisar relogar.
      const providerToken = session?.provider_token;

      if (!providerToken) {
        console.warn(
          "Provider token não encontrado. Tente fazer logout e login novamente com Google.",
        );
        return [];
      }

      const params = new URLSearchParams({ start, end });
      const res = await fetch(`/api/calendar?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      if (!res.ok) throw new Error("Falha ao buscar eventos");
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // Hook do FullCalendar para carregar eventos quando a data muda
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

  // Controles Customizados
  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();
  const changeView = (view: string) => {
    calendarRef.current?.getApi().changeView(view);
    setCurrentView(view);
  };

  return (
    <div className="h-full my-8 mx-16 flex flex-col rounded-2xl bg-white dark:bg-slate-900 text-[#37352F] dark:text-[#D4D4D4]">
      {/* Header Estilo Notion */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#E9E9E8] dark:border-[#2F2F2F]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm font-medium">
            <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-lg font-semibold">{currentDateTitle}</span>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="h-7 w-7"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-7 text-xs font-normal text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-7 w-7"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex bg-[#F1F1EF] dark:bg-[#2F2F2F] p-0.5 rounded-md">
          {["dayGridMonth", "timeGridWeek", "timeGridDay"].map((view) => (
            <button
              key={view}
              onClick={() => changeView(view)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                currentView === view
                  ? "bg-white dark:bg-[#191919] shadow-sm text-black dark:text-white"
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
      <div className="flex-1 overflow-hidden relative p-4 calendar-wrapper">
        {loading && (
          <div className="absolute top-4 right-8 z-50">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
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
          headerToolbar={false} // Desabilitamos o header padrão para usar o nosso
          events={events}
          editable={true}
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
        .fc-col-header-cell-cushion {
          padding: 8px 0;
          font-weight: 500;
          color: #9b9a97;
          text-transform: uppercase;
          font-size: 0.75rem;
        }

        /* Eventos estilo Notion */
        .fc-event {
          border-radius: 4px;
          border: none;
          padding: 1px 2px;
          font-size: 0.8rem;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* TimeGrid Slots */
        .fc-timegrid-slot {
          height: 3rem; /* Slots mais altos */
        }
        .fc-timegrid-slot-label {
          font-size: 0.75rem;
          color: #9b9a97;
          font-weight: 400;
        }

        /* Indicador de Agora */
        .fc-now-indicator-line {
          border-color: #eb5757;
          border-width: 2px;
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
