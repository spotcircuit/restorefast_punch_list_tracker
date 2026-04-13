/**
 * Punch item lifecycle per requirements.md — only these three values for MVP.
 * Transitions: open → in_progress → complete (no skipping, no backward moves, terminal complete).
 */

export const PUNCH_ITEM_STATUSES = ["open", "in_progress", "complete"] as const;

export type PunchItemStatus = (typeof PUNCH_ITEM_STATUSES)[number];

export function isPunchItemStatus(value: string): value is PunchItemStatus {
  return (PUNCH_ITEM_STATUSES as readonly string[]).includes(value);
}

/** Next statuses allowed from the current one (excluding no-op; same status is always OK separately). */
export const ALLOWED_NEXT_STATUS: Record<PunchItemStatus, readonly PunchItemStatus[]> = {
  open: ["in_progress"],
  in_progress: ["complete"],
  complete: [],
};

export class InvalidStatusTransitionError extends Error {
  readonly code = "INVALID_STATUS_TRANSITION";

  constructor(
    readonly from: PunchItemStatus,
    readonly to: PunchItemStatus,
    message?: string,
  ) {
    super(
      message ??
        `Illegal status change: ${from} → ${to}. Allowed: open→in_progress, in_progress→complete.`,
    );
    this.name = "InvalidStatusTransitionError";
  }
}

/**
 * Validates a status change. Same status is allowed (no-op).
 * @throws InvalidStatusTransitionError
 */
export function assertValidStatusTransition(
  from: string,
  to: string,
): asserts to is PunchItemStatus {
  if (from === to) {
    if (!isPunchItemStatus(to)) {
      throw new Error(`Unknown punch item status: ${to}`);
    }
    return;
  }

  if (!isPunchItemStatus(from)) {
    throw new Error(`Unknown punch item status: ${from}`);
  }
  if (!isPunchItemStatus(to)) {
    throw new Error(`Unknown punch item status: ${to}`);
  }

  const allowed = ALLOWED_NEXT_STATUS[from];
  if (!(allowed as readonly string[]).includes(to)) {
    throw new InvalidStatusTransitionError(from, to);
  }
}

/** For UI: legal targets from current status (not including current). */
export function allowedNextStatuses(current: string): PunchItemStatus[] {
  if (!isPunchItemStatus(current)) return [];
  return [...ALLOWED_NEXT_STATUS[current]];
}

/** Whether `<option value={target}>` should be selectable from `current` (current row is always allowed). */
export function isSelectableStatusTarget(
  current: string,
  target: PunchItemStatus,
): boolean {
  if (!isPunchItemStatus(current)) return false;
  if (current === target) return true;
  return (ALLOWED_NEXT_STATUS[current] as readonly string[]).includes(target);
}
