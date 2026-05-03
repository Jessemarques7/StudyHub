export interface Habit {
  id: string;
  name: string;
  icon: string;
  completedDates: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHabitInput {
  name: string;
  icon?: string;
  completedDates?: Record<string, boolean>;
}

export interface UpdateHabitInput {
  name?: string;
  icon?: string;
  completedDates?: Record<string, boolean>;
}
