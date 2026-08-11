import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/diet-logs?from=YYYY-MM-DD&to=YYYY-MM-DD&date=YYYY-MM-DD
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  const logs = await prisma.dailyDietLog.findMany({
    where: date
      ? { date: new Date(date) }
      : {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        },
    include: { entries: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

// POST /api/diet-logs — get-or-create the daily log for a date, optionally
// setting that day's body weight at the same time.
export async function POST(request: Request) {
  const body: { date: string; bodyWeight?: number } = await request.json();

  if (!body.date) {
    return NextResponse.json({ error: "A date is required." }, { status: 400 });
  }

  const log = await prisma.dailyDietLog.upsert({
    where: { date: new Date(body.date) },
    update: body.bodyWeight !== undefined ? { bodyWeight: body.bodyWeight } : {},
    create: { date: new Date(body.date), bodyWeight: body.bodyWeight },
    include: { entries: true },
  });

  return NextResponse.json(log, { status: 201 });
}
