"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import type { DailyDietLog, FoodEntryInput } from "@/types";

interface DateRange {
  from?: string;
  to?: string;
}

function upsertLog(logs: DailyDietLog[], log: DailyDietLog) {
  const exists = logs.some((entry) => entry.id === log.id);
  return exists
    ? logs.map((entry) => (entry.id === log.id ? log : entry))
    : [log, ...logs];
}

export function useDietLogs(range?: DateRange) {
  const [logs, setLogs] = useState<DailyDietLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (range?.from) params.set("from", range.from);
    if (range?.to) params.set("to", range.to);
    const query = params.toString();
    const data = await apiGet<DailyDietLog[]>(`/api/diet-logs${query ? `?${query}` : ""}`);
    setLogs(data);
    setLoading(false);
  }, [range?.from, range?.to]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Looks up the diet log for a single date, without creating one.
  const getLogForDate = useCallback(async (date: string) => {
    const data = await apiGet<DailyDietLog[]>(`/api/diet-logs?date=${date}`);
    const log = data[0] ?? null;
    if (log) setLogs((prev) => upsertLog(prev, log));
    return log;
  }, []);

  // Creates the diet log for a date if it doesn't exist yet (or updates its
  // body weight if it does).
  const ensureLogForDate = useCallback(async (date: string, bodyWeight?: number) => {
    const log = await apiPost<DailyDietLog>("/api/diet-logs", { date, bodyWeight });
    setLogs((prev) => upsertLog(prev, log));
    return log;
  }, []);

  const setBodyWeight = useCallback(
    (date: string, bodyWeight: number) => ensureLogForDate(date, bodyWeight),
    [ensureLogForDate]
  );

  const addEntry = useCallback(
    async (date: string, entry: FoodEntryInput) => {
      const { id } = await ensureLogForDate(date);
      const log = await apiPost<DailyDietLog>(`/api/diet-logs/${id}/entries`, entry);
      setLogs((prev) => upsertLog(prev, log));
      return log;
    },
    [ensureLogForDate]
  );

  const removeEntry = useCallback(async (dailyLogId: string, entryId: string) => {
    await apiDelete(`/api/diet-logs/${dailyLogId}/entries/${entryId}`);
    setLogs((prev) =>
      prev.map((log) =>
        log.id === dailyLogId
          ? { ...log, entries: log.entries.filter((entry) => entry.id !== entryId) }
          : log
      )
    );
  }, []);

  const removeLog = useCallback(async (id: string) => {
    await apiDelete(`/api/diet-logs/${id}`);
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }, []);

  return {
    logs,
    loading,
    refresh,
    getLogForDate,
    setBodyWeight,
    addEntry,
    removeEntry,
    removeLog,
  };
}
