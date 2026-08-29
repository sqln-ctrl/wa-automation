import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Wrench,
  CalendarClock,
  HelpCircle,
  Settings,
  Bot,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/appointments", label: "Appointments", icon: CalendarClock },
  { href: "/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/automation", label: "Automation Rules", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r bg-card">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold">Business Dashboard</span>
        </div>
        <nav className="space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
