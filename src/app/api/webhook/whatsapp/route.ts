import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, markMessageAsRead } from "@/lib/whatsapp";
import { findOrCreateCustomer } from "@/services/customer.service";
import { findOrCreateActiveConversation } from "@/services/conversation.service";
import { saveInboundMessage, updateMessageStatusByWaId } from "@/services/message.service";
import { processIncomingMessage } from "@/lib/automation";
import type { WhatsAppWebhookPayload } from "@/types/whatsapp";
import { MessageStatus } from "@prisma/client";

/**
 * GET /api/webhook/whatsapp
 * Webhook verification handshake required by Meta when configuring the webhook URL.
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST /api/webhook/whatsapp
 * Receives inbound messages and delivery/read status updates from WhatsApp Cloud API.
 * Always responds 200 quickly — Meta retries aggressively on non-2xx responses.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  // Signature verification is skipped only if WHATSAPP_APP_SECRET isn't configured yet
  // (e.g. during local development) — always set it in production.
  if (process.env.WHATSAPP_APP_SECRET && !verifyWebhookSignature(rawBody, signature)) {
    console.error("[webhook] Invalid signature");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;

        // --- Inbound customer messages ---
        for (const msg of value.messages ?? []) {
          const contact = value.contacts?.find((c) => c.wa_id === msg.from);

          const customer = await findOrCreateCustomer(msg.from, contact?.profile?.name);
          const conversation = await findOrCreateActiveConversation(customer.id);
          await saveInboundMessage(conversation.id, msg);

          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
          });

          markMessageAsRead(msg.id).catch((err) =>
            console.error("[webhook] markMessageAsRead failed:", err)
          );

          const text =
            msg.text?.body ??
            msg.interactive?.button_reply?.title ??
            msg.interactive?.list_reply?.title ??
            "";

          if (text) {
            // Fire-and-forget so the webhook responds quickly; errors are logged, not thrown.
            processIncomingMessage({
              conversationId: conversation.id,
              customerId: customer.id,
              waId: customer.waId,
              text,
            }).catch((err) => console.error("[webhook] processIncomingMessage failed:", err));
          }
        }

        // --- Delivery / read status updates ---
        for (const status of value.statuses ?? []) {
          const mapped =
            status.status === "delivered"
              ? MessageStatus.DELIVERED
              : status.status === "read"
              ? MessageStatus.READ
              : status.status === "failed"
              ? MessageStatus.FAILED
              : MessageStatus.SENT;
          await updateMessageStatusByWaId(status.id, mapped);

          if (status.errors?.length) {
            console.error("[webhook] Message error:", JSON.stringify(status.errors));
          }
        }
      }
    }
  } catch (err) {
    console.error("[webhook] Unhandled error:", err);
    // Still return 200 — we don't want Meta to keep retrying a payload we've already logged.
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
