import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ruleSchema = z.object({
  name: z.string().min(1),
  triggerType: z.enum(["KEYWORD", "GREETING", "FALLBACK"]),
  keywords: z.array(z.string()).optional(),
  responseText: z.string().min(1),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const rules = await prisma.automationRule.findMany({ orderBy: [{ priority: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ruleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.triggerType === "KEYWORD" && !(parsed.data.keywords?.length)) {
    return NextResponse.json({ error: "Keyword rules need at least one keyword." }, { status: 400 });
  }

  const rule = await prisma.automationRule.create({
    data: { ...parsed.data, keywords: parsed.data.keywords ?? [] },
  });
  return NextResponse.json(rule, { status: 201 });
}
