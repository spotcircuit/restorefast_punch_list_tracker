import type { ProjectDashboardStats } from "@/lib/dashboard/project-dashboard";

import { PriorityIndicator } from "./priority-indicator";
import s from "./punch-list.module.css";

type Props = {
  stats: ProjectDashboardStats;
  /** Narrow column layout (e.g. project page sidebar). */
  sidebar?: boolean;
};

function maxCount(rows: { count: number }[]) {
  return rows.reduce((m, r) => Math.max(m, r.count), 0);
}

function barClassForPriority(key: string): string {
  const k = key.toLowerCase();
  if (k === "low") return s.barFillLow;
  if (k === "high") return s.barFillHigh;
  return s.barFillNormal;
}

function BreakdownBlock({
  title,
  rows,
  variant = "default",
}: {
  title: string;
  rows: { key: string; count: number }[];
  variant?: "default" | "priority";
}) {
  const max = maxCount(rows);
  if (rows.length === 0) {
    return (
      <div className={s.dashBlock}>
        <h3 className={s.dashBlockTitle}>{title}</h3>
        <p className={s.muted}>No data yet.</p>
      </div>
    );
  }

  return (
    <div className={s.dashBlock}>
      <h3 className={s.dashBlockTitle}>{title}</h3>
      <ul className={s.dashList}>
        {rows.map((row) => (
          <li key={row.key} className={s.dashRow}>
            <div className={s.barTrack} aria-hidden>
              <div
                className={
                  variant === "priority"
                    ? barClassForPriority(row.key)
                    : s.barFill
                }
                style={{ width: max > 0 ? `${(row.count / max) * 100}%` : "0%" }}
              />
            </div>
            <div className={s.dashRowLabel}>
              {variant === "priority" ? (
                <span className={s.dashKeyWithDot}>
                  <PriorityIndicator priority={row.key} />
                </span>
              ) : (
                <span className={s.dashKey}>{row.key}</span>
              )}
              <span className={s.dashCount}>{row.count}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectDashboardPanel({ stats, sidebar }: Props) {
  return (
    <section
      className={`${s.card} ${sidebar ? s.dashPanelSidebar : ""}`}
      aria-labelledby="dash-heading"
    >
      <h2
        id="dash-heading"
        className={s.title}
        style={{ fontSize: "1.15rem", marginBottom: "1rem" }}
      >
        Dashboard
      </h2>

      <div className={s.dashSummary}>
        <div className={s.dashMetric}>
          <span className={s.dashMetricLabel}>Completion</span>
          <span className={s.dashMetricValue}>
            {stats.total === 0 ? "—" : `${stats.completionPercent}%`}
          </span>
          <span className={s.dashMetricHint}>
            {stats.complete} of {stats.total} complete
          </span>
        </div>
        <div className={s.dashMetric}>
          <span className={s.dashMetricLabel}>Open</span>
          <span className={s.dashMetricValue}>{stats.open}</span>
        </div>
        <div className={s.dashMetric}>
          <span className={s.dashMetricLabel}>In progress</span>
          <span className={s.dashMetricValue}>{stats.inProgress}</span>
        </div>
        <div className={s.dashMetric}>
          <span className={s.dashMetricLabel}>Complete</span>
          <span className={s.dashMetricValue}>{stats.complete}</span>
        </div>
      </div>

      <div className={s.dashGrid}>
        <BreakdownBlock title="By location" rows={stats.byLocation} />
        <BreakdownBlock
          title="By priority"
          rows={stats.byPriority}
          variant="priority"
        />
        <BreakdownBlock title="By assignee" rows={stats.byAssignee} />
      </div>
    </section>
  );
}
