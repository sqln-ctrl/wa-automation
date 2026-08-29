import { getConversationWithMessages } from "@/services/conversation.service";
import { notFound } from "next/navigation";
import ConversationThread from "@/components/conversations/conversation-thread";

export const dynamic = "force-dynamic";

export default async function ConversationDetailPage({ params }: { params: { id: string } }) {
  const conversation = await getConversationWithMessages(params.id);
  if (!conversation) notFound();

  return <ConversationThread conversation={conversation} />;
}
