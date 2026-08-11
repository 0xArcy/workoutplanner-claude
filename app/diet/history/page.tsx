"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { useDietLogs } from "@/hooks/useDietLogs";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDisplayDate, toDateInputValue } from "@/lib/dateUtils";
import { dailyTotals } from "@/lib/dietTotals";

export default function DietHistoryPage() {
  const { logs, loading } = useDietLogs();
  const { profile } = useProfile();
  const unit = profile?.unit ?? "kg";

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Diet history</h1>

      {!loading && sorted.length === 0 ? (
        <EmptyState
          icon={History}
          title="No diet history yet"
          description="Log a day of food to see it appear here."
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((log) => {
            const totals = dailyTotals(log.entries);
            return (
              <Link key={log.id} href={`/diet?date=${toDateInputValue(log.date)}`}>
                <Card className="transition-colors hover:border-primary">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">{formatDisplayDate(log.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.entries.length} item{log.entries.length === 1 ? "" : "s"}
                        {log.bodyWeight != null ? ` · ${log.bodyWeight}${unit}` : ""}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{totals.calories} kcal</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
