import type { PunchItem, Project } from "@prisma/client";

export type ProjectListSerialized = {
  id: string;
  name: string;
  address: string;
  status: string;
  createdAt: string;
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
};

export type ProjectDetailSerialized = Omit<Project, "createdAt"> & {
  createdAt: string;
  items: PunchItemSerialized[];
};

export function serializeProjectListItem(
  p: Project & { _count: { items: number } },
): ProjectListSerialized {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
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
  };
}

export function serializeProjectDetail(
  p: Project & { items: PunchItem[] },
): ProjectDetailSerialized {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    items: p.items.map(serializePunchItem),
  };
}
