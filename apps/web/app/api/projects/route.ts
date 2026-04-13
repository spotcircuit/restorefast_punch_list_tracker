import { prisma } from "@/lib/prisma";
import {
  handleRouteError,
  parseJsonBody,
} from "@/lib/api/handle-route-error";
import { createProjectSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { items: true } },
      },
    });
    return Response.json({ projects });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const raw = await parseJsonBody(request);
    const input = createProjectSchema.parse(raw);
    const project = await prisma.project.create({
      data: {
        name: input.name,
        address: input.address,
        status: input.status,
      },
    });
    return Response.json({ project }, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
