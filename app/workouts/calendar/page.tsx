"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { Calendar } from "@/components/workouts/Calendar";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDisplayDate, toDateInputValue, todayInputValue } from "@/lib/dateUtils";

export default function WorkoutCalendarPage() {
  const { logs } = useWorkoutLogs();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayInputValue());

  const markedDates = useMemo(
    () => new Set(logs.map((log) => toDateInputValue(log.date))),
    [logs]
  );

  const logsForSelectedDate = useMemo(
    () => logs.filter((log) => toDateInputValue(log.date) === selectedDate),
    [logs, selectedDate]
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Days with a dot have a logged workout. Pick any date to see or add its history.
        </p>
      </div>

      <Card>
        <CardContent>
          <Calendar
            month={month}
            onMonthChange={setMonth}
            markedDates={markedDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium">{formatDisplayDate(selectedDate)}</h2>
        <Link href={`/workouts/log/new?date=${selectedDate}`}>
          <Button variant="secondary">
            <Plus size={16} />
            Log for this date
          </Button>
        </Link>
      </div>

      {logsForSelectedDate.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nothing logged on this date"
          description="Use the button above to log a workout for it."
        />
      ) : (
        <div className="space-y-2">
          {logsForSelectedDate.map((log) => (
            <Link key={log.id} href={`/workouts/log/${log.id}`}>
              <Card className="transition-colors hover:border-primary">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{log.templateName}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.exercises.length} exercise{log.exercises.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
