import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { addMinutes, isBefore } from "date-fns";

const BOOKING_KEYWORDS = ["book", "appointment", "schedule", "reserve", "booking"];

/** Cheap intent check — used before running the (more expensive) full flow. */
export async function detectAppointmentIntent(text: string): Promise<boolean> {
  const normalized = text.toLowerCase();
  return BOOKING_KEYWORDS.some((k) => normalized.includes(k));
}

/**
 * Minimal conversational booking flow: on any booking-intent message we reply with
 * available bookable services and ask the customer to pick one via the dashboard-managed
 * list message flow. For a real deployment, wire this to interactive list replies
 * (see sendListMessage in lib/whatsapp.ts) and persist a "pending booking" state per customer.
 */
export async function handleAppointmentFlow({
  customerId,
  text,
}: {
  customerId: string;
  text: string;
}): Promise<string | null> {
  const bookableServices = await prisma.service.findMany({
    where: { isActive: true, isBookable: true },
  });

  if (!bookableServices.length) {
    return "We don't currently support online booking for any services — a team member will help you shortly.";
  }

  const list = bookableServices.map((s) => `- ${s.name}${s.durationMin ? ` (${s.durationMin} min)` : ""}`).join("\n");
  return `I'd be happy to help you book an appointment! Here's what we offer:\n\n${list}\n\nReply with the service name and your preferred date/time, and our team will confirm it.`;
}

export async function createAppointment(data: {
  customerId: string;
  serviceId?: string;
  scheduledAt: Date;
  durationMin?: number;
  notes?: string;
}) {
  return prisma.appointment.create({
    data: {
      customerId: data.customerId,
      serviceId: data.serviceId,
      scheduledAt: data.scheduledAt,
      durationMin: data.durationMin ?? 30,
      notes: data.notes,
      status: AppointmentStatus.PENDING,
    },
  });
}

/** Checks whether a proposed slot overlaps an existing non-cancelled appointment. */
export async function isSlotAvailable(scheduledAt: Date, durationMin = 30): Promise<boolean> {
  const end = addMinutes(scheduledAt, durationMin);
  const overlapping = await prisma.appointment.findMany({
    where: { status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] } },
  });
  return !overlapping.some((appt) => {
    const apptEnd = addMinutes(appt.scheduledAt, appt.durationMin);
    return isBefore(appt.scheduledAt, end) && isBefore(scheduledAt, apptEnd);
  });
}

export async function listAppointments(status?: AppointmentStatus) {
  return prisma.appointment.findMany({
    where: status ? { status } : undefined,
    include: { customer: true, service: true },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  return prisma.appointment.update({ where: { id }, data: { status } });
}
