"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import type { TemplateInput, WorkoutTemplate } from "@/types";

interface ExerciseFormState {
  name: string;
  targetSets: string;
  targetReps: string;
  notes: string;
}

function toFormState(template?: WorkoutTemplate): ExerciseFormState[] {
  if (!template || template.exercises.length === 0) {
    return [{ name: "", targetSets: "3", targetReps: "8-12", notes: "" }];
  }
  return template.exercises.map((exercise) => ({
    name: exercise.name,
    targetSets: String(exercise.targetSets),
    targetReps: exercise.targetReps,
    notes: exercise.notes ?? "",
  }));
}

interface TemplateFormProps {
  initialTemplate?: WorkoutTemplate;
  submitLabel: string;
  onSubmit: (input: TemplateInput) => Promise<void>;
}

export function TemplateForm({ initialTemplate, submitLabel, onSubmit }: TemplateFormProps) {
  const [name, setName] = useState(initialTemplate?.name ?? "");
  const [category, setCategory] = useState(initialTemplate?.category ?? "");
  const [exercises, setExercises] = useState<ExerciseFormState[]>(toFormState(initialTemplate));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateExercise(index: number, changes: Partial<ExerciseFormState>) {
    setExercises((prev) =>
      prev.map((exercise, i) => (i === index ? { ...exercise, ...changes } : exercise))
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, { name: "", targetSets: "3", targetReps: "8-12", notes: "" }]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const cleanedExercises = exercises
      .filter((exercise) => exercise.name.trim().length > 0)
      .map((exercise) => ({
        name: exercise.name.trim(),
        targetSets: Number(exercise.targetSets) || 1,
        targetReps: exercise.targetReps.trim() || "-",
        notes: exercise.notes.trim() || undefined,
      }));

    if (!name.trim()) {
      setError("Give the template a name.");
      return;
    }
    if (cleanedExercises.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        category: category.trim() || undefined,
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
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="template-name">Template name</Label>
              <Input
                id="template-name"
                placeholder="e.g. Upper Day"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="template-category">Category (optional)</Label>
              <Input
                id="template-category"
                placeholder="e.g. Chest, Legs, Push"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <Card key={index}>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div>
                    <Label htmlFor={`exercise-name-${index}`}>Exercise</Label>
                    <Input
                      id={`exercise-name-${index}`}
                      placeholder="e.g. Bench Press"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, { name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`exercise-sets-${index}`}>Target sets</Label>
                      <Input
                        id={`exercise-sets-${index}`}
                        type="number"
                        min={1}
                        value={exercise.targetSets}
                        onChange={(e) => updateExercise(index, { targetSets: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exercise-reps-${index}`}>Target reps</Label>
                      <Input
                        id={`exercise-reps-${index}`}
                        placeholder="e.g. 8-12"
                        value={exercise.targetReps}
                        onChange={(e) => updateExercise(index, { targetReps: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`exercise-notes-${index}`}>Notes (optional)</Label>
                    <Textarea
                      id={`exercise-notes-${index}`}
                      rows={2}
                      placeholder="e.g. Pause at the bottom"
                      value={exercise.notes}
                      onChange={(e) => updateExercise(index, { notes: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  aria-label="Remove exercise"
                  className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                  <Trash2 size={18} />
                </button>
              </div>
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
