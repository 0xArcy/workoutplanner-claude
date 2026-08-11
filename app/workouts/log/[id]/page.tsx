"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useProfile } from "@/hooks/useProfile";
import { WorkoutLogForm, type ExerciseFormState } from "@/components/workouts/WorkoutLogForm";
import { SetRow } from "@/components/workouts/SetRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDisplayDate, toDateInputValue } from "@/lib/dateUtils";
import { exerciseVolume, sessionVolume } from "@/lib/volume";
import type { WorkoutLog, WorkoutLogInput } from "@/types";

export default function WorkoutLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { updateLog, removeLog } = useWorkoutLogs();
  const { profile } = useProfile();
  const unit = profile?.unit ?? "kg";

  const [log, setLog] = useState<WorkoutLog | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    apiGet<WorkoutLog>(`/api/workout-logs/${id}`).then(setLog);
  }, [id]);

  async function handleUpdate(input: WorkoutLogInput) {
    const updated = await updateLog(id, input);
    setLog(updated);
    setEditing(false);
  }

  async function handleDelete() {
    if (confirm("Delete this workout log? This can't be undone.")) {
      await removeLog(id);
      router.push("/workouts");
    }
  }

  if (!log) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (editing) {
    const initialExercises: ExerciseFormState[] = log.exercises.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      sets: exercise.sets.map((set) => ({ reps: String(set.reps), weight: String(set.weight) })),
    }));

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Edit workout</h1>
        <WorkoutLogForm
          templateId={log.templateId ?? undefined}
          templateName={log.templateName}
          initialDate={toDateInputValue(log.date)}
          initialExercises={initialExercises}
          allowNameEdit
          submitLabel="Save changes"
          onSubmit={handleUpdate}
        />
        <Button variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{log.templateName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDisplayDate(log.date)} - {sessionVolume(log.exercises).toLocaleString()} {unit}{" "}
            total volume
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil size={16} />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {log.exercises.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{exercise.exerciseName}</CardTitle>
              <span className="text-sm text-muted-foreground">
                {exerciseVolume(exercise.sets).toLocaleString()} {unit} volume
              </span>
            </CardHeader>
            <CardContent>
              {exercise.sets.map((set) => (
                <SetRow key={set.id} set={set} unit={unit} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
