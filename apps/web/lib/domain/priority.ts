/**
 * Constrained priorities for dashboards; schema default in DB is "normal".
 */

export const PUNCH_ITEM_PRIORITIES = ["low", "normal", "high"] as const;

export type PunchItemPriority = (typeof PUNCH_ITEM_PRIORITIES)[number];

export function isPunchItemPriority(value: string): value is PunchItemPriority {
  return (PUNCH_ITEM_PRIORITIES as readonly string[]).includes(value);
}
