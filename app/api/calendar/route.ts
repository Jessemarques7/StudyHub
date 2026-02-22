// import { NextResponse } from "next/server";
// import { createClient } from "@/utils/supabase/server";

// export async function GET(request: Request) {
//   const supabase = await createClient();

//   // 1. Pegar Sessão
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   // 2. Extrair o Token do Google
//   const providerToken = session.provider_token;

//   if (!providerToken) {
//     return NextResponse.json(
//       {
//         error:
//           "Google Access Token not found. Please sign out and sign in with Google again.",
//       },
//       { status: 401 },
//     );
//   }

//   // 3. Ler as datas que o Frontend enviou (start e end)
//   const { searchParams } = new URL(request.url);
//   // Se não vier data, usa o padrão (hoje e hoje+30 dias)
//   const start = searchParams.get("start") || new Date().toISOString();
//   const end =
//     searchParams.get("end") ||
//     new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

//   try {
//     // 4. Chamar a API do Google com timeMin e timeMax dinâmicos
//     const url = new URL(
//       "https://www.googleapis.com/calendar/v3/calendars/primary/events",
//     );
//     url.searchParams.append("timeMin", start);
//     url.searchParams.append("timeMax", end);
//     url.searchParams.append("singleEvents", "true");
//     url.searchParams.append("orderBy", "startTime");
//     // Removemos o limite de maxResults ou aumentamos bastante (2500 é o máximo por página)
//     url.searchParams.append("maxResults", "2500");

//     const response = await fetch(url.toString(), {
//       headers: {
//         Authorization: `Bearer ${providerToken}`,
//       },
//     });

//     if (!response.ok) {
//       const errorDetails = await response.text();
//       console.error("Google Calendar API Error:", errorDetails);
//       throw new Error("Failed to fetch calendar events");
//     }

//     const data = await response.json();

//     return NextResponse.json(data.items);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";

const GOOGLE_CALENDAR_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

// Helper simples para pegar o token que o frontend enviou
function getTokenFromHeader(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
}

// LISTAR EVENTOS (GET)
export async function GET(request: Request) {
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
      console.error("Google API Error (GET):", await response.text());
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
  const token = getTokenFromHeader(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const event = {
      summary: body.title,
      description: body.description,
      start: { dateTime: body.start },
      end: { dateTime: body.end },
    };

    const response = await fetch(GOOGLE_CALENDAR_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error("Google API Error (POST):", await response.text());
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
  const token = getTokenFromHeader(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const body = await request.json();

    if (!eventId)
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

    const eventUpdates: any = {};
    if (body.title) eventUpdates.summary = body.title;
    if (body.description) eventUpdates.description = body.description;
    if (body.start) eventUpdates.start = { dateTime: body.start };
    if (body.end) eventUpdates.end = { dateTime: body.end };

    const response = await fetch(`${GOOGLE_CALENDAR_URL}/${eventId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventUpdates),
    });

    if (!response.ok) {
      console.error("Google API Error (PATCH):", await response.text());
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
      console.error("Google API Error (DELETE):", await response.text());
      throw new Error("Failed to delete event");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Route Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
