import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaClient";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const story = await prisma.story.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, body: true, expiresAt: true },
  });

  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (story.expiresAt < new Date()) {
    // Option 1: treat as gone
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  return NextResponse.json(story);
}
