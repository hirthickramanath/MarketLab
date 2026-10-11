import { cookies } from "next/headers";
import { authenticate } from "./db";
const attempts = new Map<string, { count: number; until: number }>();
export function guard(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    const expected = process.env.MARKETLAB_APP_ORIGIN;
    const parsed = new URL(origin);
    if (
      expected
        ? parsed.origin !== new URL(expected).origin
        : parsed.host !== request.headers.get("host") ||
          !["http:", "https:"].includes(parsed.protocol)
    )
      throw new Error("Invalid request origin");
  }
  const key = request.headers.get("x-forwarded-for") ?? "local";
  const now = Date.now(),
    entry = attempts.get(key);
  if (!entry || entry.until < now)
    attempts.set(key, { count: 1, until: now + 60000 });
  else if (++entry.count > 120)
    throw new Error("Too many requests. Try again shortly.");
}
export async function user() {
  return authenticate((await cookies()).get("marketlab_session")?.value ?? "");
}
export function failure(e: unknown) {
  const message = e instanceof Error ? e.message : "Request failed";
  return Response.json(
    {
      error: message.includes("UNIQUE")
        ? "An account with that email already exists"
        : message,
    },
    { status: message === "Authentication required" ? 401 : 400 },
  );
}
