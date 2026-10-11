import { answers } from "@/lib/quiz-answers";
import { z } from "zod";
import { guard, user, failure } from "@/lib/http";
import {
  mutate,
  fund,
  createClassroom,
  joinClassroom,
  tradingRules,
  configureRules,
} from "@/lib/db";
import { account, submit, tick, finish, reserves } from "@/lib/engine";
import { news, instruments } from "@/lib/market";
const order = z.object({
  type: z.literal("order"),
  id: z.uuid(),
  instrument: z.string(),
  side: z.enum(["buy", "sell"]),
  kind: z.enum(["market", "limit"]),
  quantity: z.number().int().min(1).max(10000),
  limit: z.number().int().positive().optional(),
  reason: z.string().min(3).max(2000),
  session: z.string().optional(),
});
const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("rules"),
    id: z.uuid(),
    capital: z.number().int().min(100000).max(100000000),
    durations: z
      .array(
        z
          .number()
          .int()
          .min(15)
          .max(45)
          .refine((n) => n % 5 === 0),
      )
      .min(1)
      .max(7),
    regions: z
      .array(z.enum(["India", "USA", "Global"]))
      .min(1)
      .max(3),
    reason: z.string().min(10).max(1000),
  }),
  z.object({
    type: z.literal("createClassroom"),
    name: z.string().min(3).max(80),
  }),
  z.object({
    type: z.literal("joinClassroom"),
    code: z.string().min(1).max(30),
  }),
  order,
  z.object({
    type: z.literal("session"),
    duration: z
      .number()
      .int()
      .min(15)
      .max(45)
      .refine((x) => x % 5 === 0),
    region: z.enum(["India", "USA", "Global"]),
    currency: z.enum(["INR", "USD", "GBP", "JPY"]),
  }),
  z.object({ type: z.literal("finish"), id: z.string() }),
  z.object({
    type: z.literal("cancel"),
    id: z.string(),
    session: z.string().optional(),
  }),
  z.object({ type: z.literal("watch"), instrument: z.string() }),
  z.object({ type: z.literal("journal"), text: z.string().min(3).max(4000) }),
  z.object({
    type: z.literal("quiz"),
    lesson: z.number().int().min(0).max(9),
    answer: z.number().int().min(0).max(2),
  }),
  z.object({ type: z.literal("read"), id: z.string() }),
  z.object({
    type: z.literal("ipo"),
    quantity: z.number().int().min(1).max(100),
  }),
  z.object({
    type: z.literal("fund"),
    id: z.uuid(),
    target: z.string(),
    currency: z.enum(["INR", "USD", "GBP", "JPY"]),
    amount: z
      .number()
      .int()
      .min(-100000000)
      .max(100000000)
      .refine((n) => n !== 0),
    reason: z.string().min(10).max(1000),
  }),
]);
export async function POST(req: Request) {
  try {
    guard(req);
    const u = await user(),
      b = schema.parse(await req.json());
    if (b.type === "rules") {
      configureRules(
        u.id,
        {
          capital: b.capital,
          durations: [...new Set(b.durations)],
          regions: [...new Set(b.regions)],
        },
        b.reason,
        b.id,
      );
      return Response.json({ ok: true });
    }
    if (b.type === "createClassroom") {
      if (u.role !== "admin")
        throw new Error("Administrator authorization required");
      createClassroom(u.id, b.name);
      return Response.json({ ok: true });
    }
    if (b.type === "joinClassroom") {
      joinClassroom(u.id, b.code);
      return Response.json({ ok: true });
    }
    if (b.type === "fund") {
      if (u.role !== "admin")
        throw new Error("Administrator authorization required");
      fund(u.id, b.target, b.currency, b.amount, b.reason, b.id);
      return Response.json({ ok: true });
    }
    const result = mutate(u.id, (s) => {
      switch (b.type) {
        case "order": {
          const session = b.session
            ? s.sessions.find((x) => x.id === b.session)
            : undefined;
          if (
            b.session &&
            (!session ||
              session.status !== "active" ||
              Date.now() >= session.expires)
          )
            throw new Error("Session has ended");
          const i = instruments.find((i) => i.id === b.instrument);
          if (!i) throw new Error("Unknown instrument");
          if (
            session &&
            session.region !== "Global" &&
            i.country !== session.region
          )
            throw new Error("Instrument outside session universe");
          const a =
            session?.account ??
            s.accounts.find((a) => a.currency === i.currency)!;
          submit(a, b, session ? tick(session) : 0);
          break;
        }
        case "session": {
          const rules = tradingRules();
          if (
            !rules.durations.includes(b.duration) ||
            !rules.regions.includes(b.region)
          )
            throw new Error(
              "Session configuration is outside administrator rules",
            );
          if (s.sessions.some((x) => x.status === "active"))
            throw new Error("Finish your active session first");
          if (
            (b.region === "India" && b.currency !== "INR") ||
            (b.region === "USA" && b.currency !== "USD")
          )
            throw new Error("Select the market currency");
          const now = Date.now();
          s.sessions.push({
            id: crypto.randomUUID(),
            start: now,
            expires: now + b.duration * 60000,
            duration: b.duration,
            region: b.region,
            status: "active",
            news: news.map((n) => n.id),
            account: account(b.currency, rules.capital),
          });
          break;
        }
        case "finish": {
          const x = s.sessions.find((x) => x.id === b.id);
          if (!x) throw new Error("Session not found");
          finish(x);
          break;
        }
        case "cancel": {
          const x = b.session
            ? s.sessions.find((x) => x.id === b.session)?.account
            : s.accounts.find((a) => a.orders.some((o) => o.id === b.id));
          const o = x?.orders.find((o) => o.id === b.id);
          if (!o || o.status !== "pending")
            throw new Error("Pending order not found");
          o.status = "cancelled";
          break;
        }
        case "watch":
          if (!instruments.some((i) => i.id === b.instrument))
            throw new Error("Unknown instrument");
          s.watchlist = s.watchlist.includes(b.instrument)
            ? s.watchlist.filter((i) => i !== b.instrument)
            : [...s.watchlist, b.instrument];
          break;
        case "journal":
          s.journal.unshift({
            id: crypto.randomUUID(),
            text: b.text,
            time: Date.now(),
          });
          break;
        case "quiz":
          if (answers[b.lesson] !== b.answer)
            return {
              ok: false,
              feedback: "Not quite. Review the lesson and try again.",
            };
          if (!s.completed.includes(b.lesson)) s.completed.push(b.lesson);
          return {
            ok: true,
            feedback: "Correct. Your learning progress has been saved.",
          };
        case "read":
          for (const n of s.notifications) if (n.id === b.id) n.read = true;
          break;
        case "ipo": {
          if (s.ipo)
            throw new Error(
              "You have already applied to this demonstration scenario",
            );
          const a = s.accounts.find((a) => a.currency === "INR")!;
          const shares = Math.ceil(b.quantity / 2),
            cost = shares * 10000;
          if (a.cash - reserves(a) < cost) throw new Error("Insufficient cash");
          a.cash -= cost;
          a.otherAssets = (a.otherAssets ?? 0) + cost;
          s.ipo = { shares, cost };
          a.ledger.push({
            id: crypto.randomUUID(),
            time: Date.now(),
            amount: -cost,
            reason: `Fictional IPO allotment: ${shares} shares held separately in IPO Lab`,
          });
          break;
        }
      }
      return { ok: true };
    });
    return Response.json(result);
  } catch (e) {
    return failure(e);
  }
}
