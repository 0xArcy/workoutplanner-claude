import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TemplateInput } from "@/types";

export async function GET() {
  const templates = await prisma.workoutTemplate.findMany({
    include: { exercises: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const body: TemplateInput = await request.json();

  if (!body.name || !body.exercises || body.exercises.length === 0) {
    return NextResponse.json(
      { error: "A template needs a name and at least one exercise." },
      { status: 400 }
    );
  }

  const template = await prisma.workoutTemplate.create({
    data: {
      name: body.name,
      category: body.category,
      exercises: {
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

  return NextResponse.json(template, { status: 201 });
}
