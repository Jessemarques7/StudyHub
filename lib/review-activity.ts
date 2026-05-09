export interface ReviewActivityDay {
  date: string;
  count: number;
}

const REVIEW_ACTIVITY_KEY = "studyhub-flashcard-review-activity";

function formatActivityDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}

function getActivityDayNumber(date: string): number {
  const [year, month, day] = date.split("/").map(Number);

  return Math.floor(Date.UTC(year, month - 1, day) / (24 * 60 * 60 * 1000));
}

export function getTodayActivityDate(): string {
  return formatActivityDate(new Date());
}

export function getReviewActivity(): ReviewActivityDay[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawActivity = window.localStorage.getItem(REVIEW_ACTIVITY_KEY);
    if (!rawActivity) {
      return [];
    }

    const activity = JSON.parse(rawActivity) as ReviewActivityDay[];
    return Array.isArray(activity)
      ? activity.filter(
          (day) => typeof day.date === "string" && typeof day.count === "number",
        )
      : [];
  } catch {
    return [];
  }
}

export function recordReviewActivity(count = 1): void {
  if (typeof window === "undefined") {
    return;
  }

  const today = getTodayActivityDate();
  const activity = getReviewActivity();
  const existingDay = activity.find((day) => day.date === today);

  if (existingDay) {
    existingDay.count += count;
  } else {
    activity.push({ date: today, count });
  }

  window.localStorage.setItem(REVIEW_ACTIVITY_KEY, JSON.stringify(activity));
}

export function getCurrentStreak(activity: ReviewActivityDay[]): number {
  const activeDates = new Set(
    activity.filter((day) => day.count > 0).map((day) => day.date),
  );
  let streak = 0;
  const cursor = new Date();

  while (activeDates.has(formatActivityDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getLongestStreak(activity: ReviewActivityDay[]): number {
  const activeDates = activity
    .filter((day) => day.count > 0)
    .map((day) => day.date)
    .sort();

  let longest = 0;
  let current = 0;
  let previousDayNumber: number | null = null;

  activeDates.forEach((date) => {
    const currentDayNumber = getActivityDayNumber(date);
    const isConsecutive =
      previousDayNumber !== null && currentDayNumber - previousDayNumber === 1;

    current = isConsecutive ? current + 1 : 1;
    longest = Math.max(longest, current);
    previousDayNumber = currentDayNumber;
  });

  return longest;
}
