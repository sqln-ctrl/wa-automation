// Orchestrates the full message-processing pipeline:
// Rule-Based Automation -> AI Response Engine -> Appointment Logic -> Human Handoff
import { prisma } from "@/lib/prisma";
import { matchRuleBasedResponse, shouldHandoff } from "@/lib/chatbot";
import { generateAiReply, buildSystemPrompt, isAiEnabled } from "@/lib/ai";
import { sendTextMessage } from "@/lib/whatsapp";
import { detectAppointmentIntent, handleAppointmentFlow } from "@/services/appointment.service";
import { ConversationStatus, MessageDirection, MessageType } from "@/lib/db-enums";

interface ProcessArgs {
  conversationId: string;
  customerId: string;
  waId: string;
  text: string;
}

/** Main entry point invoked by the webhook handler for every inbound text message. */
export async function processIncomingMessage({ conversationId, customerId, waId, text }: ProcessArgs) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });

  // If a human has taken over, the bot stays silent.
  if (conversation?.status === ConversationStatus.HUMAN) {
    return;
  }

  // 1. Appointment flow takes priority if the customer is mid-booking or asking to book.
  const appointmentIntent = await detectAppointmentIntent(text);
  if (appointmentIntent) {
    const reply = await handleAppointmentFlow({ customerId, text });
    if (reply) {
      await sendAndLog(conversationId, waId, reply, { isFromBot: true });
      return;
    }
  }

  // 2. Human handoff keywords.
  if (await shouldHandoff(text)) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: ConversationStatus.HUMAN },
    });
    await sendAndLog(
      conversationId,
      waId,
      "I'm connecting you with a team member now — they'll be with you shortly.",
      { isFromBot: true }
    );
    return;
  }

  // 3. Rule-based automation (FAQs, keyword rules, greetings).
  const ruleMatch = await matchRuleBasedResponse(text);
  if (ruleMatch.responseText) {
    await sendAndLog(conversationId, waId, ruleMatch.responseText, { isFromBot: true });
    return;
  }

  // 4. AI fallback, if enabled.
  const settings = await prisma.businessSettings.findUnique({ where: { id: "singleton" } });
  if (isAiEnabled() && settings?.aiEnabled) {
    const [services, faqs, recentMessages] = await Promise.all([
      prisma.service.findMany({ where: { isActive: true } }),
      prisma.faq.findMany({ where: { isActive: true } }),
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const systemPrompt = buildSystemPrompt({
      businessName: settings.businessName,
      services: services.map((s: any) => ({ name: s.name, description: s.description, price: s.price?.toString() })),
      faqs,
      customPrompt: settings.aiSystemPrompt,
    });

    const history = recentMessages
      .reverse()
      .map((m: any) => ({
        role: (m.direction === MessageDirection.INBOUND ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

    const aiReply = await generateAiReply(history, systemPrompt);
    if (aiReply) {
      await sendAndLog(conversationId, waId, aiReply, { isFromBot: true, isFromAi: true });
      return;
    }
  }

  // 5. Nothing matched — offer human handoff instead of leaving the customer stuck.
  await sendAndLog(
    conversationId,
    waId,
    "Thanks for your message! Let me connect you with our team so they can help you directly.",
    { isFromBot: true }
  );
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: ConversationStatus.HUMAN },
  });
}

async function sendAndLog(
  conversationId: string,
  waId: string,
  text: string,
  opts: { isFromBot?: boolean; isFromAi?: boolean }
) {
  await sendTextMessage(waId, text);
  await prisma.message.create({
    data: {
      conversationId,
      direction: MessageDirection.OUTBOUND,
      type: MessageType.TEXT,
      content: text,
      isFromBot: !!opts.isFromBot,
      isFromAi: !!opts.isFromAi,
    },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });
}
