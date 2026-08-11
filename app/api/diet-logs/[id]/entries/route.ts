import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FoodEntryInput } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body: FoodEntryInput = await request.json();

  if (!body.name || body.calories === undefined) {
    return NextResponse.json(
      { error: "A food entry needs a name and calorie count." },
      { status: 400 }
    );
  }

  const log = await prisma.dailyDietLog.update({
    where: { id },
    data: {
      entries: {
        create: {
          name: body.name,
          calories: body.calories,
          protein: body.protein,
          carbs: body.carbs,
          fat: body.fat,
          time: body.time,
        },
      },
    },
    include: { entries: true },
  });

  return NextResponse.json(log, { status: 201 });
}
