"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  conversation: {
    id: string;
    status: string;
    customer: { name: string | null; profileName: string | null; waId: string };
    messages: Array<{ id: string; direction: string; content: string; createdAt: Date; isFromBot: boolean }>;
  };
}

export default function ConversationThread({ conversation }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function sendReply() {
    if (!text.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/conversations/${conversation.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      setText("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  async function toggleTakeover() {
    await fetch(`/api/conversations/${conversation.id}/takeover`, {
      method: conversation.status === "HUMAN" ? "DELETE" : "POST",
    });
    router.refresh();
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-semibold">
            {conversation.customer.name || conversation.customer.profileName || conversation.customer.waId}
          </h1>
          <p className="text-sm text-muted-foreground">{conversation.customer.waId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={conversation.status === "HUMAN" ? "destructive" : "default"}>{conversation.status}</Badge>
          <Button variant="outline" size="sm" onClick={toggleTakeover}>
            {conversation.status === "HUMAN" ? "Return to bot" : "Take over"}
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {conversation.messages.map((m) => (
          <div key={m.id} className={cn("flex", m.direction === "INBOUND" ? "justify-start" : "justify-end")}>
            <div
              className={cn(
                "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                m.direction === "INBOUND" ? "bg-muted" : m.isFromBot ? "bg-primary/20" : "bg-primary text-primary-foreground"
              )}
            >
              <p>{m.content}</p>
              <p className="mt-1 text-[10px] opacity-70">{new Date(m.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t pt-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a reply..."
          onKeyDown={(e) => e.key === "Enter" && sendReply()}
        />
        <Button onClick={sendReply} disabled={sending}>
          Send
        </Button>
      </div>
    </div>
  );
}
