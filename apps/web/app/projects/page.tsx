import { ProjectsView } from "@/components/projects/projects-view";
import { getProjectListSummaries } from "@/lib/dashboard/project-dashboard";
import { prisma } from "@/lib/prisma";
import { lastProjectActivityAt } from "@/lib/project-activity";
import { serializeProjectListItem } from "@/lib/serializers";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const rows = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  const ids = rows.map((r) => r.id);
  const itemMaxByProject =
    ids.length > 0
      ? await prisma.punchItem.groupBy({
          by: ["projectId"],
          _max: { updatedAt: true },
          where: { projectId: { in: ids } },
        })
      : [];

  const punchMaxMap = new Map(
    itemMaxByProject.map((row) => [
      row.projectId,
      row._max.updatedAt as Date,
    ]),
  );

  const projects = rows.map((p) => {
    const punchMax = punchMaxMap.get(p.id) ?? null;
    const lastAt = lastProjectActivityAt(p, punchMax);
    return serializeProjectListItem(p, lastAt);
  });

  const summaries = await getProjectListSummaries(rows.map((r) => r.id));

  return <ProjectsView projects={projects} summaries={summaries} />;
}
