import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: { customer: true, messages: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Conversations</h1>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Last Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((c: any) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <Link href={`/conversations/${c.id}`} className="font-medium hover:underline">
                      {c.customer.name || c.customer.profileName || c.customer.waId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{truncate(c.messages[0]?.content ?? "—", 60)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === "HUMAN" ? "destructive" : c.status === "CLOSED" ? "secondary" : "default"}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.lastMessageAt.toLocaleString()}</td>
                </tr>
              ))}
              {conversations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    No conversations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
