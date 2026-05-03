import { createClient } from "@/utils/supabase/client";
import { CreateHabitInput, Habit, UpdateHabitInput } from "@/types/habits";
import type { HabitRow } from "@/types/database";

type SupabaseClient = ReturnType<typeof createClient>;

const DEFAULT_HABIT_ICON = "🎯";

function normalizeCompletedDates(
  value: HabitRow["completed_dates"],
): Record<string, boolean> {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([date, completed]) => typeof date === "string" && completed === true,
    ),
  );
}

function mapHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon || DEFAULT_HABIT_ICON,
    completedDates: normalizeCompletedDates(row.completed_dates),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

async function getAuthenticatedUserId(
  supabase: SupabaseClient,
): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Usuario nao autenticado");
  }

  return user.id;
}

export async function getAllHabits(): Promise<Habit[]> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId(supabase);

  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapHabit);
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId(supabase);

  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: userId,
      name: input.name,
      icon: input.icon ?? DEFAULT_HABIT_ICON,
      completed_dates: input.completedDates ?? {},
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapHabit(data);
}

export async function createManyHabits(
  inputs: CreateHabitInput[],
): Promise<Habit[]> {
  const supabase = createClient();

  if (inputs.length === 0) {
    return [];
  }

  const userId = await getAuthenticatedUserId(supabase);

  const payload = inputs.map((input) => ({
    user_id: userId,
    name: input.name,
    icon: input.icon ?? DEFAULT_HABIT_ICON,
    completed_dates: input.completedDates ?? {},
  }));

  const { data, error } = await supabase
    .from("habits")
    .insert(payload)
    .select();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapHabit);
}

export async function updateHabit(
  id: string,
  updates: UpdateHabitInput,
): Promise<Habit> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId(supabase);

  const payload: {
    name?: string;
    icon?: string;
    completed_dates?: Record<string, boolean>;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) {
    payload.name = updates.name;
  }

  if (updates.icon !== undefined) {
    payload.icon = updates.icon;
  }

  if (updates.completedDates !== undefined) {
    payload.completed_dates = updates.completedDates;
  }

  const { data, error } = await supabase
    .from("habits")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapHabit(data);
}

export async function deleteHabit(id: string): Promise<void> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId(supabase);

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
