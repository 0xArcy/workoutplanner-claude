"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  markedDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function Calendar({
  month,
  onMonthChange,
  markedDates,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(monthEnd),
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(month, 1))}
          aria-label="Previous month"
          className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-medium">{format(month, "MMMM yyyy")}</p>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Next month"
          className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAY_LABELS.map((label, index) => (
          <div key={index} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, month);
          const marked = markedDates.has(dateKey);
          const selected = selectedDate === dateKey;
          const today = isToday(day);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-md text-sm transition-colors ${
                !inMonth ? "text-muted-foreground/40" : "text-foreground"
              } ${
                selected
                  ? "bg-primary text-primary-foreground"
                  : today
                    ? "border border-primary"
                    : "hover:bg-muted"
              }`}
            >
              {format(day, "d")}
              {marked && (
                <span
                  className={`absolute bottom-1.5 size-1 rounded-full ${
                    selected ? "bg-primary-foreground" : "bg-pr"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
