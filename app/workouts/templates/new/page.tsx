"use client";

import { useRouter } from "next/navigation";
import { useTemplates } from "@/hooks/useTemplates";
import { TemplateForm } from "@/components/workouts/TemplateForm";
import type { TemplateInput } from "@/types";

export default function NewTemplatePage() {
  const router = useRouter();
  const { addTemplate } = useTemplates();

  async function handleSubmit(input: TemplateInput) {
    await addTemplate(input);
    router.push("/workouts");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New template</h1>
      <TemplateForm submitLabel="Create template" onSubmit={handleSubmit} />
    </div>
  );
}
