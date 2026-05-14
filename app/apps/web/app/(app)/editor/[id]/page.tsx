import { redirect } from "next/navigation";
import { getMyProject } from "@/app/actions/projects";
import { requireUser } from "@/lib/session";
import { Editor } from "@/components/editor/Editor";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getMyProject(id);
  if (!project) redirect("/dashboard");
  return <Editor project={project} userId={user.id} />;
}
