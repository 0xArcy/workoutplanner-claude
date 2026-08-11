import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProfileInput } from "@/types";

// This is a single-user local app, so there's only ever one Profile row.
export async function GET() {
  const profile = await prisma.profile.findFirst();
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const body: ProfileInput = await request.json();

  if (!body.name) {
    return NextResponse.json({ error: "A name is required." }, { status: 400 });
  }

  const existing = await prisma.profile.findFirst();

  const profile = existing
    ? await prisma.profile.update({ where: { id: existing.id }, data: body })
    : await prisma.profile.create({ data: body });

  return NextResponse.json(profile);
}
