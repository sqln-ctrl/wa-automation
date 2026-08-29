import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().optional(),
  triggerType: z.enum(["KEYWORD", "GREETING", "FALLBACK"]).optional(),
  keywords: z.array(z.string()).optional(),
  responseText: z.string().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const rule = await prisma.automationRule.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(rule);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.automationRule.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
