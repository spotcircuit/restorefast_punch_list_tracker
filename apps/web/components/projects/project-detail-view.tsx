"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Modal } from "@/components/ui/modal";
import type { ProjectDashboardStats } from "@/lib/dashboard/project-dashboard";
import type { ProjectDetailSerialized, PunchItemSerialized } from "@/lib/serializers";

import { CreatePunchItemForm } from "./create-punch-item-form";
import { ProjectDashboardPanel } from "./project-dashboard-panel";
import { PunchItemCard } from "./punch-item-card";
import s from "./punch-list.module.css";

type Props = {
  project: ProjectDetailSerialized;
  dashboard: ProjectDashboardStats;
};

type ColumnStatus = "open" | "in_progress" | "complete";

const KANBAN_COLUMNS: {
  status: ColumnStatus;
  title: string;
  headerClass: string;
}[] = [
  { status: "open", title: "Open", headerClass: s.kanbanColumnHeaderOpen },
  {
    status: "in_progress",
    title: "In progress",
    headerClass: s.kanbanColumnHeaderProgress,
  },
  { status: "complete", title: "Completed", headerClass: s.kanbanColumnHeaderDone },
];

function sortByCreatedDesc(items: PunchItemSerialized[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function itemsSignature(rows: PunchItemSerialized[]) {
  return rows
    .map((i) => `${i.id}:${i.status}`)
    .sort()
    .join("|");
}

export function ProjectDetailView({ project, dashboard }: Props) {
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [serverSig, setServerSig] = useState(() => itemsSignature(project.items));
  const [optimisticById, setOptimisticById] = useState<
    Record<string, PunchItemSerialized>
  >({});

  const nextSig = itemsSignature(project.items);
  if (nextSig !== serverSig) {
    setServerSig(nextSig);
    setOptimisticById({});
  }

  const items = useMemo(() => {
    return project.items.map((i) => optimisticById[i.id] ?? i);
  }, [project.items, optimisticById]);

  const itemsByStatus = useMemo(() => {
    const buckets: Record<ColumnStatus, PunchItemSerialized[]> = {
      open: [],
      in_progress: [],
      complete: [],
    };
    for (const item of items) {
      if (item.status === "open") buckets.open.push(item);
      else if (item.status === "in_progress") buckets.in_progress.push(item);
      else if (item.status === "complete") buckets.complete.push(item);
      else buckets.open.push(item);
    }
    return {
      open: sortByCreatedDesc(buckets.open),
      in_progress: sortByCreatedDesc(buckets.in_progress),
      complete: sortByCreatedDesc(buckets.complete),
    };
  }, [items]);

  function handleItemUpdated(updated: PunchItemSerialized) {
    setOptimisticById((prev) => ({ ...prev, [updated.id]: updated }));
  }

  return (
    <div className={s.pageProjectDetail}>
      <header className={s.header}>
        <div>
          <Link href="/projects" className={s.linkBack}>
            ← Back to projects
          </Link>
          <h1 className={s.title}>{project.name}</h1>
          <p className={s.subtitle}>{project.address}</p>
          <p className={s.itemMeta}>
            Status: {project.status} · {items.length} item
            {items.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          className={s.btnPrimary}
          onClick={() => setItemModalOpen(true)}
        >
          + Add punch item
        </button>
      </header>

      <Modal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title="Add punch item"
      >
        <CreatePunchItemForm
          projectId={project.id}
          embedded
          onSuccess={() => setItemModalOpen(false)}
          onCancel={() => setItemModalOpen(false)}
        />
      </Modal>

      <div className={s.detailLayout}>
        <aside className={s.detailSidebar}>
          <ProjectDashboardPanel stats={dashboard} sidebar />
        </aside>

        <div className={s.detailMain}>
          <h2 className={s.kanbanSectionTitle}>Punch items</h2>
          {items.length === 0 ? (
            <div className={s.emptyState}>
              No punch items yet. Use <strong>Add punch item</strong> to log the
              first defect or incomplete task.
            </div>
          ) : (
            <div className={s.kanbanBoard}>
              {KANBAN_COLUMNS.map((col) => {
                const columnItems = itemsByStatus[col.status];
                return (
                  <div key={col.status} className={s.kanbanColumn}>
                    <div
                      className={`${s.kanbanColumnHeader} ${col.headerClass}`}
                    >
                      <span>{col.title}</span>
                      <span className={s.kanbanCount}>{columnItems.length}</span>
                    </div>
                    <div className={s.kanbanColumnBody}>
                      {columnItems.length === 0 ? (
                        <div className={s.kanbanEmpty}>No items in this column</div>
                      ) : (
                        columnItems.map((item) => (
                          <PunchItemCard
                            key={item.id}
                            item={item}
                            onItemUpdated={handleItemUpdated}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
