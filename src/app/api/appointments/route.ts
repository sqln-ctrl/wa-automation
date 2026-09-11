import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listAppointments, createAppointment, isSlotAvailable } from "@/services/appointment.service";
import { AppointmentStatus } from "@/lib/db-enums";

const createSchema = z.object({
  customerId: z.string(),
  serviceId: z.string().optional(),
  scheduledAt: z.string().datetime(),
  durationMin: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const statusParam = req.nextUrl.searchParams.get("status");
  const status =
    statusParam && statusParam in AppointmentStatus ? (statusParam as AppointmentStatus) : undefined;
  const appointments = await listAppointments(status);
  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const scheduledAt = new Date(parsed.data.scheduledAt);
  const available = await isSlotAvailable(scheduledAt, parsed.data.durationMin ?? 30);
  if (!available) {
    return NextResponse.json({ error: "This time slot is already booked." }, { status: 409 });
  }

  const appointment = await createAppointment({ ...parsed.data, scheduledAt });
  return NextResponse.json(appointment, { status: 201 });
}
