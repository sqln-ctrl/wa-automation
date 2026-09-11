import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateAppointmentStatus } from "@/services/appointment.service";
import { AppointmentStatus } from "@/lib/db-enums";

const updateSchema = z.object({ status: z.nativeEnum(AppointmentStatus) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const appointment = await updateAppointmentStatus(params.id, parsed.data.status);
  return NextResponse.json(appointment);
}
