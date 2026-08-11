import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TemplateInput } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const template = await prisma.workoutTemplate.findUnique({
    where: { id },
    include: { exercises: { orderBy: { order: "asc" } } },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  return NextResponse.json(template);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body: TemplateInput = await request.json();

  const template = await prisma.workoutTemplate.update({
    where: { id },
    data: {
      name: body.name,
      category: body.category,
      exercises: {
        deleteMany: {},
        create: body.exercises.map((exercise, index) => ({
          name: exercise.name,
          targetSets: exercise.targetSets,
          targetReps: exercise.targetReps,
          notes: exercise.notes,
          order: index,
        })),
      },
    },
    include: { exercises: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(template);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.workoutTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
