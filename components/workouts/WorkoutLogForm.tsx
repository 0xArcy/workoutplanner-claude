"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import type { WorkoutLogInput } from "@/types";

export interface SetFormState {
  reps: string;
  weight: string;
}

export interface ExerciseFormState {
  exerciseName: string;
  sets: SetFormState[];
}

interface WorkoutLogFormProps {
  templateId?: string;
  templateName: string;
  initialDate: string;
  initialExercises: ExerciseFormState[];
  allowNameEdit?: boolean;
  submitLabel: string;
  onSubmit: (input: WorkoutLogInput) => Promise<void>;
}

export function WorkoutLogForm({
  templateId,
  templateName,
  initialDate,
  initialExercises,
  allowNameEdit = false,
  submitLabel,
  onSubmit,
}: WorkoutLogFormProps) {
  const [date, setDate] = useState(initialDate);
  const [name, setName] = useState(templateName);
  const [exercises, setExercises] = useState<ExerciseFormState[]>(initialExercises);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateExerciseName(index: number, exerciseName: string) {
    setExercises((prev) =>
      prev.map((exercise, i) => (i === index ? { ...exercise, exerciseName } : exercise))
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, { exerciseName: "", sets: [{ reps: "", weight: "" }] }]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSet(exerciseIndex: number, setIndex: number, changes: Partial<SetFormState>) {
    setExercises((prev) =>
      prev.map((exercise, i) =>
        i !== exerciseIndex
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set, j) => (j === setIndex ? { ...set, ...changes } : set)),
            }
      )
    );
  }

  function addSet(exerciseIndex: number) {
    setExercises((prev) =>
      prev.map((exercise, i) =>
        i !== exerciseIndex
          ? exercise
          : {
              ...exercise,
              sets: [...exercise.sets, { ...exercise.sets[exercise.sets.length - 1] }],
            }
      )
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExercises((prev) =>
      prev.map((exercise, i) =>
        i !== exerciseIndex
          ? exercise
          : { ...exercise, sets: exercise.sets.filter((_, j) => j !== setIndex) }
      )
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const cleanedExercises = exercises
      .filter((exercise) => exercise.exerciseName.trim().length > 0)
      .map((exercise) => ({
        exerciseName: exercise.exerciseName.trim(),
        sets: exercise.sets
          .filter((set) => set.reps !== "" && set.weight !== "")
          .map((set) => ({ reps: Number(set.reps), weight: Number(set.weight) })),
      }))
      .filter((exercise) => exercise.sets.length > 0);

    if (cleanedExercises.length === 0) {
      setError("Log at least one set with reps and weight filled in.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        date,
        templateId,
        templateName: name.trim() || "Workout",
        exercises: cleanedExercises,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="log-date">Date</Label>
            <Input id="log-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="log-name">Workout name</Label>
            <Input
              id="log-name"
              value={name}
              disabled={!allowNameEdit}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {exercises.map((exercise, exerciseIndex) => (
          <Card key={exerciseIndex}>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Exercise name"
                  value={exercise.exerciseName}
                  onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeExercise(exerciseIndex)}
                  aria-label="Remove exercise"
                  className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-[2.75rem_1fr_1fr_2.75rem] items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span>Set</span>
                  <span>Reps</span>
                  <span>Weight</span>
                  <span />
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    className="grid grid-cols-[2.75rem_1fr_1fr_2.75rem] items-center gap-2"
                  >
                    <span className="text-sm text-muted-foreground">{setIndex + 1}</span>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, { reps: e.target.value })}
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.5"
                      placeholder="Weight"
                      value={set.weight}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, { weight: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removeSet(exerciseIndex, setIndex)}
                      aria-label="Remove set"
                      className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <Button type="button" variant="secondary" onClick={() => addSet(exerciseIndex)}>
                <Plus size={16} />
                Add set
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={addExercise}>
        <Plus size={16} />
        Add exercise
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
