// app/api/calendar/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const GOOGLE_CALENDAR_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

interface CalendarRequestBody {
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  timeZone?: string;
  colorId?: string;
  recurrence?: string[];
  updateMode?: "this" | "all" | "following";
  recurringEventId?: string;
}

interface GoogleCalendarEventPayload {
  summary?: string;
  description?: string;
  start?: { dateTime?: string; timeZone: string };
  end?: { dateTime?: string; timeZone: string };
  colorId?: string;
  recurrence?: string[];
}

// Helper simples para pegar o token que o frontend enviou
function getTokenFromHeader(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
}

async function validateRequest(request: Request) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

// LISTAR EVENTOS (GET)
export async function GET(request: Request) {
  const validationError = await validateRequest(request);
  if (validationError) return validationError;

  const token = getTokenFromHeader(request);
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start") || new Date().toISOString();
  const end =
    searchParams.get("end") ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const url = new URL(GOOGLE_CALENDAR_URL);
    url.searchParams.append("timeMin", start);
    url.searchParams.append("timeMax", end);
    url.searchParams.append("singleEvents", "true");
    url.searchParams.append("orderBy", "startTime");
    url.searchParams.append("maxResults", "2500");

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error("Google API Error", response.status);
      throw new Error("Failed to fetch from Google");
    }

    const data = await response.json();
    return NextResponse.json(data.items);
  } catch (error) {
    console.error("GET Route Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// CRIAR EVENTO (POST)
export async function POST(request: Request) {
  const validationError = await validateRequest(request);
  if (validationError) return validationError;

  const token = getTokenFromHeader(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CalendarRequestBody;

    // Fallback para um timezone padrão caso não venha no body
    const timeZone = body.timeZone || "America/Sao_Paulo";

    const event: GoogleCalendarEventPayload = {
      summary: body.title,
      description: body.description,
      // O Google exige o timeZone quando há recurrence!
      start: { dateTime: body.start, timeZone },
      end: { dateTime: body.end, timeZone },
    };

    if (body.colorId) event.colorId = body.colorId;
    if (body.recurrence) event.recurrence = body.recurrence;

    const response = await fetch(GOOGLE_CALENDAR_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error("Google API Error", response.status);
      throw new Error("Failed to create event");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("POST Route Error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

// ATUALIZAR EVENTO (PATCH)
export async function PATCH(request: Request) {
  const validationError = await validateRequest(request);
  if (validationError) return validationError;

  const token = getTokenFromHeader(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const body = (await request.json()) as CalendarRequestBody;

    if (!eventId)
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

    const timeZone = body.timeZone || "America/Sao_Paulo";
    const eventUpdates: GoogleCalendarEventPayload = {};

    if (body.title) eventUpdates.summary = body.title;
    if (body.description) eventUpdates.description = body.description;

    if (body.start) eventUpdates.start = { dateTime: body.start, timeZone };
    if (body.end) eventUpdates.end = { dateTime: body.end, timeZone };

    if (body.colorId) eventUpdates.colorId = body.colorId;
    if (body.recurrence) eventUpdates.recurrence = body.recurrence;

    // LÓGICA DE REPETIÇÃO: Decidir qual ID atualizar
    let targetEventId = eventId;

    if (body.updateMode === "all" && body.recurringEventId) {
      // Atualiza a "série" inteira (o evento mestre)
      targetEventId = body.recurringEventId;
    } else if (body.updateMode === "following" && body.recurringEventId) {
      // Nota: A API do Google Calendar é bem complexa para "Este e os seguintes"
      // via REST (exige truncar o atual e criar um novo).
      // Para fins práticos na rota simples, redirecionamos para a série ("all")
      // ou aplicamos só à instância ("this"). Aqui aplicaremos ao mestre como fallback seguro,
      // mas você pode ajustar conforme a necessidade estrita.
      targetEventId = body.recurringEventId;
    }

    const response = await fetch(`${GOOGLE_CALENDAR_URL}/${targetEventId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventUpdates),
    });

    if (!response.ok) {
      console.error("Google API Error", response.status);
      throw new Error("Failed to update event");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH Route Error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
// DELETAR EVENTO (DELETE)
export async function DELETE(request: Request) {
  const validationError = await validateRequest(request);
  if (validationError) return validationError;

  const token = getTokenFromHeader(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId)
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

    const response = await fetch(`${GOOGLE_CALENDAR_URL}/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error("Google API Error", response.status);
      throw new Error("Failed to delete event");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Route Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
