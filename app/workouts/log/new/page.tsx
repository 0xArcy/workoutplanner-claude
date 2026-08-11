"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { apiGet } from "@/lib/api";
import { WorkoutLogForm, type ExerciseFormState } from "@/components/workouts/WorkoutLogForm";
import { todayInputValue } from "@/lib/dateUtils";
import type { WorkoutLogInput, WorkoutTemplate } from "@/types";

function NewWorkoutLogForm() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") ?? undefined;
  const initialDate = searchParams.get("date") ?? todayInputValue();
  const router = useRouter();
  const { addLog } = useWorkoutLogs();
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
  const [loading, setLoading] = useState(Boolean(templateId));

  useEffect(() => {
    if (!templateId) return;
    apiGet<WorkoutTemplate>(`/api/templates/${templateId}`)
      .then(setTemplate)
      .finally(() => setLoading(false));
  }, [templateId]);

  async function handleSubmit(input: WorkoutLogInput) {
    const log = await addLog(input);
    router.push(`/workouts/log/${log.id}`);
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading template...</p>;
  }

  const initialExercises: ExerciseFormState[] = template
    ? template.exercises.map((exercise) => ({
        exerciseName: exercise.name,
        sets: Array.from({ length: exercise.targetSets }, () => ({ reps: "", weight: "" })),
      }))
    : [{ exerciseName: "", sets: [{ reps: "", weight: "" }] }];

  return (
    <WorkoutLogForm
      templateId={template?.id}
      templateName={template?.name ?? "Workout"}
      initialDate={initialDate}
      initialExercises={initialExercises}
      allowNameEdit={!template}
      submitLabel="Save workout"
      onSubmit={handleSubmit}
    />
  );
}

export default function NewWorkoutLogPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Log a workout</h1>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <NewWorkoutLogForm />
      </Suspense>
    </div>
  );
}
