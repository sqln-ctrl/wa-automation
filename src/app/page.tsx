import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Users2,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "One unified inbox",
    description: "See every WhatsApp conversation, context and handoff in one focused workspace.",
  },
  {
    icon: Bot,
    title: "Smart automations",
    description: "Use FAQs, keyword rules and AI fallback to answer the repetitive questions instantly.",
  },
  {
    icon: CalendarClock,
    title: "Book while you chat",
    description: "Turn customer intent into appointment requests without another back-and-forth.",
  },
  {
    icon: Users2,
    title: "Human when it matters",
    description: "Give your team a clean handoff when a conversation needs a personal touch.",
  },
];

export default async function LandingPage() {
  const settings = await prisma.businessSettings.findUnique({ where: { id: "singleton" } });
  const businessName = settings?.businessName || "Your Business";

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_5%,rgba(129,140,248,0.3),transparent_25rem),radial-gradient(circle_at_85%_18%,rgba(168,85,247,0.18),transparent_25rem)]" />
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight">FlowPilot</span>
            <span className="block text-xs text-slate-400">WhatsApp automation</span>
          </span>
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm", className: "border-white/15 bg-white/5 text-white shadow-none hover:bg-white/10 hover:text-white" })}>
          Sign in
        </Link>
      </header>

      <main className="relative">
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-32 lg:pt-24">
          <div>
            <Badge className="border border-indigo-300/20 bg-indigo-400/10 text-indigo-200">
              <Zap className="mr-1.5 h-3 w-3" /> Built for responsive teams
            </Badge>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[1.03] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Turn WhatsApp into your <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">always-on</span> growth engine.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              {businessName} can answer, qualify and route customers around the clock—while your team stays in control of every important conversation.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/login" className={buttonVariants({ size: "lg", className: "bg-white text-slate-950 shadow-xl shadow-indigo-950/40 hover:bg-slate-100" })}>
                Open your workspace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <span className="flex items-center gap-2 text-sm text-slate-400"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Automation ready when you are</span>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Instant FAQ responses</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-400" /> Seamless human handoffs</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-900/85 p-4 shadow-2xl shadow-black/35 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-2 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200"><MessageSquare className="h-4 w-4" /></div>
                  <div><p className="text-sm font-semibold">Customer conversations</p><p className="text-xs text-slate-400">Live automation view</p></div>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">Live</span>
              </div>
              <div className="space-y-4 p-2 pt-5">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold">SM</div>
                  <div className="max-w-[76%] rounded-2xl rounded-tl-sm bg-white/[0.08] px-3.5 py-3 text-sm leading-5 text-slate-200">Hi, I&apos;d like to book a consultation this week.</div>
                </div>
                <div className="ml-11 flex items-center gap-2 text-[11px] font-medium text-indigo-300"><Bot className="h-3.5 w-3.5" /> FlowPilot matched: appointment intent</div>
                <div className="flex justify-end gap-3">
                  <div className="max-w-[76%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-500 to-violet-600 px-3.5 py-3 text-sm leading-5 text-white shadow-lg shadow-indigo-500/15">Absolutely. Here are the available services—what works best for you?</div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold">FP</div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                {[["FAQs", "Matched"], ["Booking", "Routed"], ["Team", "Available"]].map(([label, state]) => (
                  <div key={label} className="rounded-xl bg-white/[0.05] p-3"><p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{label}</p><p className="mt-1 text-xs font-semibold text-slate-200">{state}</p></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-y border-white/10 bg-white/[0.03] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">One calm command center</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Everything your customer conversations need.</h2></div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="rounded-2xl border border-white/10 bg-slate-900/65 p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-indigo-300/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-200"><feature.icon className="h-5 w-5" /></div>
                  <h3 className="mt-5 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span>FlowPilot · WhatsApp automation for modern service teams</span>
        <span>Private workspace for owners and staff</span>
      </footer>
    </div>
  );
}
