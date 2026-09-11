import { prisma } from "@/lib/prisma";
import { getCurrentAdminEmail } from "@/lib/auth";
import SettingsForm from "@/components/dashboard/settings-form";
import ChangePasswordForm from "@/components/dashboard/change-password-form";
import StaffManager from "@/components/dashboard/staff-manager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, staff, currentEmail] = await Promise.all([
    prisma.businessSettings.findUnique({ where: { id: "singleton" } }),
    prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    getCurrentAdminEmail(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <SettingsForm settings={settings} />
      <ChangePasswordForm />
      <StaffManager
        staff={staff.map((s: any) => ({ ...s, createdAt: s.createdAt.toISOString() }))}
        currentEmail={currentEmail}
      />
    </div>
  );
}
