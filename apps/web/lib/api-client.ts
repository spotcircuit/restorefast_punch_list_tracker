export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, { ...init, headers });
  const data = (await res.json().catch(() => ({}))) as T & {
    error?: string;
    issues?: unknown;
  };

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
}

export function formatApiError(e: unknown): string {
  if (e instanceof ApiError) {
    const b = e.body as { error?: string; issues?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } };
    if (b?.issues && typeof b.issues === "object" && "fieldErrors" in b.issues) {
      const fe = b.issues.fieldErrors ?? {};
      const parts = Object.entries(fe).flatMap(([k, v]) =>
        (v ?? []).map((m) => `${k}: ${m}`),
      );
      if (parts.length) return parts.join("; ");
      const form = b.issues.formErrors ?? [];
      if (form.length) return form.join("; ");
    }
    if (typeof b?.error === "string") return b.error;
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}
