// app/api/calendar/route.ts
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = request.headers.get("Authorization")?.split(" ")[1];
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing access token" },
      { status: 401 },
    );
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: start || new Date().toISOString(),
      timeMax: end || undefined,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events =
      response.data.items?.map((event) => ({
        id: event.id,
        title: event.summary || "Sem título",
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        allDay: !event.start?.dateTime, // Se não tem hora, é dia inteiro
        extendedProps: {
          description: event.description,
          location: event.location,
        },
        // Cores estilo Notion (padrão cinza/azul se não vier do Google)
        backgroundColor: event.colorId ? undefined : "#E3E2E0",
        textColor: "#37352F",
        borderColor: "transparent",
      })) || [];

    return NextResponse.json(events);
  } catch (error) {
    console.error("Google Calendar API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
