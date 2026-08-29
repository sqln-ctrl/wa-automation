import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminEmail } from "@/lib/auth";

/** Removes a staff member's access. Blocked for the account you're currently logged in as, and for the last remaining admin. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const currentEmail = await getCurrentAdminEmail();
  const target = await prisma.adminUser.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (target.email === currentEmail) {
    return NextResponse.json({ error: "You can't remove your own account while logged in as it." }, { status: 400 });
  }

  const totalAdmins = await prisma.adminUser.count();
  if (totalAdmins <= 1) {
    return NextResponse.json({ error: "At least one admin account must remain." }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
