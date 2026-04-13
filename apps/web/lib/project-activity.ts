import type { Project } from "@prisma/client";

/**
 * Latest activity on a project: the more recent of the project row’s `updatedAt`
 * and any punch item’s `updatedAt` (create/update/status/etc.).
 */
export function lastProjectActivityAt(
  project: Pick<Project, "updatedAt">,
  punchItemsMaxUpdated: Date | null,
): Date {
  const a = project.updatedAt.getTime();
  const b = punchItemsMaxUpdated?.getTime() ?? 0;
  return new Date(Math.max(a, b));
}
