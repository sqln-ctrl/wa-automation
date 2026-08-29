import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/utils";

/** Finds a customer by WhatsApp ID, or creates one if this is their first message. */
export async function findOrCreateCustomer(waId: string, profileName?: string) {
  const normalized = normalizePhone(waId);
  return prisma.customer.upsert({
    where: { waId: normalized },
    update: profileName ? { profileName } : {},
    create: { waId: normalized, profileName },
  });
}

export async function listCustomers(search?: string) {
  return prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { profileName: { contains: search, mode: "insensitive" } },
            { waId: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      conversations: { orderBy: { lastMessageAt: "desc" }, take: 5 },
      appointments: { orderBy: { scheduledAt: "desc" }, take: 5 },
    },
  });
}

export async function updateCustomer(
  id: string,
  data: Partial<{ name: string; email: string; notes: string; tags: string[]; isBlocked: boolean }>
) {
  return prisma.customer.update({ where: { id }, data });
}
