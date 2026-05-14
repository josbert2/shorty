import { listMyProjects } from "@/app/actions/projects";
import { getSession } from "@/lib/session";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default async function DashboardPage() {
  const session = await getSession();
  const projects = await listMyProjects();
  return (
    <Dashboard
      initialProjects={projects}
      user={{
        name: session?.user.name ?? "Usuario",
        email: session?.user.email ?? "",
      }}
    />
  );
}
