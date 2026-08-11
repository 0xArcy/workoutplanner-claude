"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { WorkoutLog, WorkoutLogInput } from "@/types";

interface DateRange {
  from?: string;
  to?: string;
}

export function useWorkoutLogs(range?: DateRange) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (range?.from) params.set("from", range.from);
    if (range?.to) params.set("to", range.to);
    const query = params.toString();
    const data = await apiGet<WorkoutLog[]>(`/api/workout-logs${query ? `?${query}` : ""}`);
    setLogs(data);
    setLoading(false);
  }, [range?.from, range?.to]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addLog(input: WorkoutLogInput) {
    const created = await apiPost<WorkoutLog>("/api/workout-logs", input);
    setLogs((prev) => [created, ...prev]);
    return created;
  }

  async function updateLog(id: string, input: WorkoutLogInput) {
    const updated = await apiPatch<WorkoutLog>(`/api/workout-logs/${id}`, input);
    setLogs((prev) => prev.map((log) => (log.id === id ? updated : log)));
    return updated;
  }

  async function removeLog(id: string) {
    await apiDelete(`/api/workout-logs/${id}`);
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }

  return { logs, loading, refresh, addLog, updateLog, removeLog };
}
