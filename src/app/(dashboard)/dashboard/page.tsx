import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentStatus, ConversationStatus } from "@/lib/db-enums";
import { ArrowRight, Bot, CalendarClock, MessageSquare, Sparkles, Users2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalCustomers, activeConversations, humanHandoffs, upcomingAppointments, activeRules] = await Promise.all([
    prisma.customer.count(),
    prisma.conversation.count({ where: { status: ConversationStatus.BOT } }),
    prisma.conversation.count({ where: { status: ConversationStatus.HUMAN } }),
    prisma.appointment.count({
      where: { status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }, scheduledAt: { gte: new Date() } },
    }),
    prisma.automationRule.count({ where: { isActive: true } }),
  ]);

  const stats = [
    { label: "Customers", value: totalCustomers, hint: "People in your workspace", icon: Users2, tone: "bg-violet-500/10 text-violet-600" },
    { label: "Bot-led chats", value: activeConversations, hint: "Automation has the conversation", icon: Bot, tone: "bg-indigo-500/10 text-indigo-600" },
    { label: "Needs attention", value: humanHandoffs, hint: "Waiting for a human reply", icon: MessageSquare, tone: "bg-amber-500/10 text-amber-600" },
    { label: "Upcoming bookings", value: upcomingAppointments, hint: "Pending or confirmed", icon: CalendarClock, tone: "bg-emerald-500/10 text-emerald-600" },
  ];

  const recentConversations = await prisma.conversation.findMany({
    take: 5,
    orderBy: { lastMessageAt: "desc" },
    include: { customer: true, messages: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="page-kicker">Automation overview</p>
          <h1 className="page-title">Your customer engine is ready.</h1>
          <p className="page-description">Monitor conversations, spot handoffs and keep your WhatsApp workflow moving from one calm workspace.</p>
        </div>
        <Link href="/conversations" className={buttonVariants({ size: "lg" })}>Open inbox <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-26px_rgba(33,38,94,0.35)]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.tone}`}><Icon className="h-5 w-5" /></div>
                  <span className="text-[11px] font-medium text-muted-foreground">Live data</span>
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between border-b border-border/70 pb-5">
            <div><p className="page-kicker">Inbox pulse</p><CardTitle className="mt-1">Recent conversations</CardTitle></div>
            <Link href="/conversations" className="text-sm font-semibold text-primary hover:text-primary/80">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentConversations.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MessageSquare className="h-5 w-5" /></div><p className="mt-4 text-sm font-semibold">Your inbox is quiet</p><p className="mt-1 max-w-xs text-sm text-muted-foreground">New customer conversations will show up here as they arrive.</p></div>
            ) : (
              <div className="divide-y divide-border/70">
                {recentConversations.map((conversation: any) => {
                  const customerName = conversation.customer.name || conversation.customer.profileName || conversation.customer.waId;
                  return (
                    <Link key={conversation.id} href={`/conversations/${conversation.id}`} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-accent/35">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-xs font-bold text-indigo-700">{customerName.slice(0, 2).toUpperCase()}</div>
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{customerName}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{conversation.messages[0]?.content ?? "No messages yet"}</p></div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5"><Badge variant={conversation.status === "HUMAN" ? "destructive" : conversation.status === "CLOSED" ? "secondary" : "default"}>{conversation.status === "BOT" ? "Automated" : conversation.status}</Badge><span className="text-[11px] text-muted-foreground">{conversation.lastMessageAt.toLocaleDateString()}</span></div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
          <CardContent className="relative flex min-h-full flex-col p-6">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><Sparkles className="h-5 w-5" /></div>
            <p className="relative mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">Automation health</p>
            <h2 className="relative mt-2 text-2xl font-semibold tracking-[-0.035em]">Your workflow is active.</h2>
            <p className="relative mt-3 text-sm leading-6 text-indigo-100">{activeRules} active {activeRules === 1 ? "rule is" : "rules are"} ready to qualify, respond and route new customer messages.</p>
            <div className="relative mt-7 rounded-xl border border-white/15 bg-slate-950/15 p-4"><div className="flex items-center justify-between text-sm"><span className="text-indigo-100">WhatsApp connection</span><span className="flex items-center gap-1.5 font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Online</span></div></div>
            <Link href="/automation" className="relative mt-auto inline-flex items-center text-sm font-semibold text-white hover:text-indigo-100">Review automations <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
