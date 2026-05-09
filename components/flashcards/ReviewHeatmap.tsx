"use client";

import { ReviewActivityDay } from "@/lib/review-activity";

interface ReviewHeatmapProps {
  value: ReviewActivityDay[];
  startDate: Date;
  endDate: Date;
}

const rectSize = 12;
const space = 3;
const topPad = 20;
const leftPad = 5;
const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatHeatmapDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}

function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return start;
}

function getColor(count: number): string {
  if (count <= 0) return "color-mix(in srgb, var(--foreground) 12%, transparent)";
  if (count < 3) return "color-mix(in srgb, var(--brand-purple) 30%, transparent)";
  if (count < 6) return "color-mix(in srgb, var(--brand-purple) 50%, transparent)";
  if (count < 10) return "color-mix(in srgb, var(--brand-purple) 72%, transparent)";

  return "var(--brand-purple)";
}

export function ReviewHeatmap({
  value,
  startDate,
  endDate,
}: ReviewHeatmapProps) {
  const activityByDate = new Map(value.map((day) => [day.date, day.count]));
  const firstDate = getStartOfWeek(startDate);
  const lastDate = new Date(endDate);
  lastDate.setHours(23, 59, 59, 999);

  const dayCount =
    Math.floor((lastDate.getTime() - firstDate.getTime()) / 86400000) + 1;
  const weekCount = Math.ceil(dayCount / 7);
  const width = leftPad + weekCount * (rectSize + space);
  const height = topPad + 7 * (rectSize + space);

  const cells = Array.from({ length: weekCount * 7 }, (_, index) => {
    const date = new Date(firstDate);
    date.setDate(firstDate.getDate() + index);

    const dateKey = formatHeatmapDate(date);
    const count = activityByDate.get(dateKey) ?? 0;

    return {
      count,
      date,
      dateKey,
      isInRange: date <= lastDate,
      x: leftPad + Math.floor(index / 7) * (rectSize + space),
      y: topPad + (index % 7) * (rectSize + space),
    };
  });

  const monthMarkers = cells.filter((cell, index) => {
    if (!cell.isInRange || cell.date.getDate() > 7) return false;

    const previousCell = cells[index - 7];
    return !previousCell || previousCell.date.getMonth() !== cell.date.getMonth();
  });

  return (
    <svg
      className="block min-w-[760px] text-muted-foreground"
      width={width}
      height={height}
      role="img"
      aria-label="Flashcard review activity heatmap"
    >
      {monthMarkers.map((marker) => (
        <text
          key={`month-${marker.dateKey}`}
          x={marker.x}
          y={12}
          fill="currentColor"
          fontSize="10"
        >
          {monthLabels[marker.date.getMonth()]}
        </text>
      ))}

      {cells.map((cell) =>
        cell.isInRange ? (
          <rect
            key={cell.dateKey}
            x={cell.x}
            y={cell.y}
            width={rectSize}
            height={rectSize}
            rx={2}
            fill={getColor(cell.count)}
          >
            <title>{`${cell.count} ${
              cell.count === 1 ? "review" : "reviews"
            } on ${cell.dateKey}`}</title>
          </rect>
        ) : null,
      )}
    </svg>
  );
}
