"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarClock,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/conversations", label: "Inbox", icon: MessageSquare },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/appointments", label: "Appointments", icon: CalendarClock },
  { href: "/faqs", label: "Knowledge base", icon: HelpCircle },
  { href: "/automation", label: "Automations", icon: Bot },
];

const MOBILE_NAV_ITEMS = [...NAV_ITEMS, { href: "/settings", label: "Settings", icon: Settings }];

function isCurrent(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export default function AppShellNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden min-h-screen w-[272px] shrink-0 flex-col bg-slate-950 p-4 text-slate-300 md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-xl px-3 py-2 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight">FlowPilot</span>
            <span className="block text-xs text-slate-400">Automation workspace</span>
          </span>
        </Link>

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-white/[0.12] text-white shadow-inner shadow-white/[0.03]"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] transition-colors", active ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-300")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            Automation is online
          </div>
          <p className="text-xs leading-5 text-slate-400">Your WhatsApp workflows are ready to respond around the clock.</p>
        </div>

        <Link href="/settings" className={cn("mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", pathname.startsWith("/settings") ? "bg-white/[0.12] text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100")}>
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-50 flex gap-1 overflow-x-auto rounded-2xl border border-white/70 bg-white/90 p-2 shadow-2xl shadow-slate-900/15 backdrop-blur md:hidden">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = isCurrent(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", active ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-label={item.label}>
              <item.icon className="h-4.5 w-4.5" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
