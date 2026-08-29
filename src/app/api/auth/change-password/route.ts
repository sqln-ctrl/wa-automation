import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminEmail, verifyCredentials } from "@/lib/auth";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

/** Lets the currently logged-in admin/staff member change their own password. */
export async function POST(req: NextRequest) {
  const email = await getCurrentAdminEmail();
  if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const valid = await verifyCredentials(email, parsed.data.currentPassword);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);

  // If this admin only ever existed as the ADMIN_EMAIL/ADMIN_PASSWORD_HASH env fallback,
  // this is also where they get a real AdminUser row for the first time.
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  return NextResponse.json({ success: true });
}
