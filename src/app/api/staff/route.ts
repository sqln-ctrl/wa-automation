import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/** Lists staff/admin accounts that can log in to the dashboard (no passwordHash exposed). */
export async function GET() {
  const staff = await prisma.adminUser.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(staff);
}

/** Adds a new staff member who can log in with the same dashboard access as any admin. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const staff = await prisma.adminUser.create({
    data: { email: parsed.data.email, name: parsed.data.name, passwordHash },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return NextResponse.json(staff, { status: 201 });
}
