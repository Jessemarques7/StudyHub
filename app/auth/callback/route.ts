import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Se houver um parâmetro 'next', redirecionamos para ele após o login
  const next = searchParams.get("next") ?? "/calendar";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Se der erro, manda para a home ou página de erro
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
