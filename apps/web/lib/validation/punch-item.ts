import { z } from "zod";

import {
  assertValidStatusTransition,
  InvalidStatusTransitionError,
  isPunchItemStatus,
} from "@/lib/domain/punch-item-status";
import { PUNCH_ITEM_PRIORITIES } from "@/lib/domain/priority";

const prioritySchema = z.enum(
  PUNCH_ITEM_PRIORITIES as unknown as [string, ...string[]],
);

const punchItemStatusSchema = z.enum(
  ["open", "in_progress", "complete"] as unknown as [string, ...string[]],
);

/** Empty string or null → undefined; otherwise must be http(s) URL. */
const optionalPhotoUrl = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.string().url().max(2048).optional(),
);

/** New items always start `open` in the database (requirements). */
export const createPunchItemSchema = z.object({
  projectId: z.string().uuid("Invalid project id"),
  location: z.string().trim().min(1).max(2000),
  description: z.string().trim().min(1).max(8000),
  priority: prioritySchema.optional().default("normal"),
  assignedTo: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
  photo: optionalPhotoUrl,
});

export type CreatePunchItemInput = z.infer<typeof createPunchItemSchema>;

/** POST `/api/projects/:projectId/punch-items` — `projectId` comes from the URL. */
export const createPunchItemBodySchema = createPunchItemSchema.omit({
  projectId: true,
});

export type CreatePunchItemBodyInput = z.infer<typeof createPunchItemBodySchema>;

export const updatePunchItemSchema = z
  .object({
    location: z.string().trim().min(1).max(2000).optional(),
    description: z.string().trim().min(1).max(8000).optional(),
    priority: prioritySchema.optional(),
    assignedTo: z
      .string()
      .trim()
      .max(200)
      .optional()
      .nullable()
      .transform((s) => (s === "" ? null : s)),
    photo: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined ? undefined : val,
      z.union([z.string().url().max(2048), z.null()]).optional(),
    ),
    status: punchItemStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export type UpdatePunchItemInput = z.infer<typeof updatePunchItemSchema>;

/**
 * Validates body fields then enforces workflow when `status` is present.
 * @param currentStatus status currently stored in the database
 */
export function parseUpdatePunchItem(
  currentStatus: string,
  raw: unknown,
): UpdatePunchItemInput {
  const parsed = updatePunchItemSchema.parse(raw);
  if (parsed.status !== undefined) {
    if (!isPunchItemStatus(currentStatus)) {
      throw new z.ZodError([
        {
          code: "custom",
          path: ["status"],
          message: `Invalid existing status in database: ${currentStatus}`,
        },
      ]);
    }
    try {
      assertValidStatusTransition(currentStatus, parsed.status);
    } catch (e) {
      if (e instanceof InvalidStatusTransitionError) {
        throw new z.ZodError([
          {
            code: "custom",
            path: ["status"],
            message: e.message,
          },
        ]);
      }
      throw e;
    }
  }
  return parsed;
}
