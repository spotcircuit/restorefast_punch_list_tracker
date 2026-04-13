import { prisma } from "@/lib/prisma";
import {
  assertUuidParam,
  handleRouteError,
  parseJsonBody,
} from "@/lib/api/handle-route-error";
import { updateProjectSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    assertUuidParam("projectId", projectId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        items: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!project) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ project });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    assertUuidParam("projectId", projectId);

    const raw = await parseJsonBody(request);
    const input = updateProjectSchema.parse(raw);

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });

    return Response.json({ project });
  } catch (e) {
    return handleRouteError(e);
  }
}
