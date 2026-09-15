import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
  NO_SHOW: "destructive",
};

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { scheduledAt: "asc" },
    include: { customer: true, service: true },
  });

  return (
    <div className="space-y-8">
      <div><p className="page-kicker">Booking queue</p><h1 className="page-title">Appointments in motion.</h1><p className="page-description">Keep an eye on upcoming customer requests from one organized schedule.</p></div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="saas-table">
            <thead>
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a: any) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium">{a.customer.name || a.customer.profileName || a.customer.waId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.service?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.scheduledAt.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[a.status] ?? "outline"}>{a.status}</Badge>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">No appointments yet.</td></tr>
              )}
            </tbody>
          </table></div>
        </CardContent>
      </Card>
    </div>
  );
}
