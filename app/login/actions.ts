"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { headers } from "next/headers";

// Schema for Login (Email & Password only)
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Schema for Signup (Includes Name)
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Validate data
  const data = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Invalid email or password format" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/notes");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = Object.fromEntries(formData);
  const parsed = signupSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: "Invalid input data. Password must be 6+ chars and name 2+ chars.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/notes");
}

/**
 * Nova ação para Login com Google com escopos de Calendário
 */
export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
        // CORREÇÃO AQUI: Adicionamos 'openid email profile' antes do calendário
        scope: "openid email profile https://www.googleapis.com/auth/calendar",
      },
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) {
    console.error("Erro login Google:", error);
    return redirect("/login?message=Could not authenticate user");
  }
}
