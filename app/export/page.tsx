"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiGet } from "@/lib/api";
import { useProfile } from "@/hooks/useProfile";
import { generateReportPdf } from "@/lib/pdf";
import { todayInputValue } from "@/lib/dateUtils";
import type { DailyDietLog, WorkoutLog } from "@/types";

export default function ExportPage() {
  const { profile } = useProfile();
  const unit = profile?.unit ?? "kg";

  const [from, setFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [to, setTo] = useState(todayInputValue());
  const [includeWorkouts, setIncludeWorkouts] = useState(true);
  const [includeDiet, setIncludeDiet] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setError(null);
    if (!includeWorkouts && !includeDiet) {
      setError("Pick at least one section to include.");
      return;
    }

    setGenerating(true);
    try {
      const [workoutLogs, dietLogs] = await Promise.all([
        includeWorkouts
          ? apiGet<WorkoutLog[]>(`/api/workout-logs?from=${from}&to=${to}`)
          : Promise.resolve([]),
        includeDiet
          ? apiGet<DailyDietLog[]>(`/api/diet-logs?from=${from}&to=${to}`)
          : Promise.resolve([]),
      ]);
      generateReportPdf({ from, to, unit, workoutLogs, dietLogs });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Export</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Download a PDF report of your workouts and diet history.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="export-from">From</Label>
              <Input
                id="export-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="export-to">To</Label>
              <Input id="export-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeWorkouts}
                onChange={(e) => setIncludeWorkouts(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Include workouts
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeDiet}
                onChange={(e) => setIncludeDiet(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Include diet
            </label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleExport} disabled={generating}>
            <FileDown size={16} />
            {generating ? "Generating..." : "Download PDF"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
