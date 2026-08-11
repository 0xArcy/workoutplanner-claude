"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, Dumbbell, Plus } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { TemplateCard } from "@/components/workouts/TemplateCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDisplayDate } from "@/lib/dateUtils";

export default function WorkoutsPage() {
  const { templates, loading, removeTemplate } = useTemplates();
  const { logs } = useWorkoutLogs();

  async function handleDelete(id: string) {
    if (confirm("Delete this template? Past logs are kept, just unlinked.")) {
      await removeTemplate(id);
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workouts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build templates, then log your sessions from them.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/workouts/calendar">
            <Button variant="secondary">
              <CalendarDays size={16} />
              Calendar
            </Button>
          </Link>
          <Link href="/workouts/analytics">
            <Button variant="secondary">
              <BarChart3 size={16} />
              Analytics
            </Button>
          </Link>
          <Link href="/workouts/log/new">
            <Button variant="secondary">
              <Dumbbell size={16} />
              Log a workout
            </Button>
          </Link>
          <Link href="/workouts/templates/new">
            <Button>
              <Plus size={16} />
              New template
            </Button>
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium">Templates</h2>
        {!loading && templates.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No templates yet"
            description="Create a template like 'Upper Day' to start logging workouts from it."
            action={
              <Link href="/workouts/templates/new">
                <Button>
                  <Plus size={16} />
                  New template
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Recent sessions</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 8).map((log) => (
              <Link key={log.id} href={`/workouts/log/${log.id}`}>
                <Card className="transition-colors hover:border-primary">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">{log.templateName}</p>
                      <p className="text-sm text-muted-foreground">{formatDisplayDate(log.date)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.exercises.length} exercise{log.exercises.length === 1 ? "" : "s"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
