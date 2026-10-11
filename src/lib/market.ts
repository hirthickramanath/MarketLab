export const instruments = [
  {
    id: "XNSE:RELIANCE",
    symbol: "RELIANCE",
    name: "Reliance Industries",
    exchange: "NSE",
    country: "India",
    currency: "INR",
    sector: "Energy",
    base: 284500,
  },
  {
    id: "XNSE:TCS",
    symbol: "TCS",
    name: "Tata Consultancy Services",
    exchange: "NSE",
    country: "India",
    currency: "INR",
    sector: "Technology",
    base: 412300,
  },
  {
    id: "XNSE:HDFCBANK",
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    exchange: "NSE",
    country: "India",
    currency: "INR",
    sector: "Financials",
    base: 168900,
  },
  {
    id: "XNAS:AAPL",
    symbol: "AAPL",
    name: "Apple",
    exchange: "Nasdaq",
    country: "USA",
    currency: "USD",
    sector: "Technology",
    base: 22450,
  },
  {
    id: "XNAS:NVDA",
    symbol: "NVDA",
    name: "NVIDIA",
    exchange: "Nasdaq",
    country: "USA",
    currency: "USD",
    sector: "Technology",
    base: 13280,
  },
  {
    id: "XNYS:JNJ",
    symbol: "JNJ",
    name: "Johnson & Johnson",
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    sector: "Healthcare",
    base: 15640,
  },
  {
    id: "XLON:AZN",
    symbol: "AZN",
    name: "AstraZeneca",
    exchange: "LSE",
    country: "UK",
    currency: "GBP",
    sector: "Healthcare",
    base: 118000,
  },
  {
    id: "XTKS:7203",
    symbol: "7203",
    name: "Toyota Motor",
    exchange: "TSE",
    country: "Japan",
    currency: "JPY",
    sector: "Consumer",
    base: 273500,
  },
];
export type Instrument = (typeof instruments)[number];
export function price(id: string, tick = 0) {
  const i = instruments.find((x) => x.id === id);
  if (!i) throw new Error("Unknown instrument");
  const seed = instruments.indexOf(i) + 1;
  return Math.round(
    i.base * (1 + 0.015 * Math.sin(tick * 0.45 + seed) + 0.002 * tick),
  );
}
export function bars(id: string, tick: number) {
  return Array.from({ length: Math.min(90, 30 + tick) }, (_, n) => {
    const t = n - 29;
    const close = price(id, t);
    const open = price(id, t - 1);
    return {
      time: Math.floor(Date.UTC(2024, 0, 1) / 1000) + n * 86400,
      open: open / 100,
      close: close / 100,
      volume: Math.round(
        10000 +
          5000 *
            Math.abs(Math.sin(n + instruments.findIndex((i) => i.id === id))),
      ),
      high: (Math.max(open, close) * 1.004) / 100,
      low: (Math.min(open, close) * 0.996) / 100,
    };
  });
}
export const news = [
  {
    id: "n1",
    title: "Scenario: borrowing costs stay elevated",
    category: "Macroeconomics",
    region: "Global",
    body: "Fictional classroom scenario: the central bank holds its policy rate steady. No real announcement is represented.",
    facts: "In this scenario, borrowing costs are unchanged.",
    positive: "Savers may continue receiving interest income.",
    negative: "Highly leveraged businesses may face refinancing pressure.",
    concept: "Interest rates",
    url: "https://www.rbi.org.in/",
    source: "RBI educational reference (not a source for this fictional event)",
  },
  {
    id: "n2",
    title: "Scenario: technology company expands investment",
    category: "Companies",
    region: "USA",
    body: "Fictional scenario: a technology business allocates more capital to research. This is not company news.",
    facts: "The fictional company plans higher research spending.",
    positive: "Investment could create future products.",
    negative: "Higher spending may reduce near-term margins.",
    concept: "Capital allocation",
    url: "https://www.investor.gov/introduction-investing",
    source: "Investor.gov educational reference",
  },
  {
    id: "n3",
    title: "Scenario: an energy supply disruption",
    category: "Sectors",
    region: "India",
    body: "Fictional learning event: a temporary supply constraint affects energy costs.",
    facts: "The scenario assumes a temporary supply constraint.",
    positive: "Some producers might receive higher prices.",
    negative: "Transport and manufacturing input costs could rise.",
    concept: "Supply and demand",
    url: "https://www.investor.gov/introduction-investing/investing-basics",
    source: "Investor.gov educational reference",
  },
];
export const lessons = [
  [
    "Stocks & ownership",
    "A share represents a small ownership interest in a company. Its price can rise or fall. Dividends are not guaranteed.",
    "What does a share represent?",
    ["Ownership in a company", "A guaranteed return", "A bank deposit"],
  ],
  [
    "How exchanges work",
    "Exchanges bring buyers and sellers together under market rules. A ticker must be interpreted together with its exchange.",
    "Why include the exchange with a ticker?",
    [
      "All tickers are unique worldwide",
      "To resolve symbol ambiguity",
      "To guarantee liquidity",
    ],
  ],
  [
    "Orders & execution",
    "A market order prioritizes execution. A limit order specifies the maximum buy price or minimum sell price. Execution is not guaranteed.",
    "Which order can remain unfilled?",
    ["A limit order", "Only a market order", "Neither"],
  ],
  [
    "IPOs & public listings",
    "An IPO is a first public offering of shares. Allotment and listing price are uncertain. Read risks in the prospectus.",
    "Is IPO profit guaranteed?",
    ["Yes", "Only for large companies", "No"],
  ],
  [
    "Company fundamentals",
    "Revenue is income from sales before costs. Earnings account for expenses. Ratios require context and valid data.",
    "Revenue minus expenses is closest to:",
    ["Market cap", "Earnings", "Trading volume"],
  ],
  [
    "News & macroeconomics",
    "Distinguish a verified fact from a possible consequence. Markets can respond differently than an initial headline suggests.",
    "A possible market consequence is:",
    ["An interpretation", "Always a fact", "A guaranteed forecast"],
  ],
  [
    "Portfolio & risk",
    "Diversification reduces dependence on one investment, but cannot eliminate all risk. Funding is not investment profit.",
    "Diversification can:",
    ["Eliminate every risk", "Reduce concentration risk", "Guarantee returns"],
  ],
  [
    "Candlesticks & indicators",
    "A candle shows open, high, low and close in a period. Historical indicators summarize observations, not certain futures.",
    "A candle wick shows:",
    ["Price extremes", "Guaranteed next price", "Dividend payment"],
  ],
  [
    "Global markets & FX",
    "Investments can have currency exposure. A foreign-currency gain can be offset by an exchange-rate change.",
    "An overseas investment can involve:",
    ["No currency risk", "Currency risk", "Guaranteed FX gains"],
  ],
  [
    "Evidence & behavioral biases",
    "Record a hypothesis before a trade. A profitable outcome alone does not establish good reasoning.",
    "Good reflection focuses on:",
    ["Profit alone", "Trade frequency", "Evidence and process"],
  ],
] as const;
