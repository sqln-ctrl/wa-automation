import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversationStatus, AppointmentStatus } from "@/lib/db-enums";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalCustomers, activeConversations, humanHandoffs, upcomingAppointments] = await Promise.all([
    prisma.customer.count(),
    prisma.conversation.count({ where: { status: ConversationStatus.BOT } }),
    prisma.conversation.count({ where: { status: ConversationStatus.HUMAN } }),
    prisma.appointment.count({
      where: { status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }, scheduledAt: { gte: new Date() } },
    }),
  ]);

  const stats = [
    { label: "Total Customers", value: totalCustomers },
    { label: "Bot-Handled Conversations", value: activeConversations },
    { label: "Waiting for a Human", value: humanHandoffs },
    { label: "Upcoming Appointments", value: upcomingAppointments },
  ];

  const recentConversations = await prisma.conversation.findMany({
    take: 5,
    orderBy: { lastMessageAt: "desc" },
    include: { customer: true, messages: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentConversations.length === 0 && (
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
          )}
          {recentConversations.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div>
                <p className="text-sm font-medium">{c.customer.name || c.customer.profileName || c.customer.waId}</p>
                <p className="text-xs text-muted-foreground">{c.messages[0]?.content ?? "No messages"}</p>
              </div>
              <span className="text-xs text-muted-foreground">{c.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
