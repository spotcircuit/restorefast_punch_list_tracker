/**
 * Project.status in Prisma defaults to "active"; allow archive for future UX without schema change yet.
 */

export const PROJECT_STATUSES = ["active", "archived"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value);
}
