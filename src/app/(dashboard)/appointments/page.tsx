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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Appointments</h1>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a: any) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{a.customer.name || a.customer.profileName || a.customer.waId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.service?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.scheduledAt.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[a.status] ?? "outline"}>{a.status}</Badge>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No appointments yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
