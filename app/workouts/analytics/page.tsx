"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExerciseProgressChart, type ProgressPoint } from "@/components/charts/ExerciseProgressChart";
import { VolumeChart, type VolumePoint } from "@/components/charts/VolumeChart";
import { estimatedOneRepMax } from "@/lib/pr";
import { sessionVolume } from "@/lib/volume";
import { formatDisplayDate } from "@/lib/dateUtils";

export default function WorkoutAnalyticsPage() {
  const { logs, loading } = useWorkoutLogs();
  const { profile } = useProfile();
  const unit = profile?.unit ?? "kg";

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    logs.forEach((log) => log.exercises.forEach((exercise) => names.add(exercise.exerciseName)));
    return Array.from(names).sort();
  }, [logs]);

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const activeExercise = selectedExercise ?? exerciseNames[0] ?? null;

  const progressData: ProgressPoint[] = useMemo(() => {
    if (!activeExercise) return [];
    return logs
      .map((log) => {
        const exercise = log.exercises.find((e) => e.exerciseName === activeExercise);
        if (!exercise || exercise.sets.length === 0) return null;
        const bestSet = exercise.sets.reduce((best, set) =>
          estimatedOneRepMax(set.weight, set.reps) > estimatedOneRepMax(best.weight, best.reps)
            ? set
            : best
        );
        return {
          date: log.date,
          oneRepMax: estimatedOneRepMax(bestSet.weight, bestSet.reps),
          isPR: exercise.sets.some((set) => set.isPR),
          reps: bestSet.reps,
          weight: bestSet.weight,
        };
      })
      .filter((point): point is ProgressPoint => point !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, activeExercise]);

  const volumeData: VolumePoint[] = useMemo(
    () =>
      [...logs]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((log) => ({ date: log.date, volume: sessionVolume(log.exercises) })),
    [logs]
  );

  const personalRecords = useMemo(() => {
    const records: { date: string; exerciseName: string; reps: number; weight: number }[] = [];
    logs.forEach((log) => {
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
    return records.sort((a, b) => b.date.localeCompare(a.date));
  }, [logs]);

  if (!loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Workout analytics</h1>
        <EmptyState
          icon={Trophy}
          title="Nothing to analyze yet"
          description="Log a workout to see progress charts and personal records here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Workout analytics</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Exercise progress</CardTitle>
          {activeExercise && (
            <Select
              value={activeExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-48"
            >
              {exerciseNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          )}
        </CardHeader>
        <CardContent>
          {progressData.length > 0 ? (
            <ExerciseProgressChart data={progressData} unit={unit} />
          ) : (
            <p className="text-sm text-muted-foreground">No sets logged for this exercise yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session volume</CardTitle>
        </CardHeader>
        <CardContent>
          <VolumeChart data={volumeData} unit={unit} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal records</CardTitle>
        </CardHeader>
        <CardContent>
          {personalRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No PRs yet - keep logging.</p>
          ) : (
            <ul className="divide-y divide-border">
              {personalRecords.map((record, index) => (
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
