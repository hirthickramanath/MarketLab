import { z } from "zod";
import { cookies } from "next/headers";
import { register, login, token } from "@/lib/db";
import { guard, failure } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    guard(req);
    const body = z
      .object({
        mode: z.enum(["login", "register", "demo"]),
        email: z.email().optional(),
        name: z.string().min(1).max(80).optional(),
        password: z.string().min(10).max(128).optional(),
      })
      .parse(await req.json());
    let id: string | null = null;
    if (body.mode === "demo")
      id = register(
        `${crypto.randomUUID()}@demo.invalid`,
        "Demo student",
        crypto.randomUUID(),
      );
    else {
      if (!body.email || !body.password)
        throw new Error("Email and password are required");
      id =
        body.mode === "register"
          ? register(body.email, body.name ?? "Student", body.password)
          : login(body.email, body.password);
    }
    if (!id) throw new Error("Invalid email or password");
    (await cookies()).set("marketlab_session", token(id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 604800,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
