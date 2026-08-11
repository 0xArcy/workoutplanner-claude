"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BarChart3, Calendar, History } from "lucide-react";
import { useDietLogs } from "@/hooks/useDietLogs";
import { useProfile } from "@/hooks/useProfile";
import { FoodEntryForm } from "@/components/diet/FoodEntryForm";
import { FoodEntryList } from "@/components/diet/FoodEntryList";
import { DietSummaryCard } from "@/components/diet/DietSummaryCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { todayInputValue } from "@/lib/dateUtils";
import type { DailyDietLog, FoodEntryInput } from "@/types";

function DietDay() {
  const searchParams = useSearchParams();
  const [date, setDate] = useState(searchParams.get("date") ?? todayInputValue());
  const { getLogForDate, setBodyWeight, addEntry, removeEntry } = useDietLogs();
  const { profile } = useProfile();
  const unit = profile?.unit ?? "kg";

  const [dailyLog, setDailyLog] = useState<DailyDietLog | null>(null);
  const [loadingDay, setLoadingDay] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingDay(true);
    getLogForDate(date).then((log) => {
      if (!cancelled) {
        setDailyLog(log);
        setLoadingDay(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [date, getLogForDate]);

  async function handleAddEntry(entry: FoodEntryInput) {
    const log = await addEntry(date, entry);
    setDailyLog(log);
  }

  async function handleRemoveEntry(entryId: string) {
    if (!dailyLog) return;
    await removeEntry(dailyLog.id, entryId);
    setDailyLog((prev) =>
      prev ? { ...prev, entries: prev.entries.filter((entry) => entry.id !== entryId) } : prev
    );
  }

  async function handleBodyWeightChange(value: number) {
    const log = await setBodyWeight(date, value);
    setDailyLog(log);
  }

  const entries = dailyLog?.entries ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Diet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Log what you ate and today&apos;s weight.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/diet/analytics">
            <Button variant="secondary">
              <BarChart3 size={16} />
              Analytics
            </Button>
          </Link>
          <Link href="/diet/history">
            <Button variant="secondary">
              <History size={16} />
              History
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="flex items-center gap-3">
          <Calendar size={18} className="text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="max-w-[10rem]"
          />
        </CardContent>
      </Card>

      <DietSummaryCard
        entries={entries}
        bodyWeight={dailyLog?.bodyWeight ?? null}
        unit={unit}
        onBodyWeightChange={handleBodyWeightChange}
      />

      <Card>
        <CardContent className="space-y-4">
          <h2 className="font-medium">Add food</h2>
          <FoodEntryForm onSubmit={handleAddEntry} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-3 font-medium">Entries</h2>
          {loadingDay ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <FoodEntryList entries={entries} onDelete={handleRemoveEntry} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DietPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <DietDay />
    </Suspense>
  );
}
