import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildLoggedExercisesWithPR } from "@/lib/workoutLogBuilder";
import type { WorkoutLogInput } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const log = await prisma.workoutLog.findUnique({
    where: { id },
    include: {
      exercises: {
        include: { sets: { orderBy: { setNumber: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!log) {
    return NextResponse.json({ error: "Workout log not found." }, { status: 404 });
  }

  return NextResponse.json(log);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body: WorkoutLogInput = await request.json();

  const exercises = await buildLoggedExercisesWithPR(body.exercises, id);

  const log = await prisma.workoutLog.update({
    where: { id },
    data: {
      date: new Date(body.date),
      templateId: body.templateId,
      templateName: body.templateName,
      exercises: {
        deleteMany: {},
        create: exercises.map((exercise, index) => ({
          exerciseName: exercise.exerciseName,
          order: index,
          sets: { create: exercise.sets },
        })),
      },
    },
    include: {
      exercises: {
        include: { sets: { orderBy: { setNumber: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(log);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.workoutLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
