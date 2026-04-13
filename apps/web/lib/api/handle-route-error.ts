import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

export function jsonError(
  message: string,
  status: number,
  details?: Record<string, unknown>,
) {
  return NextResponse.json({ error: message, ...details }, { status });
}

export function handleRouteError(e: unknown) {
  if (e instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: e.flatten() },
      { status: 400 },
    );
  }

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2025") {
      return jsonError("Not found", 404);
    }
    if (e.code === "P2003") {
      return jsonError("Invalid reference (e.g. project does not exist)", 400);
    }
  }

  console.error(e);
  return jsonError("Internal server error", 500);
}

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ZodError([
      {
        code: "custom",
        path: [],
        message: "Invalid JSON body",
      },
    ]);
  }
}

export function assertUuidParam(name: string, value: string) {
  const r = z.string().uuid().safeParse(value);
  if (!r.success) {
    throw new ZodError([
      {
        code: "custom",
        path: [name],
        message: `Invalid ${name}`,
      },
    ]);
  }
}
