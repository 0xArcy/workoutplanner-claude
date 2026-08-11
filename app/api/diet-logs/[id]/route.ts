import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const log = await prisma.dailyDietLog.findUnique({
    where: { id },
    include: { entries: true },
  });

  if (!log) {
    return NextResponse.json({ error: "Diet log not found." }, { status: 404 });
  }

  return NextResponse.json(log);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body: { bodyWeight?: number } = await request.json();

  const log = await prisma.dailyDietLog.update({
    where: { id },
    data: { bodyWeight: body.bodyWeight },
    include: { entries: true },
  });

  return NextResponse.json(log);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.dailyDietLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
