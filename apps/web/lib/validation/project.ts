import { z } from "zod";

import { PROJECT_STATUSES } from "@/lib/domain/project-status";

const projectStatusSchema = z.enum(
  PROJECT_STATUSES as unknown as [string, ...string[]],
);

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(500),
  address: z.string().trim().min(1, "Address is required").max(2000),
  status: projectStatusSchema.optional().default("active"),
});

export const updateProjectSchema = createProjectSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
