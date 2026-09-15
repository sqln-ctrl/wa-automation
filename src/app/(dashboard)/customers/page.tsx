import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div><p className="page-kicker">Customer directory</p><h1 className="page-title">Know who&apos;s on the other side.</h1><p className="page-description">A clean view of the people engaging with your WhatsApp automation.</p></div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="saas-table">
            <thead>
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">WhatsApp Number</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id}>
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
                <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">No customers yet.</td></tr>
              )}
            </tbody>
          </table></div>
        </CardContent>
      </Card>
    </div>
  );
}
