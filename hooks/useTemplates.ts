"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { TemplateInput, WorkoutTemplate } from "@/types";

export function useTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await apiGet<WorkoutTemplate[]>("/api/templates");
    setTemplates(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addTemplate(input: TemplateInput) {
    const created = await apiPost<WorkoutTemplate>("/api/templates", input);
    setTemplates((prev) => [created, ...prev]);
    return created;
  }

  async function updateTemplate(id: string, input: TemplateInput) {
    const updated = await apiPatch<WorkoutTemplate>(`/api/templates/${id}`, input);
    setTemplates((prev) => prev.map((template) => (template.id === id ? updated : template)));
    return updated;
  }

  async function removeTemplate(id: string) {
    await apiDelete(`/api/templates/${id}`);
    setTemplates((prev) => prev.filter((template) => template.id !== id));
  }

  return { templates, loading, refresh, addTemplate, updateTemplate, removeTemplate };
}
