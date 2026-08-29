import { prisma } from "@/lib/prisma";
import { ConversationStatus } from "@prisma/client";

/** Finds the active (non-closed) conversation for a customer, or creates a new one. */
export async function findOrCreateActiveConversation(customerId: string) {
  const existing = await prisma.conversation.findFirst({
    where: { customerId, status: { not: ConversationStatus.CLOSED } },
    orderBy: { lastMessageAt: "desc" },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: { customerId, status: ConversationStatus.BOT },
  });
}

export async function listConversations(status?: ConversationStatus) {
  return prisma.conversation.findMany({
    where: status ? { status } : undefined,
    include: {
      customer: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });
}

export async function getConversationWithMessages(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      customer: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

/** Human agent takes over — bot stops auto-responding for this conversation. */
export async function takeOverConversation(id: string) {
  return prisma.conversation.update({
    where: { id },
    data: { status: ConversationStatus.HUMAN },
  });
}

/** Returns control to the bot. */
export async function returnToBot(id: string) {
  return prisma.conversation.update({
    where: { id },
    data: { status: ConversationStatus.BOT },
  });
}

export async function closeConversation(id: string) {
  return prisma.conversation.update({
    where: { id },
    data: { status: ConversationStatus.CLOSED },
  });
}
