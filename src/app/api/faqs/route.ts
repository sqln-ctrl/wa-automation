import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const faqs = await prisma.faq.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const faq = await prisma.faq.create({ data: parsed.data });
  return NextResponse.json(faq, { status: 201 });
}
