"use client";

import { useMemo } from "react";
import { Apple } from "lucide-react";
import { useDietLogs } from "@/hooks/useDietLogs";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CalorieChart, type CaloriePoint } from "@/components/charts/CalorieChart";
import { WeightChart, type WeightPoint } from "@/components/charts/WeightChart";
import { dailyTotals } from "@/lib/dietTotals";
import { toDateInputValue } from "@/lib/dateUtils";

export default function DietAnalyticsPage() {
  const { logs, loading } = useDietLogs();
  const { profile } = useProfile();
  const unit = profile?.unit ?? "kg";

  const sorted = useMemo(() => [...logs].sort((a, b) => a.date.localeCompare(b.date)), [logs]);

  const calorieData: CaloriePoint[] = useMemo(
    () =>
      sorted.map((log) => ({
        date: toDateInputValue(log.date),
        calories: dailyTotals(log.entries).calories,
      })),
    [sorted]
  );

  const weightData: WeightPoint[] = useMemo(
    () =>
      sorted
        .filter((log) => log.bodyWeight !== null)
        .map((log) => ({ date: toDateInputValue(log.date), weight: log.bodyWeight as number })),
    [sorted]
  );

  if (!loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Diet analytics</h1>
        <EmptyState
          icon={Apple}
          title="Nothing to analyze yet"
          description="Log a day of food or your body weight to see trends here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Diet analytics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Calories over time</CardTitle>
        </CardHeader>
        <CardContent>
          <CalorieChart data={calorieData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Body weight over time</CardTitle>
        </CardHeader>
        <CardContent>
          {weightData.length > 0 ? (
            <WeightChart data={weightData} unit={unit} />
          ) : (
            <p className="text-sm text-muted-foreground">No body weight logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
