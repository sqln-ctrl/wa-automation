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
    <div className="space-y-8">
      <div><p className="page-kicker">Shared inbox</p><h1 className="page-title">Customer conversations</h1><p className="page-description">Follow every WhatsApp thread and take over exactly when a personal reply matters.</p></div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="saas-table">
            <thead>
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Last Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((c: any) => (
                <tr key={c.id}>
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
                  <td colSpan={4} className="py-10 text-center text-muted-foreground">
                    No conversations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table></div>
        </CardContent>
      </Card>
    </div>
  );
}
