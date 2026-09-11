// Higher-level WhatsApp operations that combine lib/whatsapp.ts calls with persistence.
import { prisma } from "@/lib/prisma";
import { sendTextMessage } from "@/lib/whatsapp";
import { MessageDirection, MessageType } from "@/lib/db-enums";

/** Sends a manual (human-agent) message from the dashboard and logs it. */
export async function sendManualReply(conversationId: string, waId: string, text: string) {
  await sendTextMessage(waId, text);
  const message = await prisma.message.create({
    data: {
      conversationId,
      direction: MessageDirection.OUTBOUND,
      type: MessageType.TEXT,
      content: text,
      isFromBot: false,
    },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });
  return message;
}
