import Link from "next/link";
import { Pencil, Play, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { WorkoutTemplate } from "@/types";

interface TemplateCardProps {
  template: WorkoutTemplate;
  onDelete: (id: string) => void;
}

export function TemplateCard({ template, onDelete }: TemplateCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{template.name}</CardTitle>
          {template.category && (
            <Badge variant="muted" className="mt-2">
              {template.category}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/workouts/templates/${template.id}/edit`}
            aria-label="Edit template"
            className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil size={16} />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(template.id)}
            aria-label="Delete template"
            className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {template.exercises.map((exercise) => (
            <li key={exercise.id} className="flex justify-between gap-3">
              <span className="text-foreground">{exercise.name}</span>
              <span>
                {exercise.targetSets} x {exercise.targetReps}
              </span>
            </li>
          ))}
        </ul>
        <Link href={`/workouts/log/new?templateId=${template.id}`}>
          <Button className="w-full">
            <Play size={16} />
            Start workout
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
