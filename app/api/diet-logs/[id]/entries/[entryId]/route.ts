import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; entryId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { entryId } = await params;
  await prisma.foodEntry.delete({ where: { id: entryId } });
  return NextResponse.json({ success: true });
}
