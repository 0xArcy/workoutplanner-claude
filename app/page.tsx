"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Dumbbell, Trophy, Utensils } from "lucide-react";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useDietLogs } from "@/hooks/useDietLogs";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDisplayDate, toDateInputValue, todayInputValue } from "@/lib/dateUtils";
import { dailyTotals } from "@/lib/dietTotals";
import type { DailyDietLog } from "@/types";

export default function DashboardPage() {
  const { profile } = useProfile();
  const { logs: workoutLogs } = useWorkoutLogs();
  const { getLogForDate } = useDietLogs();
  const [todayDiet, setTodayDiet] = useState<DailyDietLog | null>(null);

  const today = todayInputValue();
  const unit = profile?.unit ?? "kg";

  useEffect(() => {
    getLogForDate(today).then(setTodayDiet);
  }, [getLogForDate, today]);

  const todayWorkouts = workoutLogs.filter((log) => toDateInputValue(log.date) === today);

  const recentPRs = useMemo(() => {
    const records: { date: string; exerciseName: string; reps: number; weight: number }[] = [];
    workoutLogs.forEach((log) => {
      log.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (set.isPR) {
            records.push({
              date: log.date,
              exerciseName: exercise.exerciseName,
              reps: set.reps,
              weight: set.weight,
            });
          }
        });
      });
    });
    return records.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [workoutLogs]);

  const totals = todayDiet ? dailyTotals(todayDiet.entries) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile?.name ? `Welcome back, ${profile.name}` : "Welcome"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{formatDisplayDate(today)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/workouts/log/new">
          <Button variant="secondary" className="w-full">
            <Dumbbell size={16} />
            Log a workout
          </Button>
        </Link>
        <Link href="/diet">
          <Button variant="secondary" className="w-full">
            <Utensils size={16} />
            Log today&apos;s food
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s workouts</CardTitle>
          </CardHeader>
          <CardContent>
            {todayWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing logged yet today.</p>
            ) : (
              <ul className="space-y-2">
                {todayWorkouts.map((log) => (
                  <li key={log.id}>
                    <Link href={`/workouts/log/${log.id}`} className="text-sm font-medium hover:text-primary">
                      {log.templateName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {log.exercises.length} exercise{log.exercises.length === 1 ? "" : "s"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s diet</CardTitle>
          </CardHeader>
          <CardContent>
            {totals && totals.calories > 0 ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p>
                  <span className="font-semibold">{totals.calories}</span>{" "}
                  <span className="text-muted-foreground">kcal</span>
                </p>
                <p>
                  <span className="font-semibold">{Math.round(totals.protein)}g</span>{" "}
                  <span className="text-muted-foreground">protein</span>
                </p>
                {todayDiet?.bodyWeight != null && (
                  <p className="col-span-2 text-muted-foreground">
                    Weight: {todayDiet.bodyWeight}
                    {unit}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing logged yet today.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent personal records</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPRs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No PRs yet - log a workout to start tracking them.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentPRs.map((record, index) => (
                <li key={index} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy size={14} className="text-pr" />
                    <span className="font-medium">{record.exerciseName}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {record.weight}
                    {unit} x {record.reps} reps
                  </span>
                  <span className="text-muted-foreground">{formatDisplayDate(record.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
