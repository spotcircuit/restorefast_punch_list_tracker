import { ProjectsView } from "@/components/projects/projects-view";
import { getProjectListSummaries } from "@/lib/dashboard/project-dashboard";
import { prisma } from "@/lib/prisma";
import { serializeProjectListItem } from "@/lib/serializers";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const rows = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  const projects = rows.map(serializeProjectListItem);
  const summaries = await getProjectListSummaries(rows.map((r) => r.id));

  return <ProjectsView projects={projects} summaries={summaries} />;
}
