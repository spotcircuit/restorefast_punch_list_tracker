import { prisma } from "@/lib/prisma";

export type CountByKey = { key: string; count: number };

export type ProjectDashboardStats = {
  total: number;
  complete: number;
  inProgress: number;
  open: number;
  /** 0–100, one decimal (e.g. 66.7). */
  completionPercent: number;
  byLocation: CountByKey[];
  byPriority: CountByKey[];
  byAssignee: CountByKey[];
};

function countBy<T extends { status: string; location: string; priority: string; assignedTo: string | null }>(
  items: T[],
  getKey: (i: T) => string,
): CountByKey[] {
  const map = new Map<string, number>();
  for (const i of items) {
    const k = getKey(i);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export async function getProjectDashboardStats(
  projectId: string,
): Promise<ProjectDashboardStats> {
  const items = await prisma.punchItem.findMany({
    where: { projectId },
    select: {
      status: true,
      location: true,
      priority: true,
      assignedTo: true,
    },
  });

  const total = items.length;
  const complete = items.filter((i) => i.status === "complete").length;
  const inProgress = items.filter((i) => i.status === "in_progress").length;
  const open = items.filter((i) => i.status === "open").length;
  const completionPercent =
    total === 0 ? 0 : Math.round((complete / total) * 1000) / 10;

  return {
    total,
    complete,
    inProgress,
    open,
    completionPercent,
    byLocation: countBy(items, (i) => i.location),
    byPriority: countBy(items, (i) => i.priority),
    byAssignee: countBy(items, (i) =>
      i.assignedTo == null || i.assignedTo === "" ? "Unassigned" : i.assignedTo,
    ),
  };
}

export type ProjectListSummary = {
  total: number;
  complete: number;
  completionPercent: number;
};

/** Completion stats for many projects (for `/projects` list). */
export async function getProjectListSummaries(
  projectIds: string[],
): Promise<Record<string, ProjectListSummary>> {
  const result: Record<string, ProjectListSummary> = {};
  for (const id of projectIds) {
    result[id] = { total: 0, complete: 0, completionPercent: 0 };
  }
  if (projectIds.length === 0) return result;

  const groups = await prisma.punchItem.groupBy({
    by: ["projectId", "status"],
    where: { projectId: { in: projectIds } },
    _count: { _all: true },
  });

  const perProject: Record<string, Record<string, number>> = {};
  for (const id of projectIds) perProject[id] = {};

  for (const g of groups) {
    perProject[g.projectId][g.status] = g._count._all;
  }

  for (const id of projectIds) {
    const byStatus = perProject[id];
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    const complete = byStatus["complete"] ?? 0;
    const completionPercent =
      total === 0 ? 0 : Math.round((complete / total) * 1000) / 10;
    result[id] = { total, complete, completionPercent };
  }

  return result;
}
