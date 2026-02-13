import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  // 1. Pegar Sessão
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Extrair o Token do Google
  const providerToken = session.provider_token;

  if (!providerToken) {
    return NextResponse.json(
      {
        error:
          "Google Access Token not found. Please sign out and sign in with Google again.",
      },
      { status: 401 },
    );
  }

  // 3. Ler as datas que o Frontend enviou (start e end)
  const { searchParams } = new URL(request.url);
  // Se não vier data, usa o padrão (hoje e hoje+30 dias)
  const start = searchParams.get("start") || new Date().toISOString();
  const end =
    searchParams.get("end") ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // 4. Chamar a API do Google com timeMin e timeMax dinâmicos
    const url = new URL(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    );
    url.searchParams.append("timeMin", start);
    url.searchParams.append("timeMax", end);
    url.searchParams.append("singleEvents", "true");
    url.searchParams.append("orderBy", "startTime");
    // Removemos o limite de maxResults ou aumentamos bastante (2500 é o máximo por página)
    url.searchParams.append("maxResults", "2500");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${providerToken}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Google Calendar API Error:", errorDetails);
      throw new Error("Failed to fetch calendar events");
    }

    const data = await response.json();

    return NextResponse.json(data.items);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
