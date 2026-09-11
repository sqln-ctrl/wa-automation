import { NextRequest, NextResponse } from "next/server";
import { listConversations } from "@/services/conversation.service";
import { ConversationStatus } from "@/lib/db-enums";

export async function GET(req: NextRequest) {
  const statusParam = req.nextUrl.searchParams.get("status");
  const status =
    statusParam && statusParam in ConversationStatus
      ? (statusParam as ConversationStatus)
      : undefined;
  const conversations = await listConversations(status);
  return NextResponse.json(conversations);
}
