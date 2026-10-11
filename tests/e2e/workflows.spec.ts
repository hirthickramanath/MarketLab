import { test, expect } from "@playwright/test";
test("demo learner completes trading, session, quiz and journal workflows", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Enter the demo lab" }).click();
  await expect(
    page.getByRole("heading", { name: "Good to see you, Demo." }),
  ).toBeVisible();
  const navigate = async (name: string) => {
    if (testInfo.project.name === "mobile")
      await page.getByRole("button", { name: "Toggle menu" }).click();
    await page.getByRole("button", { name, exact: true }).click();
  };
  await navigate("Market Explorer");
  await page.getByPlaceholder("Search name, ticker, or sector…").fill("AAPL");
  await page.getByRole("button", { name: /A AAPL Apple/ }).click();
  await expect(
    page.getByRole("heading", { name: "Place a virtual order" }),
  ).toBeVisible();
  await page
    .getByLabel("Your investment hypothesis")
    .fill("A test hypothesis based on a fictional learning scenario.");
  await page.getByRole("button", { name: "Submit virtual order" }).click();
  await expect(
    page.getByRole("cell", { name: "filled", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start trading session" }).click();
  await page.getByRole("button", { name: "Begin session" }).click();
  await expect(
    page.getByText("SESSION REPLAY · ONE OBSERVATION / MINUTE"),
  ).toBeVisible();
  const before = await page.request.get("/api/state");
  const id = (await before.json()).state.sessions[0].id;
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Good to see you, Demo." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume session" }).click();
  await expect(
    page.getByText("SESSION REPLAY · ONE OBSERVATION / MINUTE"),
  ).toBeVisible();
  const after = await page.request.get("/api/state");
  expect((await after.json()).state.sessions[0].id).toBe(id);
  await page.getByRole("button", { name: "Finish & reflect" }).click();
  await expect(
    page.getByRole("heading", { name: "Your reflection" }),
  ).toBeVisible();
  await navigate("Learn");
  await page.getByLabel("Ownership in a company").check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByRole("status")).toContainText("Correct");
  await navigate("Investment Journal");
  await page
    .getByLabel("Hypothesis, evidence, risks, confidence & lessons")
    .fill("I learned that profitable outcomes do not prove sound reasoning.");
  await page.getByRole("button", { name: "Save reflection" }).click();
  await expect(
    page.getByText(
      "I learned that profitable outcomes do not prove sound reasoning.",
    ),
  ).toBeVisible();
  await navigate("News Intelligence");
  await page.getByRole("button", { name: /borrowing costs/ }).click();
  await expect(
    page.getByRole("link", { name: /RBI educational/ }),
  ).toHaveAttribute("href", "https://www.rbi.org.in/");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Toggle dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-news.png`,
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
});
test("API rejects unauthorized funding, isolates users, and supports idempotency", async ({
  playwright,
}) => {
  const one = await playwright.request.newContext({
      baseURL: "http://localhost:3100",
    }),
    two = await playwright.request.newContext({
      baseURL: "http://localhost:3100",
    });
  expect((await one.get("/api/state")).status()).toBe(401);
  await one.post("/api/auth", { data: { mode: "demo" } });
  await two.post("/api/auth", { data: { mode: "demo" } });
  const a = await (await one.get("/api/state")).json(),
    b = await (await two.get("/api/state")).json();
  expect(a.user.id).not.toBe(b.user.id);
  const credit = await one.post("/api/action", {
    data: {
      type: "fund",
      id: crypto.randomUUID(),
      target: a.user.id,
      currency: "INR",
      amount: 10000,
      reason: "Unauthorized test funding",
    },
  });
  expect(credit.status()).toBe(400);
  const order = {
    type: "order",
    id: crypto.randomUUID(),
    instrument: "XNAS:AAPL",
    side: "buy",
    kind: "market",
    quantity: 1,
    reason: "Integration test hypothesis",
  };
  expect((await one.post("/api/action", { data: order })).ok()).toBe(true);
  expect((await one.post("/api/action", { data: order })).ok()).toBe(true);
  const updated = await (await one.get("/api/state")).json();
  expect(
    updated.state.accounts.find(
      (x: { currency: string }) => x.currency === "USD",
    ).orders,
  ).toHaveLength(1);
  const isolated = await (await two.get("/api/state")).json();
  expect(
    isolated.state.accounts.every(
      (x: { orders: unknown[] }) => x.orders.length === 0,
    ),
  ).toBe(true);
  expect(
    (
      await one.post("/api/action", {
        headers: { Origin: "https://untrusted.invalid" },
        data: { type: "journal", text: "Cross origin write" },
      })
    ).status(),
  ).toBe(400);
  await one.dispose();
  await two.dispose();
});
test("administrator funds practice accounts and audit records exclude student access", async ({
  playwright,
}) => {
  const admin = await playwright.request.newContext({
      baseURL: "http://localhost:3100",
    }),
    student = await playwright.request.newContext({
      baseURL: "http://localhost:3100",
    });
  const login = await admin.post("/api/auth", {
    data: {
      mode: "login",
      email: "admin@test.invalid",
      password: process.env.MARKETLAB_ADMIN_PASSWORD,
    },
  });
  expect(login.ok()).toBe(true);
  await student.post("/api/auth", { data: { mode: "demo" } });
  const before = await (await student.get("/api/state")).json();
  expect(
    (
      await admin.post("/api/action", {
        data: {
          type: "fund",
          id: crypto.randomUUID(),
          target: before.user.id,
          currency: "USD",
          amount: 500000,
          reason: "Classroom practice capital allocation",
        },
      })
    ).ok(),
  ).toBe(true);
  const after = await (await student.get("/api/state")).json();
  expect(
    after.state.accounts.find((x: { currency: string }) => x.currency === "USD")
      .cash,
  ).toBe(10500000);
  expect(after.audit).toBeUndefined();
  const key = crypto.randomUUID(),
    adjustment = {
      type: "fund",
      id: key,
      target: before.user.id,
      currency: "USD",
      amount: 200000,
      reason: "Additional classroom capital test",
    };
  expect((await admin.post("/api/action", { data: adjustment })).ok()).toBe(
    true,
  );
  expect((await admin.post("/api/action", { data: adjustment })).ok()).toBe(
    true,
  );
  const funded = await (await student.get("/api/state")).json();
  expect(
    funded.state.accounts.find(
      (x: { currency: string }) => x.currency === "USD",
    ).cash,
  ).toBe(10700000);
  expect(
    (
      await admin.post("/api/action", {
        data: {
          type: "rules",
          id: crypto.randomUUID(),
          capital: 20000000,
          durations: [15],
          regions: ["USA"],
          reason: "Focused classroom rule configuration",
        },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (
      await student.post("/api/action", {
        data: {
          type: "session",
          duration: 15,
          region: "India",
          currency: "INR",
        },
      })
    ).ok(),
  ).toBe(false);
  expect(
    (
      await student.post("/api/action", {
        data: { type: "session", duration: 15, region: "USA", currency: "USD" },
      })
    ).ok(),
  ).toBe(true);
  const isolatedSession = await (await student.get("/api/state")).json();
  expect(isolatedSession.state.sessions[0].account.initial).toBe(20000000);
  expect(
    (
      await admin.post("/api/action", {
        data: {
          type: "rules",
          id: crypto.randomUUID(),
          capital: 10000000,
          durations: [15, 20, 25, 30, 35, 40, 45],
          regions: ["India", "USA", "Global"],
          reason: "Restore default demonstration rules",
        },
      })
    ).ok(),
  ).toBe(true);
  const audit = await (await admin.get("/api/state")).json();
  expect(audit.audit.length).toBeGreaterThan(0);
  await admin.dispose();
  await student.dispose();
});

test("registration, logout and persistent password login work", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create an account" }).click();
  const email = `${crypto.randomUUID()}@test.invalid`,
    password = crypto.randomUUID();
  await page.getByLabel("Your name").fill("Persistence student");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Good to see you, Persistence." }),
  ).toBeVisible();
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Toggle menu" }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Learn the market. Find your edge." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Sign in", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Good to see you, Persistence." }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-dashboard.png`,
    fullPage: true,
  });
});
