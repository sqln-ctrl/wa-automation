import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Bot, CalendarClock, Users2 } from "lucide-react";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Automated conversations",
    description: "Answer common customer questions on WhatsApp instantly, day or night.",
  },
  {
    icon: Bot,
    title: "Rule-based + AI chatbot",
    description: "Keyword-matched FAQs with an optional AI fallback for anything else.",
  },
  {
    icon: CalendarClock,
    title: "Appointment booking",
    description: "Let customers request appointments straight from a WhatsApp chat.",
  },
  {
    icon: Users2,
    title: "Human handoff",
    description: "Any conversation can be handed to your team in one click.",
  },
];

export default async function LandingPage() {
  // Already logged in — skip the marketing page and go straight to work.
  const email = await getCurrentAdminEmail();
  if (email) redirect("/dashboard");

  const settings = await prisma.businessSettings.findUnique({ where: { id: "singleton" } });
  const businessName = settings?.businessName || "Your Business";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-semibold">{businessName} — WhatsApp Automation</span>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          WhatsApp customer support, automated.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {businessName} answers customer questions, books appointments, and hands
          off to a real person the moment it matters — all on WhatsApp.
        </p>
        <div className="mt-8">
          <Link href="/login">
            <Button size="lg">Go to dashboard</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardContent className="space-y-2 p-5">
                <f.icon className="h-6 w-6 text-primary" />
                <h3 className="font-medium">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Owner and staff access only — this dashboard isn't customer-facing.
      </footer>
    </div>
  );
}
