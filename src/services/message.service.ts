import { prisma } from "@/lib/prisma";
import { MessageDirection, MessageStatus, MessageType } from "@/lib/db-enums";
import type { WhatsAppInboundMessage } from "@/types/whatsapp";

/** Maps a WhatsApp Cloud API inbound message onto our internal MessageType enum. */
function mapMessageType(type: WhatsAppInboundMessage["type"]): MessageType {
  switch (type) {
    case "text":
      return MessageType.TEXT;
    case "image":
      return MessageType.IMAGE;
    case "document":
      return MessageType.DOCUMENT;
    case "audio":
      return MessageType.AUDIO;
    case "video":
      return MessageType.VIDEO;
    case "location":
      return MessageType.LOCATION;
    case "interactive":
      return MessageType.INTERACTIVE_BUTTON;
    case "sticker":
      return MessageType.STICKER;
    default:
      return MessageType.UNKNOWN;
  }
}

/** Extracts a plain-text representation from any inbound message type, for storage and matching. */
export function extractMessageText(msg: WhatsAppInboundMessage): string {
  if (msg.text?.body) return msg.text.body;
  if (msg.interactive?.button_reply) return msg.interactive.button_reply.title;
  if (msg.interactive?.list_reply) return msg.interactive.list_reply.title;
  if (msg.button?.text) return msg.button.text;
  if (msg.location) return `[location: ${msg.location.latitude},${msg.location.longitude}]`;
  if (msg.image) return "[image]";
  if (msg.document) return "[document]";
  if (msg.audio) return "[audio]";
  if (msg.video) return "[video]";
  return "[unsupported message type]";
}

export async function saveInboundMessage(conversationId: string, msg: WhatsAppInboundMessage) {
  return prisma.message.create({
    data: {
      conversationId,
      whatsappMsgId: msg.id,
      direction: MessageDirection.INBOUND,
      type: mapMessageType(msg.type),
      content: extractMessageText(msg),
      rawPayload: msg as any,
      status: MessageStatus.RECEIVED,
    },
  });
}

export async function updateMessageStatusByWaId(whatsappMsgId: string, status: MessageStatus) {
  return prisma.message.updateMany({
    where: { whatsappMsgId },
    data: { status },
  });
}
