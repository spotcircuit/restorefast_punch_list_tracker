import { prisma } from "@/lib/prisma";
import {
  assertUuidParam,
  handleRouteError,
  parseJsonBody,
} from "@/lib/api/handle-route-error";
import { createPunchItemBodySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    assertUuidParam("projectId", projectId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const items = await prisma.punchItem.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    return Response.json({ items });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    assertUuidParam("projectId", projectId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const raw = await parseJsonBody(request);
    const input = createPunchItemBodySchema.parse(raw);

    const item = await prisma.punchItem.create({
      data: {
        projectId,
        location: input.location,
        description: input.description,
        priority: input.priority,
        assignedTo: input.assignedTo ?? null,
        photo: input.photo ?? null,
        status: "open",
      },
    });

    return Response.json({ item }, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
