"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTemplates } from "@/hooks/useTemplates";
import { TemplateForm } from "@/components/workouts/TemplateForm";
import { apiGet } from "@/lib/api";
import type { TemplateInput, WorkoutTemplate } from "@/types";

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { updateTemplate } = useTemplates();
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);

  useEffect(() => {
    apiGet<WorkoutTemplate>(`/api/templates/${id}`).then(setTemplate);
  }, [id]);

  async function handleSubmit(input: TemplateInput) {
    await updateTemplate(id, input);
    router.push("/workouts");
  }

  if (!template) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit template</h1>
      <TemplateForm initialTemplate={template} submitLabel="Save changes" onSubmit={handleSubmit} />
    </div>
  );
}
