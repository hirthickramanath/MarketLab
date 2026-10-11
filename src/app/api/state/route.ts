import { user, failure } from "@/lib/http";
import { state, users, audit, classrooms, tradingRules } from "@/lib/db";
import { instruments, price, bars, news } from "@/lib/market";
import { tick, reserves, equity } from "@/lib/engine";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const u = await user(),
      s = state(u.id);
    const active = s.sessions.find((s) => s.status === "active");
    const t = active ? tick(active) : 0;
    return Response.json(
      {
        user: { id: u.id, name: u.name, email: u.email, role: u.role },
        state: {
          ...s,
          accounts: s.accounts.map((a) => ({
            ...a,
            available: a.cash - reserves(a),
            markedEquity: equity(a, 0),
          })),
          sessions: s.sessions.map((session) => ({
            ...session,
            account: {
              ...session.account,
              available: session.account.cash - reserves(session.account),
              markedEquity:
                session.report?.equity ??
                equity(session.account, tick(session)),
            },
          })),
        },
        market: instruments.map(
          ({ id, symbol, name, exchange, country, currency, sector }) => ({
            id,
            symbol,
            name,
            exchange,
            country,
            currency,
            sector,
            price: price(id, t),
            bars: bars(id, t),
            provider: "MarketLab fictional scenario",
            observedAt: active ? active.start + t * 60000 : null,
          }),
        ),
        news: active ? news.filter((n) => active.news.includes(n.id)) : news,
        serverTime: Date.now(),
        mode: "illustrative",
        rules: tradingRules(),
        classrooms: classrooms(u.id, u.role),
        ...(u.role === "admin" ? { users: users(), audit: audit() } : {}),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
