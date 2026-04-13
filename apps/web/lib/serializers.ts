import type { PunchItem, Project } from "@prisma/client";

import { lastProjectActivityAt } from "@/lib/project-activity";

export type ProjectListSerialized = {
  id: string;
  name: string;
  address: string;
  status: string;
  createdAt: string;
  lastActivityAt: string;
  _count: { items: number };
};

export type PunchItemSerialized = {
  id: string;
  projectId: string;
  location: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  photo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetailSerialized = Omit<Project, "createdAt" | "updatedAt"> & {
  createdAt: string;
  lastActivityAt: string;
  items: PunchItemSerialized[];
};

export function serializeProjectListItem(
  p: Project & { _count: { items: number } },
  lastActivity: Date,
): ProjectListSerialized {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    lastActivityAt: lastActivity.toISOString(),
    _count: p._count,
  };
}

export function serializePunchItem(i: PunchItem): PunchItemSerialized {
  return {
    id: i.id,
    projectId: i.projectId,
    location: i.location,
    description: i.description,
    status: i.status,
    priority: i.priority,
    assignedTo: i.assignedTo,
    photo: i.photo,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}

export function serializeProjectDetail(
  p: Project & { items: PunchItem[] },
): ProjectDetailSerialized {
  const itemsMax =
    p.items.length > 0
      ? new Date(
          Math.max(...p.items.map((i) => i.updatedAt.getTime())),
        )
      : null;
  const lastActivity = lastProjectActivityAt(p, itemsMax);

  return {
    id: p.id,
    name: p.name,
    address: p.address,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    lastActivityAt: lastActivity.toISOString(),
    items: p.items.map(serializePunchItem),
  };
}
