import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">WhatsApp Number</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{c.name || c.profileName || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.waId}</td>
                  <td className="px-4 py-3 space-x-1">
                    {c.tags.map((t: string) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                    {c.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No customers yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
