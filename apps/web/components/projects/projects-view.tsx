"use client";

import Link from "next/link";
import { useState } from "react";

import { Modal } from "@/components/ui/modal";
import type { ProjectListSummary } from "@/lib/dashboard/project-dashboard";
import type { ProjectListSerialized } from "@/lib/serializers";

import { CreateProjectForm } from "./create-project-form";
import s from "./punch-list.module.css";

type Props = {
  projects: ProjectListSerialized[];
  summaries: Record<string, ProjectListSummary>;
};

export function ProjectsView({ projects, summaries }: Props) {
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  return (
    <div className={s.pageWide}>
      <header className={s.header}>
        <div>
          <h1 className={s.title}>Punch list tracker</h1>
          <p className={s.subtitle}>
            Jobsites, punch items, and closeout progress
          </p>
        </div>
        <button
          type="button"
          className={s.btnPrimary}
          onClick={() => setProjectModalOpen(true)}
        >
          + Add project
        </button>
      </header>

      <Modal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title="New project"
      >
        <CreateProjectForm
          embedded
          onSuccess={() => setProjectModalOpen(false)}
          onCancel={() => setProjectModalOpen(false)}
        />
      </Modal>

      <section className={s.card}>
        <h2 className={s.sectionTitle}>All projects</h2>
        {projects.length === 0 ? (
          <div className={s.emptyState}>
            No projects yet. Use <strong>Add project</strong> to create your first
            jobsite.
          </div>
        ) : (
          <div className={s.tableWrap}>
            <table className={s.projectTable}>
              <thead>
                <tr>
                  <th scope="col">Project</th>
                  <th scope="col">Jobsite address</th>
                  <th scope="col">Items</th>
                  <th scope="col">Completion</th>
                  <th scope="col">Status</th>
                  <th scope="col" className={s.tableActionHeader}>
                    <span className={s.srOnly}>Open project</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const ssum = summaries[p.id];
                  const completionLabel =
                    ssum && ssum.total > 0
                      ? `${ssum.completionPercent}%`
                      : "—";
                  const itemLabel =
                    p._count.items === 1 ? "1 item" : `${p._count.items} items`;
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/projects/${p.id}`} className={s.projectLink}>
                          {p.name}
                        </Link>
                      </td>
                      <td>{p.address}</td>
                      <td>{itemLabel}</td>
                      <td>
                        {completionLabel === "—" ? (
                          <span className={s.cellMuted}>{completionLabel}</span>
                        ) : (
                          completionLabel
                        )}
                      </td>
                      <td className={`${s.cellMuted} ${s.statusCell}`}>
                        {p.status.replace(/_/g, " ")}
                      </td>
                      <td className={s.tableActionCell}>
                        <Link
                          href={`/projects/${p.id}`}
                          className={s.projectIconLink}
                          aria-label={`Go to project: ${p.name}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
