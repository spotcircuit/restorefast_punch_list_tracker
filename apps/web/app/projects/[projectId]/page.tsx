import { notFound } from "next/navigation";

import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { getProjectDashboardStats } from "@/lib/dashboard/project-dashboard";
import { prisma } from "@/lib/prisma";
import { serializeProjectDetail } from "@/lib/serializers";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ projectId: string }> };

export default async function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });

  if (!project) {
    notFound();
  }

  const dashboard = await getProjectDashboardStats(projectId);

  return (
    <ProjectDetailView
      project={serializeProjectDetail(project)}
      dashboard={dashboard}
    />
  );
}
