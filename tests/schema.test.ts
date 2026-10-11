import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
test("PostgreSQL migration enforces account RLS, transactional funding and immutable ledgers", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create schema auth;create table auth.users(id uuid primary key);create role authenticated;grant usage on schema auth to authenticated;create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;`,
    );
    await db.exec(readFileSync("supabase/migrations/0001_core.sql", "utf8"));
    await db.exec(readFileSync("supabase/seed.sql", "utf8"));
    const student = crypto.randomUUID(),
      other = crypto.randomUUID(),
      admin = crypto.randomUUID(),
      a = crypto.randomUUID(),
      b = crypto.randomUUID(),
      session = crypto.randomUUID(),
      sa = crypto.randomUUID();
    for (const [id, name] of [
      [student, "Student"],
      [other, "Other"],
      [admin, "Admin"],
    ]) {
      await db.query("insert into auth.users values($1)", [id]);
      await db.query(
        "insert into public.profiles(id,display_name) values($1,$2)",
        [id, name],
      );
    }
    await db.query("insert into user_roles values($1,'admin')", [admin]);
    await db.query(
      "insert into virtual_accounts(id,user_id,currency,cash) values($1,$2,'USD',100000),($3,$4,'USD',100000)",
      [a, student, b, other],
    );
    await db.query(
      "insert into trading_sessions(id,user_id,expires_at,starting_capital,currency,status,mode,news_cutoff) values($1,$2,now()+interval '15 minutes',100000,'USD','active','illustrative',now())",
      [session, student],
    );
    await db.query(
      "insert into virtual_accounts(id,user_id,session_id,currency,cash) values($1,$2,$3,'USD',100000)",
      [sa, student, session],
    );
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      student,
    ]);
    const visible = await db.query<{ user_id: string }>(
      "select user_id from virtual_accounts",
    );
    assert.equal(visible.rows.length, 2);
    assert.ok(visible.rows.every((x) => x.user_id === student));
    assert.equal(
      (await db.query("update virtual_accounts set cash=0 returning id")).rows
        .length,
      0,
    );
    await assert.rejects(
      db.query("select credit_virtual_account($1,1000,$2,$3)", [
        a,
        "Forbidden student allocation",
        "k1",
      ]),
      /admin required/,
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      admin,
    ]);
    await db.query("select credit_virtual_account($1,1000,$2,$3)", [
      a,
      "Authorized classroom allocation",
      "k1",
    ]);
    await db.query("select credit_virtual_account($1,1000,$2,$3)", [
      a,
      "Authorized classroom allocation",
      "k1",
    ]);
    assert.equal(
      Number(
        (
          await db.query<{ cash: string }>(
            "select cash from virtual_accounts where id=$1",
            [a],
          )
        ).rows[0].cash,
      ),
      101000,
    );
    assert.equal(
      (await db.query("select * from wallet_ledger")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from admin_audit_logs")).rows.length,
      1,
    );
    await assert.rejects(
      db.query("select credit_virtual_account($1,1000,$2,$3)", [
        sa,
        "Forbidden active session allocation",
        "k2",
      ]),
      /practice account required/,
    );
    await db.exec("reset role");
    await assert.rejects(
      db.exec("update wallet_ledger set amount=1"),
      /append-only/,
    );
    await assert.rejects(
      db.query("update trading_sessions set starting_capital=1 where id=$1", [
        session,
      ]),
      /immutable session/,
    );
  } finally {
    await db.close();
  }
});
