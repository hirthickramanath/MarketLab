"use client";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, MotionConfig } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Sun,
  Moon,
  LayoutDashboard,
  ChartNoAxesCombined,
  Newspaper,
  BookOpen,
  Wallet,
  Clock,
  Star,
  NotebookPen,
  Trophy,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  Globe,
  ChevronRight,
  Plus,
  X,
  Menu,
  HelpCircle,
  Play,
  CheckCircle2,
  Command,
} from "lucide-react";
import Chart from "./chart";
import Glossary, { glossary } from "./glossary";
import EquityCurve from "./equity-curve";
import { maximumDrawdown } from "@/lib/metrics";
import { lessons } from "@/lib/market";
import type { Instrument } from "@/lib/market";
import type { State, Account } from "@/lib/engine";
type Market = Omit<Instrument, "base"> & {
  price: number;
  bars: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
};
type News = {
  id: string;
  title: string;
  body: string;
  facts: string;
  positive: string;
  negative: string;
  concept: string;
  url: string;
  source: string;
  region: string;
  category: string;
};
type Data = {
  user: { id: string; name: string; email: string; role: string };
  state: State;
  market: Market[];
  news: News[];
  serverTime: number;
  users?: { id: string; name: string; email: string; role: string }[];
  audit?: { id: string; reason: string; amount: number; time: number }[];
  rules: { capital: number; durations: number[]; regions: string[] };
  classrooms: {
    id: string;
    name: string;
    code?: string;
    members: { id: string; name: string; lessons: number }[];
  }[];
};
const nav = [
  ["Dashboard", LayoutDashboard],
  ["Market Explorer", Globe],
  ["Virtual Trading", ChartNoAxesCombined],
  ["Trading Sessions", Clock],
  ["Portfolio Analytics", Wallet],
  ["News Intelligence", Newspaper],
  ["Learn", BookOpen],
  ["IPO Lab", ArrowUpRight],
  ["Historical Replay", Play],
  ["Classroom", Globe],
  ["Watchlists", Star],
  ["Investment Journal", NotebookPen],
  ["Session History", Clock],
  ["Achievements", Trophy],
  ["Notifications", Bell],
  ["AI Learning Assistant", HelpCircle],
  ["Settings", Settings],
] as const;
function money(n: number, c = "INR") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 2,
  }).format(n / 100);
}
export default function MarketLab() {
  const [data, setData] = useState<Data | null>(null),
    [loading, setLoading] = useState(true),
    [page, setPage] = useState("Dashboard"),
    [dark, setDark] = useState(false),
    [toast, setToast] = useState(""),
    [query, setQuery] = useState(""),
    [region, setRegion] = useState("All"),
    [selected, setSelected] = useState("XNSE:RELIANCE"),
    [dialog, setDialog] = useState(""),
    [auth, setAuth] = useState("login"),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false),
    [now, setNow] = useState(0),
    [duration, setDuration] = useState(15),
    [sessionRegion, setSessionRegion] = useState("India"),
    [currency, setCurrency] = useState("INR"),
    [lesson, setLesson] = useState(0),
    [answer, setAnswer] = useState(-1),
    [article, setArticle] = useState<News | null>(null),
    [tour, setTour] = useState(-1);
  const clockOffset = useRef(0);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/state");
      if (r.ok) {
        const d = await r.json();
        setData(d);
        setNow(d.serverTime);
        clockOffset.current = d.serverTime - Date.now();
      } else if (r.status === 401) setData(null);
    } catch {
      setToast("Connection lost. Retry shortly.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    const id = setInterval(() => void refresh(), 10000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [refresh]);
  useEffect(() => {
    const id = setInterval(
      () => setNow(Date.now() + clockOffset.current),
      1000,
    );
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    const id = setTimeout(() => {
      const saved = localStorage.getItem("marketlab-theme");
      if (saved === "dark") setDark(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("marketlab-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setDialog("search");
      }
      if (e.key === "Escape") {
        setDialog("");
        setArticle(null);
        setTour(-1);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  async function call(body: Record<string, unknown>, endpoint = "action") {
    setBusy(true);
    try {
      const r = await fetch("/api/" + endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setToast(result.feedback ?? "Saved successfully");
      await refresh();
      if (endpoint === "auth") {
        setPage("Dashboard");
        setDialog("");
      }
      return result;
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Request failed");
      return null;
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!dialog && !article && tour < 0) return;
    const previous = document.activeElement as HTMLElement | null;
    const modal = document.querySelector<HTMLElement>('[role="dialog"]');
    if (!modal) return;
    const items = () =>
      Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input,select,textarea,[tabindex="0"]',
        ),
      );
    items()[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const controls = items(),
        first = controls[0],
        last = controls.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = scroll;
      previous?.focus();
    };
  }, [dialog, article, tour]);
  const active = data?.state.sessions.find((s) => s.status === "active");
  const stock = data?.market.find((i) => i.id === selected) ?? data?.market[0];
  const account =
    active && page === "Virtual Trading"
      ? active.account
      : data?.state.accounts.find((a) => a.currency === currency);
  const valuation = (a: Account) =>
    a.markedEquity ??
    a.cash +
      (a.otherAssets ?? 0) +
      a.positions.reduce(
        (sum, p) =>
          sum +
          p.quantity *
            (data?.market.find((i) => i.id === p.instrument)?.price ?? 0),
        0,
      );
  const matches =
    data?.market.filter(
      (i) =>
        (region === "All" || i.country === region) &&
        `${i.symbol} ${i.name} ${i.sector}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    ) ?? [];
  function go(p: string) {
    setPage(p);
    setMobile(false);
    setQuery("");
  }
  function openStock(i: Market) {
    setSelected(i.id);
    setCurrency(i.currency);
    go("Virtual Trading");
    setDialog("");
  }
  async function begin() {
    const c =
      sessionRegion === "India"
        ? "INR"
        : sessionRegion === "USA"
          ? "USD"
          : currency;
    const r = await call({
      type: "session",
      duration,
      region: sessionRegion,
      currency: c,
    });
    if (r) {
      setCurrency(c);
      setSelected(
        c === "INR"
          ? "XNSE:RELIANCE"
          : c === "USD"
            ? "XNAS:AAPL"
            : c === "GBP"
              ? "XLON:AZN"
              : "XTKS:7203",
      );
      go("Virtual Trading");
      setDialog("");
    }
  }
  const start = () => {
    setDuration(data?.rules.durations[0] ?? 15);
    setSessionRegion(data?.rules.regions[0] ?? "India");
    setDialog("session");
  };
  const metric = (
    label: string,
    value: string,
    sub: string,
    positive = false,
  ) => (
    <motion.div
      className="metric"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="muted small">
        {label} <Glossary term={label} onLearn={() => go("Learn")} />
      </div>
      <h2>{value}</h2>
      <span className={positive ? "up small" : "muted small"}>
        {positive && <ArrowUpRight size={13} />} {sub}
      </span>
    </motion.div>
  );
  if (loading)
    return (
      <div className="loading">
        <div className="brand">◈ {brand}</div>
        <div className="loader" />
        Preparing your laboratory…
      </div>
    );
  if (!data)
    return (
      <MotionConfig reducedMotion="user">
        <div className="landing">
          <header>
            <Link className="brand" href="/">
              ◈ {brand}
              <span className="brand-dot" />
            </Link>
            <nav>
              <button onClick={() => setDialog("How it works")}>
                How it works
              </button>
              <button onClick={() => setDialog("Features")}>Features</button>
              <button onClick={() => setDialog("About the simulation")}>
                About
              </button>
            </nav>
            <button
              className="outline"
              onClick={() => {
                setAuth("login");
                setDialog("auth");
              }}
            >
              Sign in <ArrowUpRight size={16} />
            </button>
          </header>
          <main>
            <div className="eyebrow">
              <span className="dot" /> YOUR EDGE STARTS WITH UNDERSTANDING
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Learn the market.
              <br />
              <span>Find your edge.</span>
            </motion.h1>
            <p className="hero-copy">
              A better way to understand investing. Explore global markets,
              build a virtual portfolio, and turn every trade into a lesson.
            </p>
            <div className="row">
              <button
                className="primary"
                disabled={busy}
                onClick={() => void call({ mode: "demo" }, "auth")}
              >
                Enter the demo lab <ArrowRight size={18} />
              </button>
              <button
                className="outline"
                onClick={() => {
                  setAuth("register");
                  setDialog("auth");
                }}
              >
                Create an account
              </button>
            </div>
            <div className="trust">
              <ShieldCheck size={17} /> Virtual money. Real learning. Zero
              financial risk.
            </div>
            <div className="hero-visual">
              <div className="orb orb-one" />
              <div className="orb orb-two" />
              <div className="visual-top">
                <span>YOUR LEARNING PORTFOLIO</span>
                <span className="pill">ILLUSTRATIVE</span>
              </div>
              <h2>
                ₹1,00,000<span>.00</span>
              </h2>
              <div className="abstract-chart">
                <svg viewBox="0 0 600 160">
                  <defs>
                    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#008b76" stopOpacity=".3" />
                      <stop offset="1" stopColor="#008b76" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 140 L40 115 L80 125 L120 85 L160 95 L200 70 L240 80 L280 42 L320 62 L360 25 L400 40 L440 18 L480 34 L520 8 L560 20 L600 0 L600 160 L0 160Z"
                    fill="url(#fill)"
                  />
                  <path
                    d="M0 140 L40 115 L80 125 L120 85 L160 95 L200 70 L240 80 L280 42 L320 62 L360 25 L400 40 L440 18 L480 34 L520 8 L560 20 L600 0"
                    stroke="#008b76"
                    fill="none"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <div className="visual-bottom">
                <span>Practice with purpose</span>
                <span>
                  <Globe size={16} /> 4 markets · endless possibilities
                </span>
              </div>
            </div>
            <div className="landing-features">
              <article>
                <Globe />
                <h3>Think globally</h3>
                <p>
                  Explore instruments across India, the US, the UK, and Japan.
                </p>
              </article>
              <article>
                <Clock />
                <h3>Trade with intention</h3>
                <p>
                  Focused 15–45 minute sessions. A fixed starting balance. A
                  fresh perspective.
                </p>
              </article>
              <article>
                <BookOpen />
                <h3>Learn by doing</h3>
                <p>
                  Understand the reasoning behind every decision, beyond the
                  numbers.
                </p>
              </article>
            </div>
            <div className="notice">
              Demonstration mode: all prices, chart scenarios, and news events
              are illustrative. This is an educational simulator, never a
              brokerage.
            </div>
          </main>
          {dialog && (
            <div className="overlay">
              <section
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={dialog}
              >
                <button
                  className="close"
                  onClick={() => setDialog("")}
                  aria-label="Close"
                >
                  <X />
                </button>
                {dialog === "auth" ? (
                  <>
                    <div className="eyebrow">WELCOME TO YOUR LAB</div>
                    <h2>
                      {auth === "register"
                        ? "Start your learning journey"
                        : "Welcome back"}
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        const result = await call(
                          {
                            mode: auth,
                            email: f.get("email"),
                            password: f.get("password"),
                            name: f.get("name") ?? undefined,
                          },
                          "auth",
                        );
                        if (result) setDialog("");
                      }}
                    >
                      {auth === "register" && (
                        <label>
                          Your name
                          <input name="name" required maxLength={80} />
                        </label>
                      )}
                      <label>
                        Email
                        <input name="email" type="email" required />
                      </label>
                      <label>
                        Password
                        <input
                          name="password"
                          type="password"
                          minLength={10}
                          maxLength={128}
                          required
                        />
                      </label>
                      <button className="primary" disabled={busy}>
                        {busy
                          ? "Please wait…"
                          : auth === "register"
                            ? "Create account"
                            : "Sign in"}
                        <ArrowRight size={16} />
                      </button>
                    </form>
                    <p className="muted small">
                      Local demo authentication. Password reset and email
                      verification require the production Supabase integration.
                    </p>
                  </>
                ) : (
                  <>
                    <h2>{dialog}</h2>
                    <p>
                      Explore clearly labeled fictional market scenarios, trade
                      with virtual funds, and reflect on your decisions. Timed
                      sessions use a wall-clock countdown and reveal one
                      illustrative price observation per minute. No money can be
                      deposited, withdrawn, or redeemed.
                    </p>
                    <p>
                      Learning lessons, saved journals, watchlists, and session
                      reports remain attached to your account.
                    </p>
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() => void call({ mode: "demo" }, "auth")}
                    >
                      Try the demo <ArrowRight size={16} />
                    </button>
                  </>
                )}
              </section>
            </div>
          )}
          {toast && (
            <div className="toast" role="status">
              {toast}
            </div>
          )}
        </div>
      </MotionConfig>
    );
  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`app ${active && page === "Virtual Trading" ? "focused" : ""}`}
      >
        <aside className={mobile ? "sidebar mobile-open" : "sidebar"}>
          <Link className="brand" href="/">
            ◈ {brand}
            <span className="brand-dot" />
          </Link>
          <div className="workspace-label">YOUR WORKSPACE</div>
          <nav>
            {nav.map(([label, Icon]) => (
              <button
                key={label}
                className={page === label ? "nav active" : "nav"}
                onClick={() => go(label)}
              >
                <Icon size={18} />
                {label}
                {label === "Notifications" && (
                  <span className="badge">
                    {data.state.notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            ))}
            {data.user.role === "admin" && (
              <button className="nav" onClick={() => go("Admin Overview")}>
                <ShieldCheck size={18} />
                Admin Overview
              </button>
            )}
          </nav>
          <div className="sidebar-bottom">
            <div className="practice-card">
              <ShieldCheck size={21} />
              <strong>A safe place to learn</strong>
              <p>
                Virtual funds.
                <br />
                Unlimited potential.
              </p>
            </div>
            <button className="user" onClick={() => go("Settings")}>
              <span className="avatar">{data.user.name[0]}</span>
              <span>
                <strong>{data.user.name}</strong>
                <small>
                  {data.user.role === "admin"
                    ? "Administrator"
                    : "Learning investor"}
                </small>
              </span>
              <ChevronRight size={15} />
            </button>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <button
              className="icon mobile-toggle"
              aria-label="Toggle menu"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              Workspace <ChevronRight size={13} />
              <strong>{page}</strong>
            </div>
            <div className="top-actions">
              <button
                className="search-button"
                onClick={() => setDialog("search")}
              >
                <Search size={16} /> Search markets <kbd>⌘ K</kbd>
              </button>
              <button
                className="icon"
                aria-label="Toggle dark mode"
                onClick={() => setDark(!dark)}
              >
                {dark ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <button
                className="icon"
                aria-label="Notifications"
                onClick={() => go("Notifications")}
              >
                <Bell size={19} />
              </button>
              <span className="avatar small-avatar">{data.user.name[0]}</span>
            </div>
          </header>
          <div className="demo-strip">
            <span className="dot" /> DEMONSTRATION MODE{" "}
            <span>
              Illustrative prices & fictional news · Virtual funds only · No
              live data
            </span>
            <button onClick={() => setDialog("Data & execution model")}>
              Details <ArrowUpRight size={12} />
            </button>
          </div>
          <main className="content">
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  {page === "Dashboard"
                    ? "A LITTLE WISER, EVERY DAY"
                    : "YOUR MARKET LEARNING LAB"}
                </div>
                <h1>
                  {page === "Dashboard"
                    ? `Good to see you, ${data.user.name.split(" ")[0]}.`
                    : page}
                </h1>
                <p>
                  {page === "Dashboard"
                    ? "The markets have a story. Let’s help you understand it."
                    : "Practice thoughtfully. Keep the evidence behind every decision."}
                </p>
              </div>
              <button
                className="primary"
                onClick={active ? () => go("Virtual Trading") : start}
              >
                <Play size={15} />
                {active ? "Resume session" : "Start trading session"}
                <ArrowUpRight size={16} />
              </button>
            </div>
            {page === "Dashboard" && (
              <>
                <div className="metric-grid">
                  {metric(
                    "Account equity",
                    money(valuation(account!), currency),
                    "Cash + marked holdings",
                  )}
                  {metric(
                    "Available cash",
                    money(account!.available ?? account!.cash, currency),
                    "After pending-order reserves",
                  )}
                  {metric(
                    "Investment return",
                    money(valuation(account!) - account!.initial, currency),
                    "Admin funding excluded",
                    valuation(account!) >= account!.initial,
                  )}
                  {metric(
                    "Learning progress",
                    `${data.state.completed.length} / 10`,
                    "Build knowledge, not just a balance",
                  )}
                </div>
                <div className="dashboard-grid">
                  <section className="panel performance">
                    <div className="panel-header">
                      <div>
                        <h3>Your market perspective</h3>
                        <p>
                          Illustrative candlestick scenario · {stock?.symbol}
                        </p>
                      </div>
                      <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                      >
                        {data.market.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                    {stock && <Chart bars={stock.bars} />}
                    <div className="chart-foot">
                      <span>
                        Price history is fictional, not an equity curve.
                      </span>
                      <button onClick={() => openStock(stock!)}>
                        Explore instrument <ArrowRight size={14} />
                      </button>
                    </div>
                  </section>
                  <section className="session-promo">
                    <span className="eyebrow">
                      THE FOCUSED TRADING EXPERIENCE
                    </span>
                    <div className="session-art">
                      <Clock size={62} strokeWidth={1} />
                      <span>15—45</span>
                      <small>MINUTES. ONE NEW PERSPECTIVE.</small>
                    </div>
                    <h2>
                      Less noise.
                      <br />
                      More intention.
                    </h2>
                    <p>
                      A dedicated terminal. Frozen news. Your own virtual
                      capital. Learn how you make decisions under pressure.
                    </p>
                    <button onClick={start}>
                      Step into a session <ArrowUpRight size={18} />
                    </button>
                  </section>
                  <section className="panel">
                    <div className="panel-header">
                      <h3>Market watch</h3>
                      <button onClick={() => go("Market Explorer")}>
                        View all <ArrowRight size={14} />
                      </button>
                    </div>
                    <MarketTable
                      items={data.market.slice(0, 4)}
                      onSelect={openStock}
                      watched={data.state.watchlist}
                      onWatch={(id) =>
                        void call({ type: "watch", instrument: id })
                      }
                    />
                  </section>
                  <section className="panel">
                    <div className="panel-header">
                      <h3>Your next small step</h3>
                      <BookOpen size={18} />
                    </div>
                    <div className="lesson-promo">
                      <span className="pill">THE LEARNING ACADEMY</span>
                      <h2>
                        {lessons[Math.min(data.state.completed.length, 9)][0]}
                      </h2>
                      <p>
                        Turn an unfamiliar concept into a confident decision.
                        One lesson at a time.
                      </p>
                      <div className="progress">
                        <span
                          style={{
                            width: `${data.state.completed.length * 10}%`,
                          }}
                        />
                      </div>
                      <button className="text-link" onClick={() => go("Learn")}>
                        Continue learning <ArrowRight size={15} />
                      </button>
                    </div>
                  </section>
                </div>
                <section className="panel news-section">
                  <div className="panel-header">
                    <h3>Beyond the headline</h3>
                    <button onClick={() => go("News Intelligence")}>
                      All learning stories <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="news-grid">
                    {data.news.map((n) => (
                      <button
                        className="news-card"
                        key={n.id}
                        onClick={() => setArticle(n)}
                      >
                        <span className="eyebrow">
                          {n.region} · FICTIONAL SCENARIO
                        </span>
                        <h3>{n.title}</h3>
                        <p>{n.body}</p>
                        <span className="text-link">
                          Understand the context <ArrowUpRight size={14} />
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}
            {(page === "Market Explorer" || page === "Watchlists") && (
              <section className="panel">
                <div className="filter-bar">
                  <div className="input-search">
                    <Search size={16} />
                    <input
                      placeholder="Search name, ticker, or sector…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    {["All", "India", "USA", "UK", "Japan"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </div>
                <MarketTable
                  items={matches.filter(
                    (i) =>
                      page !== "Watchlists" ||
                      data.state.watchlist.includes(i.id),
                  )}
                  onSelect={openStock}
                  watched={data.state.watchlist}
                  onWatch={(id) => void call({ type: "watch", instrument: id })}
                />
                <p className="muted small inset">
                  Instrument identities are real; every displayed price is
                  illustrative. Financial statements and ratios are unavailable
                  in demo mode.
                </p>
              </section>
            )}
            {page === "Virtual Trading" && stock && account && (
              <>
                <div className="terminal-status">
                  <span>
                    <span className="dot" />{" "}
                    {active
                      ? "SESSION REPLAY · ONE OBSERVATION / MINUTE"
                      : "PRACTICE · FIXED ILLUSTRATIVE QUOTE"}
                  </span>
                  {active && (
                    <>
                      <strong>
                        {Math.max(
                          0,
                          Math.floor((active.expires - now) / 60000),
                        )}
                        :
                        {String(
                          Math.max(
                            0,
                            Math.floor((active.expires - now) / 1000) % 60,
                          ),
                        ).padStart(2, "0")}
                      </strong>
                      <button
                        className="outline"
                        onClick={async () => {
                          await call({ type: "finish", id: active.id });
                          go("Session History");
                        }}
                      >
                        Finish & reflect
                      </button>
                    </>
                  )}
                </div>
                <div className="trading-grid">
                  <section className="panel">
                    <div className="panel-header">
                      <div>
                        <h2>
                          {stock.symbol} <small>{stock.exchange}</small>
                        </h2>
                        <p>
                          {stock.name} · {stock.currency} · Illustrative
                        </p>
                      </div>
                      <select
                        value={selected}
                        onChange={(e) => {
                          const i = data.market.find(
                            (i) => i.id === e.target.value,
                          )!;
                          setSelected(i.id);
                          if (!active) setCurrency(i.currency);
                        }}
                      >
                        {data.market
                          .filter(
                            (i) =>
                              !active ||
                              (i.currency === active.account.currency &&
                                (active.region === "Global" ||
                                  i.country === active.region)),
                          )
                          .map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.symbol}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="quote">
                      {money(stock.price, stock.currency)}
                      <span className="muted small">
                        Fictional replay observation
                      </span>
                    </div>
                    <Chart bars={stock.bars} />
                    <details className="inset">
                      <summary>How to read this chart</summary>
                      <p>
                        A candle shows open, high, low and close. Wicks show
                        extremes; the body connects open and close. Indicators
                        do not guarantee future movement.
                      </p>
                      <table>
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Open</th>
                            <th>High</th>
                            <th>Low</th>
                            <th>Close</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stock.bars.slice(-5).map((b) => (
                            <tr key={b.time}>
                              <td>
                                {new Date(b.time * 1000).toLocaleDateString()}
                              </td>
                              <td>{b.open.toFixed(2)}</td>
                              <td>{b.high.toFixed(2)}</td>
                              <td>{b.low.toFixed(2)}</td>
                              <td>{b.close.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  </section>
                  <section className="panel order-panel">
                    <div className="panel-header">
                      <h3>Place a virtual order</h3>
                      <ShieldCheck size={17} />
                    </div>
                    <p className="muted small">
                      Available cash ·{" "}
                      {money(
                        account.available ?? account.cash,
                        account.currency,
                      )}
                    </p>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        await call({
                          type: "order",
                          id: crypto.randomUUID(),
                          instrument: stock.id,
                          side: f.get("side"),
                          kind: f.get("kind"),
                          quantity: Number(f.get("quantity")),
                          limit: f.get("limit")
                            ? Math.round(Number(f.get("limit")) * 100)
                            : undefined,
                          reason: f.get("reason"),
                          session: active?.id,
                        });
                      }}
                    >
                      <div className="two-col">
                        <label>
                          Direction
                          <select name="side">
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                          </select>
                        </label>
                        <label>
                          Order type
                          <select name="kind">
                            <option value="market">Market</option>
                            <option value="limit">Limit</option>
                          </select>
                        </label>
                      </div>
                      <label>
                        Shares
                        <input
                          name="quantity"
                          type="number"
                          min="1"
                          max="10000"
                          step="1"
                          defaultValue="1"
                          required
                        />
                      </label>
                      <label>
                        Limit price (for limit orders)
                        <input
                          name="limit"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder={String(stock.price / 100)}
                        />
                      </label>
                      <label>
                        Your investment hypothesis
                        <textarea
                          name="reason"
                          minLength={3}
                          maxLength={2000}
                          required
                          placeholder="What evidence supports this decision?"
                        />
                      </label>
                      <button
                        className="primary"
                        disabled={busy || stock.currency !== account.currency}
                      >
                        Submit virtual order <ArrowRight size={16} />
                      </button>
                      <p className="muted small">
                        0.1% simulated fee, rounded up. Full fills at the
                        observed fictional tick; no real liquidity or slippage
                        model. Short selling is disabled.
                      </p>
                    </form>
                  </section>
                </div>
                <div className="metric-grid">
                  {metric(
                    "Session cash",
                    money(account.cash, account.currency),
                    "Session funds stay isolated",
                  )}
                  {metric(
                    "Equity",
                    money(valuation(account), account.currency),
                    "Cash + marked positions",
                  )}
                  {metric(
                    "Starting capital",
                    money(account.initial, account.currency),
                    "Fixed for the entire session",
                  )}
                  {metric(
                    "Orders",
                    String(account.orders.length),
                    "Persisted on the server",
                  )}
                </div>
                <section className="panel">
                  <div className="panel-header">
                    <h3>Order activity</h3>
                    <span className="pill">SERVER AUTHORITATIVE</span>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Instrument</th>
                          <th>Side</th>
                          <th>Quantity</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Fill</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {account.orders.map((o) => (
                          <tr key={o.id}>
                            <td>{o.instrument}</td>
                            <td>{o.side}</td>
                            <td>{o.quantity}</td>
                            <td>{o.kind}</td>
                            <td>
                              <span className="pill">{o.status}</span>
                            </td>
                            <td>
                              {o.fill ? money(o.fill, account.currency) : "—"}
                            </td>
                            <td>
                              {o.status === "pending" && (
                                <button
                                  onClick={() =>
                                    void call({
                                      type: "cancel",
                                      id: o.id,
                                      session: active?.id,
                                    })
                                  }
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!account.orders.length && (
                      <div className="empty">
                        Your first thoughtful trade starts here.
                      </div>
                    )}
                  </div>
                </section>
                <section className="panel">
                  <div className="panel-header">
                    <h3>
                      {active ? "Frozen session news" : "Scenario reading"}
                    </h3>
                    <span className="muted small">
                      Fictional educational events
                    </span>
                  </div>
                  <div className="news-grid">
                    {data.news.map((n) => (
                      <button
                        className="news-card"
                        key={n.id}
                        onClick={() => setArticle(n)}
                      >
                        <h3>{n.title}</h3>
                        <p>{n.body}</p>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}
            {(page === "Trading Sessions" ||
              page === "Historical Replay" ||
              page === "Session History") && (
              <>
                <section className="session-banner">
                  <div>
                    <span className="eyebrow">PRACTICE WITH PURPOSE</span>
                    <h2>
                      A session ends.
                      <br />
                      The learning stays.
                    </h2>
                    <p>
                      15–45 minutes of wall-clock time. Isolated capital, a
                      fixed news set, and a report you can return to.
                    </p>
                  </div>
                  <button className="primary" onClick={start}>
                    Configure session <Plus size={16} />
                  </button>
                </section>
                {data.state.sessions.length ? (
                  data.state.sessions
                    .slice()
                    .reverse()
                    .map((s) => (
                      <section className="panel" key={s.id}>
                        <div className="panel-header">
                          <div>
                            <h3>
                              {s.region} · {s.duration}-minute session
                            </h3>
                            <p>
                              {new Date(s.start).toLocaleString()} ·{" "}
                              {s.id.slice(0, 8)}
                            </p>
                          </div>
                          <span className="pill">{s.status}</span>
                        </div>
                        <div className="metric-grid">
                          {metric(
                            "Starting capital",
                            money(s.account.initial, s.account.currency),
                            "Fixed allocation",
                          )}
                          {metric(
                            "Final equity",
                            money(
                              s.report?.equity ?? valuation(s.account),
                              s.account.currency,
                            ),
                            "Positions marked, not liquidated",
                          )}
                          {metric(
                            "Net result",
                            money(s.report?.return ?? 0, s.account.currency),
                            "After simulated fees",
                          )}
                          {metric(
                            "Executed orders",
                            String(
                              s.report?.trades ??
                                s.account.orders.filter(
                                  (o) => o.status === "filled",
                                ).length,
                            ),
                            "Full fills only",
                          )}
                        </div>
                        {s.report && (
                          <div className="inset">
                            <h3>Your reflection</h3>
                            <EquityCurve
                              points={s.snapshots ?? []}
                              currency={s.account.currency}
                            />
                            <p>
                              Maximum observed drawdown:{" "}
                              {(
                                maximumDrawdown(
                                  (s.snapshots ?? []).map((p) => p.equity),
                                ) * 100
                              ).toFixed(2)}
                              %. Realized P&L:{" "}
                              {money(
                                s.account.realized ?? 0,
                                s.account.currency,
                              )}
                              . This covers sampled observations, not
                              intraperiod extremes.
                            </p>
                            <p>
                              Review your recorded hypotheses alongside each
                              outcome. A profitable result does not prove good
                              reasoning; a loss does not prove poor reasoning.
                              Examine concentration, evidence, and the effect of
                              fees ({money(s.report.fees, s.account.currency)}).
                            </p>
                            {s.account.orders.map((o) => (
                              <details key={o.id}>
                                <summary>
                                  {o.side} {o.quantity} {o.instrument} ·{" "}
                                  {o.status}
                                </summary>
                                <p>{o.reason}</p>
                              </details>
                            ))}
                            <button
                              className="outline"
                              onClick={() => window.print()}
                            >
                              Print / save report as PDF
                            </button>
                          </div>
                        )}
                        {s.status === "active" && (
                          <button
                            className="primary inset-button"
                            onClick={() => go("Virtual Trading")}
                          >
                            Resume terminal <ArrowRight size={16} />
                          </button>
                        )}
                      </section>
                    ))
                ) : (
                  <div className="empty">
                    No sessions yet. Start with a 15-minute practice.
                  </div>
                )}
              </>
            )}
            {page === "Portfolio Analytics" && (
              <>
                <div className="filter-bar">
                  <label>
                    Account currency
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {data.state.accounts.map((a) => (
                        <option key={a.id}>{a.currency}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="metric-grid">
                  {metric(
                    "Account equity",
                    money(valuation(account!), currency),
                    "Cash + holdings",
                  )}
                  {metric(
                    "Available cash",
                    money(account!.available ?? account!.cash, currency),
                    "After pending-order reserves",
                  )}
                  {metric(
                    "Net investment P&L",
                    money(valuation(account!) - account!.initial, currency),
                    "Funding excluded",
                  )}
                  {metric(
                    "Positions",
                    String(account!.positions.length),
                    "Diversification is not guaranteed",
                  )}
                </div>
                <section className="panel">
                  <div className="panel-header">
                    <h3>Holdings & allocation</h3>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Instrument</th>
                        <th>Shares</th>
                        <th>Average cost</th>
                        <th>Market value</th>
                        <th>Unrealized P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {account!.positions.map((p) => {
                        const value =
                          p.quantity *
                          data.market.find((i) => i.id === p.instrument)!.price;
                        return (
                          <tr key={p.instrument}>
                            <td>{p.instrument}</td>
                            <td>{p.quantity}</td>
                            <td>
                              {money(Math.round(p.cost / p.quantity), currency)}
                            </td>
                            <td>{money(value, currency)}</td>
                            <td className={value >= p.cost ? "up" : "down"}>
                              {money(value - p.cost, currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!account!.positions.length && (
                    <div className="empty">
                      No holdings in this currency account.
                    </div>
                  )}
                </section>
                <section className="panel">
                  <div className="panel-header">
                    <h3>Append-only wallet ledger</h3>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Reason / provenance</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {account!.ledger
                        .slice()
                        .reverse()
                        .map((l) => (
                          <tr key={l.id}>
                            <td>{new Date(l.time).toLocaleString()}</td>
                            <td>{l.reason}</td>
                            <td>{money(l.amount, currency)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </section>
              </>
            )}
            {page === "News Intelligence" && (
              <>
                <div className="notice">
                  These are fictional learning scenarios, not actual news. Links
                  point to educational references, not evidence of fictional
                  events. Live ingestion is not configured.
                </div>
                <div className="news-grid">
                  {data.news.map((n) => (
                    <button
                      className="panel news-card"
                      key={n.id}
                      onClick={() => setArticle(n)}
                    >
                      <span className="eyebrow">
                        {n.category} · {n.region}
                      </span>
                      <h2>{n.title}</h2>
                      <p>{n.body}</p>
                      <span className="text-link">
                        Facts, scenarios & uncertainty <ArrowRight size={15} />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {page === "Learn" && (
              <div className="learning-grid">
                <section className="panel module-list">
                  {lessons.map((l, i) => (
                    <button
                      key={l[0]}
                      className={
                        lesson === i ? "lesson active-lesson" : "lesson"
                      }
                      onClick={() => {
                        setLesson(i);
                        setAnswer(-1);
                      }}
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <strong>{l[0]}</strong>
                      {data.state.completed.includes(i) ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <ChevronRight size={17} />
                      )}
                    </button>
                  ))}
                </section>
                <section className="panel lesson-content">
                  <span className="eyebrow">
                    LEVEL {lesson + 1} · THE LEARNING ACADEMY
                  </span>
                  <h2>{lessons[lesson][0]}</h2>
                  <p>{lessons[lesson][1]}</p>
                  <div className="learning-visual">
                    <BookOpen size={52} />
                    <span>Understand → Practice → Reflect</span>
                  </div>
                  <h3>Check your understanding</h3>
                  <p>{lessons[lesson][2]}</p>
                  {lessons[lesson][3].map((a, i) => (
                    <label className="quiz-option" key={a}>
                      <input
                        type="radio"
                        name="answer"
                        checked={answer === i}
                        onChange={() => setAnswer(i)}
                      />
                      {a}
                    </label>
                  ))}
                  <button
                    className="primary"
                    disabled={answer < 0 || busy}
                    onClick={() => void call({ type: "quiz", lesson, answer })}
                  >
                    Check answer <ArrowRight size={16} />
                  </button>
                </section>
              </div>
            )}
            {page === "Investment Journal" && (
              <>
                <section className="panel journal-form">
                  <span className="eyebrow">YOUR PROCESS, IN YOUR WORDS</span>
                  <h2>Write before you react.</h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const f = new FormData(form);
                      if (await call({ type: "journal", text: f.get("text") }))
                        form.reset();
                    }}
                  >
                    <label>
                      Hypothesis, evidence, risks, confidence & lessons
                      <textarea
                        name="text"
                        required
                        minLength={3}
                        maxLength={4000}
                        placeholder="I expect… because… I could be wrong if…"
                      />
                    </label>
                    <button className="primary" disabled={busy}>
                      Save reflection <NotebookPen size={16} />
                    </button>
                  </form>
                </section>
                {data.state.journal.map((j) => (
                  <section className="panel inset" key={j.id}>
                    <span className="muted small">
                      {new Date(j.time).toLocaleString()}
                    </span>
                    <p className="preserve">{j.text}</p>
                  </section>
                ))}
              </>
            )}
            {page === "Learn" && (
              <section className="panel inset">
                <h3>Your financial glossary</h3>
                <div className="glossary-grid">
                  {Object.keys(glossary).map((term) => (
                    <span key={term}>
                      {term} <Glossary term={term} />
                    </span>
                  ))}
                </div>
              </section>
            )}
            {page === "IPO Lab" && (
              <section className="panel lesson-content">
                <span className="eyebrow">FICTIONAL IPO SCENARIO</span>
                <h2>Meet Greenwave Learning Co.</h2>
                <p>
                  A fictional company offers shares at ₹100. This demonstration
                  allocates half the requested shares, rounded up. Only allotted
                  shares are debited. This simplified model does not represent a
                  real IPO or guarantee an allotment.
                </p>
                <div className="learning-visual">
                  Prospectus → Application → Allotment → Listing
                </div>
                <p>
                  Read a prospectus for business risks, use of proceeds, and
                  valuation. Listing prices can fall below the issue price. No
                  listing performance is simulated in this version.
                </p>
                {data.state.ipo ? (
                  <div className="notice">
                    Allotted {data.state.ipo.shares} fictional shares. Cost:{" "}
                    {money(data.state.ipo.cost)}. IPO assets are held separately
                    and excluded from practice portfolio totals.
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void call({
                        type: "ipo",
                        quantity: Number(
                          new FormData(e.currentTarget).get("quantity"),
                        ),
                      });
                    }}
                  >
                    <label>
                      Requested shares
                      <input
                        name="quantity"
                        type="number"
                        min="1"
                        max="100"
                        defaultValue="10"
                        required
                      />
                    </label>
                    <button className="primary" disabled={busy}>
                      Apply with virtual funds <ArrowRight size={16} />
                    </button>
                  </form>
                )}
              </section>
            )}
            {page === "Achievements" && (
              <div className="news-grid">
                {[
                  [
                    "First principles",
                    data.state.completed.length >= 1,
                    "Complete your first lesson",
                  ],
                  [
                    "Knowledge builder",
                    data.state.completed.length >= 5,
                    "Complete five lessons",
                  ],
                  [
                    "Thoughtful trader",
                    data.state.sessions.some((s) => s.status === "completed"),
                    "Complete and review a session",
                  ],
                ].map(([title, earned, description]) => (
                  <section
                    className={`panel achievement ${earned ? "earned" : ""}`}
                    key={String(title)}
                  >
                    <Trophy size={40} />
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <span className="pill">
                      {earned ? "Earned" : "Keep learning"}
                    </span>
                  </section>
                ))}
              </div>
            )}
            {page === "Notifications" && (
              <section className="panel inset">
                <h2>Your learning updates</h2>
                {data.state.notifications.map((n) => (
                  <div className="notification" key={n.id}>
                    <Bell size={20} />
                    <p>{n.text}</p>
                    <button
                      className="outline"
                      disabled={n.read}
                      onClick={() => void call({ type: "read", id: n.id })}
                    >
                      {n.read ? "Read" : "Mark read"}
                    </button>
                  </div>
                ))}
                <p className="muted small">
                  Browser push is unavailable until VAPID keys, subscription
                  storage, and a delivery worker are configured.
                </p>
              </section>
            )}
            {page === "AI Learning Assistant" && (
              <section className="panel lesson-content">
                <span className="eyebrow">
                  EDUCATIONAL REFERENCE · NO LLM CONNECTED
                </span>
                <h2>Make room for a better question.</h2>
                <p>
                  This offline reference explains concepts from the academy. It
                  does not generate AI answers or investment recommendations.
                </p>
                <input
                  aria-label="Search financial concepts"
                  placeholder="Search a concept, such as orders or risk…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {lessons
                  .filter((l) =>
                    `${l[0]} ${l[1]}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((l) => (
                    <details key={l[0]}>
                      <summary>{l[0]}</summary>
                      <p>{l[1]}</p>
                    </details>
                  ))}
              </section>
            )}
            {page === "Settings" && (
              <section className="panel lesson-content">
                <h2>Your workspace</h2>
                <p>
                  {data.user.name} · {data.user.email}
                </p>
                <button className="outline" onClick={() => setDark(!dark)}>
                  {dark ? <Sun size={16} /> : <Moon size={16} />} Switch
                  appearance
                </button>
                <button
                  className="outline"
                  onClick={() => {
                    go("Dashboard");
                    setTour(0);
                  }}
                >
                  Replay guided introduction
                </button>
                <button
                  className="outline"
                  onClick={() => void call({}, "logout")}
                >
                  <LogOut size={16} /> Sign out
                </button>
                <div className="notice">
                  All balances are virtual and cannot be redeemed. This local
                  demo stores account data on this server. Production Supabase
                  authentication is not connected.
                </div>
              </section>
            )}
            {page === "Classroom" && (
              <>
                <section className="panel lesson-content">
                  <h2>Learn together.</h2>
                  <p>
                    Private classroom rankings emphasize lesson completion,
                    never risk-taking or trading frequency. Members can see
                    classmates’ display names and lesson counts only.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      void call({ type: "joinClassroom", code: f.get("code") });
                    }}
                  >
                    <label>
                      Classroom invite code
                      <input name="code" required maxLength={30} />
                    </label>
                    <button className="primary" disabled={busy}>
                      Join classroom
                    </button>
                  </form>
                  {data.user.role === "admin" && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void call({
                          type: "createClassroom",
                          name: new FormData(e.currentTarget).get("name"),
                        });
                      }}
                    >
                      <label>
                        New classroom name
                        <input
                          name="name"
                          minLength={3}
                          maxLength={80}
                          required
                        />
                      </label>
                      <button className="outline" disabled={busy}>
                        Create classroom
                      </button>
                    </form>
                  )}
                </section>
                {data.classrooms.map((c) => (
                  <section className="panel inset" key={c.id}>
                    <h2>{c.name}</h2>
                    {c.code && (
                      <p>
                        Invite code: <code>{c.code}</code>
                      </p>
                    )}
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Completed lessons</th>
                        </tr>
                      </thead>
                      <tbody>
                        {c.members
                          .slice()
                          .sort((a, b) => b.lessons - a.lessons)
                          .map((m) => (
                            <tr key={m.id}>
                              <td>{m.name}</td>
                              <td>{m.lessons} / 10</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </section>
                ))}
              </>
            )}
            {page === "Admin Overview" && data.user.role === "admin" && (
              <section className="panel lesson-content">
                <h2>Authorized wallet funding</h2>
                <p>
                  Credits apply only to practice accounts. Active session
                  capital is immutable. Every credit requires an audit reason.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    void call({
                      type: "fund",
                      id: crypto.randomUUID(),
                      target: f.get("target"),
                      currency: f.get("currency"),
                      amount: Math.round(Number(f.get("amount")) * 100),
                      reason: f.get("reason"),
                    });
                  }}
                >
                  <label>
                    Student
                    <select name="target">
                      {data.users?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} · {u.email}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Currency
                    <select name="currency">
                      {["INR", "USD", "GBP", "JPY"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Virtual credit
                    <input
                      name="amount"
                      type="number"
                      min="0.01"
                      max="1000000"
                      step="0.01"
                      required
                    />
                  </label>
                  <label>
                    Audit reason
                    <textarea name="reason" minLength={10} required />
                  </label>
                  <button className="primary" disabled={busy}>
                    Credit practice account
                  </button>
                </form>
                <h3>Session rules</h3>
                <p>
                  Changes apply to new sessions. Existing session contracts
                  remain fixed.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    void call({
                      type: "rules",
                      id: crypto.randomUUID(),
                      capital: Math.round(Number(f.get("capital")) * 100),
                      durations: f.getAll("durations").map(Number),
                      regions: f.getAll("regions"),
                      reason: f.get("reason"),
                    });
                  }}
                >
                  <label>
                    Mandatory starting virtual capital
                    <input
                      name="capital"
                      type="number"
                      min="1000"
                      max="1000000"
                      defaultValue={data.rules.capital / 100}
                      required
                    />
                  </label>
                  <div className="two-col">
                    <div>
                      <strong className="small">Allowed durations</strong>
                      {[15, 20, 25, 30, 35, 40, 45].map((d) => (
                        <label className="rule-check" key={d}>
                          <input
                            type="checkbox"
                            name="durations"
                            value={d}
                            defaultChecked={data.rules.durations.includes(d)}
                          />
                          {d} minutes
                        </label>
                      ))}
                    </div>
                    <div>
                      <strong className="small">Allowed markets</strong>
                      {["India", "USA", "Global"].map((r) => (
                        <label className="rule-check" key={r}>
                          <input
                            type="checkbox"
                            name="regions"
                            value={r}
                            defaultChecked={data.rules.regions.includes(r)}
                          />
                          {r}
                        </label>
                      ))}
                    </div>
                  </div>
                  <label>
                    Configuration reason
                    <textarea
                      name="reason"
                      minLength={10}
                      maxLength={1000}
                      required
                    />
                  </label>
                  <button className="outline" disabled={busy}>
                    Save session rules
                  </button>
                </form>
                <h3>Audit trail</h3>
                {data.audit?.map((a) => (
                  <p key={a.id}>
                    {new Date(a.time).toLocaleString()} · {a.reason} ·{" "}
                    {a.amount} minor units
                  </p>
                ))}
              </section>
            )}
            <footer>
              {brand}{" "}
              <span>Learn with intention. Trade with virtual funds.</span>
              <button onClick={() => setDialog("Data & execution model")}>
                Simulation methodology <ArrowUpRight size={12} />
              </button>
            </footer>
          </main>
        </div>
        {(dialog || article || tour >= 0) && (
          <div className="overlay">
            <motion.section
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-label={article?.title ?? dialog ?? "Guided tour"}
            >
              <button
                className="close"
                aria-label="Close dialog"
                onClick={() => {
                  setDialog("");
                  setArticle(null);
                  setTour(-1);
                }}
              >
                <X size={20} />
              </button>
              {article ? (
                <>
                  <span className="eyebrow">
                    FICTIONAL EVENT · EDUCATIONAL ANALYSIS
                  </span>
                  <h2>{article.title}</h2>
                  <p>{article.body}</p>
                  <h3>Scenario assumptions</h3>
                  <p>{article.facts}</p>
                  <h3>Possible positive consequence</h3>
                  <p>{article.positive}</p>
                  <h3>Possible negative consequence</h3>
                  <p>{article.negative}</p>
                  <div className="notice">
                    These are plausible interpretations, not predictions. Check
                    evidence, timing, valuation, and alternative explanations.
                  </div>
                  <a
                    className="text-link"
                    target="_blank"
                    rel="noreferrer"
                    href={article.url}
                  >
                    {article.source} <ArrowUpRight size={16} />
                  </a>
                </>
              ) : tour >= 0 ? (
                <>
                  <span className="eyebrow">
                    YOUR INTRODUCTION · {tour + 1} / 3
                  </span>
                  <h2>
                    {
                      [
                        "A balance built for learning",
                        "Trade with a hypothesis",
                        "Finish with reflection",
                      ][tour]
                    }
                  </h2>
                  <p>
                    {
                      [
                        "Your practice accounts use virtual funds. Markets, prices and news are clearly marked as illustrative.",
                        "Use the trading terminal to record evidence before buying or selling. Session capital and news remain fixed.",
                        "Complete lessons and revisit reports. Your reasoning matters more than a short-term return.",
                      ][tour]
                    }
                  </p>
                  <button
                    className="primary"
                    onClick={() => setTour(tour === 2 ? -1 : tour + 1)}
                  >
                    {tour === 2 ? "Start exploring" : "Next"}
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : dialog === "session" ? (
                <>
                  <span className="eyebrow">
                    A LITTLE FOCUS GOES A LONG WAY
                  </span>
                  <h2>Set your trading session.</h2>
                  <p>
                    Wall-clock countdown · fictional replay · isolated capital
                    of {(data.rules.capital / 100).toLocaleString()} selected
                    currency units.
                  </p>
                  <label>
                    Duration · {duration} minutes
                    <select
                      aria-label="Session duration"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    >
                      {data.rules.durations.map((d) => (
                        <option key={d} value={d}>
                          {d} minutes
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Market region
                    <select
                      value={sessionRegion}
                      onChange={(e) => setSessionRegion(e.target.value)}
                    >
                      {data.rules.regions.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  {sessionRegion === "Global" && (
                    <label>
                      Trading currency
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        {["INR", "USD", "GBP", "JPY"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="notice">
                    <Clock size={17} /> One fictional observation is revealed
                    per minute. News is frozen. Live market and classroom modes
                    are not available.
                  </div>
                  <button
                    className="primary"
                    disabled={busy || !!active}
                    onClick={() => void begin()}
                  >
                    {active
                      ? "Finish your active session first"
                      : "Begin session"}
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : dialog === "search" ? (
                <>
                  <h2>Find your next learning opportunity.</h2>
                  <div className="input-search">
                    <Search size={18} />
                    <input
                      autoFocus
                      placeholder="Search markets…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <Command size={17} />
                  </div>
                  {data.market
                    .filter((i) =>
                      `${i.name} ${i.symbol}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .map((i) => (
                      <button
                        className="search-result"
                        onClick={() => openStock(i)}
                        key={i.id}
                      >
                        <strong>{i.symbol}</strong>
                        <span>{i.name}</span>
                        <span className="muted small">{i.exchange}</span>
                        <ArrowUpRight size={16} />
                      </button>
                    ))}
                </>
              ) : (
                <>
                  <h2>Transparent by design.</h2>
                  <p>
                    All demo prices are synthetic and generated from a
                    deterministic fictional scenario. Instrument names identify
                    real companies but displayed data does not describe their
                    actual performance. All news events are fictional.
                  </p>
                  <p>
                    Sessions last 15–45 wall-clock minutes. Each minute reveals
                    the next fictional observation. Orders fill in full at that
                    observed quote; pending limits are evaluated at the current
                    observation on server requests. This model has no spread,
                    slippage, liquidity, dividends, holidays or corporate
                    actions.
                  </p>
                  <p>
                    Money uses integer minor units (including 1/100 JPY for this
                    demo accounting convention). Currency accounts are separate:
                    no FX conversion occurs. Session expiry cancels pending
                    orders and marks remaining positions rather than liquidating
                    them.
                  </p>
                </>
              )}
            </motion.section>
          </div>
        )}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="toast"
            role="status"
          >
            <CheckCircle2 size={18} />
            {toast}
          </motion.div>
        )}
      </div>
    </MotionConfig>
  );
}
function MarketTable({
  items,
  onSelect,
  watched,
  onWatch,
}: {
  items: Market[];
  onSelect: (i: Market) => void;
  watched: string[];
  onWatch: (id: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Company / instrument</th>
            <th>Market</th>
            <th>Illustrative price</th>
            <th>Sector</th>
            <th>Watch</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, n) => (
            <tr key={i.id}>
              <td>
                <button className="stock-name" onClick={() => onSelect(i)}>
                  <span className={`stock-logo logo-${n % 4}`}>
                    {i.symbol.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{i.symbol}</strong>
                    <small>{i.name}</small>
                  </span>
                </button>
              </td>
              <td>
                {i.exchange}
                <small>{i.country}</small>
              </td>
              <td className="numeric">
                {money(i.price, i.currency)}
                <small>{i.currency} · synthetic</small>
              </td>
              <td>
                <span className="sector">{i.sector}</span>
              </td>
              <td>
                <button
                  className={watched.includes(i.id) ? "icon starred" : "icon"}
                  onClick={() => onWatch(i.id)}
                  aria-label={`${watched.includes(i.id) ? "Remove" : "Add"} ${i.symbol} ${watched.includes(i.id) ? "from" : "to"} watchlist`}
                >
                  <Star
                    size={17}
                    fill={watched.includes(i.id) ? "currentColor" : "none"}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length && (
        <div className="empty">
          No matching instruments. Try another filter.
        </div>
      )}
    </div>
  );
}
