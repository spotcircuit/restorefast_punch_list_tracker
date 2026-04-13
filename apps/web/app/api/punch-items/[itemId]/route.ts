import { prisma } from "@/lib/prisma";
import {
  assertUuidParam,
  handleRouteError,
  parseJsonBody,
} from "@/lib/api/handle-route-error";
import { parseUpdatePunchItem } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ itemId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    assertUuidParam("itemId", itemId);

    const item = await prisma.punchItem.findUnique({
      where: { id: itemId },
      include: { project: { select: { id: true, name: true } } },
    });

    if (!item) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ item });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    assertUuidParam("itemId", itemId);

    const existing = await prisma.punchItem.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const raw = await parseJsonBody(request);
    const input = parseUpdatePunchItem(existing.status, raw);

    const item = await prisma.punchItem.update({
      where: { id: itemId },
      data: {
        ...(input.location !== undefined && { location: input.location }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.assignedTo !== undefined && { assignedTo: input.assignedTo }),
        ...(input.photo !== undefined && { photo: input.photo }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });

    return Response.json({ item });
  } catch (e) {
    return handleRouteError(e);
  }
}
