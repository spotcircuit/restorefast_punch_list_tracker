import s from "./punch-list.module.css";

export function priorityDotClass(priority: string): string {
  const p = priority.toLowerCase();
  if (p === "low") return s.priorityDotLow;
  if (p === "high") return s.priorityDotHigh;
  return s.priorityDotNormal;
}

type Props = {
  priority: string;
  /** If false, only the colored dot (for tight layouts). */
  showLabel?: boolean;
};

export function PriorityIndicator({ priority, showLabel = true }: Props) {
  const label = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  return (
    <span className={s.priorityRow} title={`Priority: ${label}`}>
      <span
        className={`${s.priorityDot} ${priorityDotClass(priority)}`}
        aria-hidden
      />
      {showLabel ? <span className={s.priorityText}>{label}</span> : null}
    </span>
  );
}
