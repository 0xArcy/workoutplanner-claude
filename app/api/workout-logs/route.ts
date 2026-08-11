import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildLoggedExercisesWithPR } from "@/lib/workoutLogBuilder";
import type { WorkoutLogInput } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const logs = await prisma.workoutLog.findMany({
    where: {
      date: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    },
    include: {
      exercises: {
        include: { sets: { orderBy: { setNumber: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body: WorkoutLogInput = await request.json();

  if (!body.date || !body.exercises || body.exercises.length === 0) {
    return NextResponse.json(
      { error: "A workout log needs a date and at least one exercise." },
      { status: 400 }
    );
  }

  const exercises = await buildLoggedExercisesWithPR(body.exercises);

  const log = await prisma.workoutLog.create({
    data: {
      date: new Date(body.date),
      templateId: body.templateId,
      templateName: body.templateName,
      exercises: {
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

  return NextResponse.json(log, { status: 201 });
}
