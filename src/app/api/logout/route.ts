import { cookies } from "next/headers";
import { revoke } from "@/lib/db";
import { guard, failure } from "@/lib/http";
export async function POST(req: Request) {
  try {
    guard(req);
    const c = await cookies();
    revoke(c.get("marketlab_session")?.value ?? "");
    c.delete("marketlab_session");
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
