import { requireUser } from "@/lib/session";
import { checkQuota } from "@/lib/usage";
import { Settings } from "@/components/settings/Settings";

export default async function SettingsPage() {
  const user = await requireUser();
  const quota = await checkQuota(user.id);

  return (
    <Settings
      user={{ id: user.id, name: user.name ?? "Usuario", email: user.email }}
      quota={{
        plan: quota.plan,
        used: quota.used,
        limit: quota.limit === Infinity ? null : quota.limit,
        hasVideoExports: quota.hasVideoExports,
      }}
    />
  );
}
