"use client";
import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
export const glossary: Record<string, [string, string, string]> = {
  Stock: [
    "An ownership interest in a company.",
    "Owning 10 shares means you own a small part of the business.",
    "Common shareholders are residual claimants after creditors; voting and distribution rights depend on share class.",
  ],
  IPO: [
    "The first offering of company shares to the public.",
    "An IPO may offer shares at ₹100, but its listing price could be lower.",
    "Primary and secondary shares have different effects on capital raised and existing ownership; examine the prospectus.",
  ],
  "Market Cap": [
    "Share price multiplied by shares outstanding.",
    "10 million shares at ₹50 implies ₹500 million in market capitalization.",
    "Market capitalization measures equity value, not enterprise value; debt, cash and dilution matter.",
  ],
  "P/E Ratio": [
    "Share price divided by earnings per share.",
    "A ₹100 share with ₹5 earnings per share has a P/E of 20.",
    "Trailing and forward earnings differ. Negative earnings make conventional P/E comparisons unreliable.",
  ],
  EPS: [
    "Earnings per share: profit allocated per share.",
    "₹1 million earnings across 100,000 shares is ₹10 EPS.",
    "Basic and diluted EPS differ; extraordinary items and weighted average shares require care.",
  ],
  Dividend: [
    "A distribution a company may pay to shareholders.",
    "A ₹2 dividend per share gives ₹20 for 10 eligible shares.",
    "Ex-dividend dates, withholding, sustainability and total return matter. Dividends are not guaranteed.",
  ],
  Liquidity: [
    "How easily an asset can be traded without moving its price.",
    "A thinly traded share may require a worse price to sell quickly.",
    "Depth, spread, turnover and market impact describe different dimensions of liquidity.",
  ],
  Volume: [
    "The number of shares traded in a period.",
    "1,000 shares traded during a minute is that minute’s volume.",
    "Volume measures activity, not direction; data coverage and reporting conventions affect interpretation.",
  ],
  Volatility: [
    "The degree of variation in prices or returns.",
    "A share with large daily moves has higher observed volatility.",
    "Historical and implied volatility differ, and neither guarantees future risk.",
  ],
  Spread: [
    "The gap between the best quoted buy and sell prices.",
    "A bid of ₹99 and ask of ₹101 creates a ₹2 spread.",
    "Spread and market impact contribute to execution costs; the demo does not model either.",
  ],
  "Market Order": [
    "An order that prioritizes execution at the available price.",
    "A market buy may fill at a different price from the last trade.",
    "Real markets may produce multiple fills, slippage and rejection; demonstration full fills simplify these effects.",
  ],
  "Limit Order": [
    "An order with a maximum buy or minimum sell price.",
    "A buy limit at ₹100 does not permit a fill above ₹100.",
    "A touched price does not guarantee real execution due to queue priority and liquidity.",
  ],
  Diversification: [
    "Spreading exposure across investments.",
    "Holding several sectors reduces dependence on one company.",
    "Correlation, factor exposure and concentration matter; diversification does not eliminate systematic risk.",
  ],
  "Account equity": [
    "Cash plus marked investment assets.",
    "₹50,000 cash and ₹50,000 investments gives ₹100,000 equity.",
    "Marking methodology, valuation time, currency and liabilities determine comparability.",
  ],
  "Available cash": [
    "Cash that is not reserved for pending orders.",
    "A ₹10,000 pending buy reserve reduces spendable cash by ₹10,000 plus fees.",
    "Reservations prevent double spending but are not an execution or a realized investment loss.",
  ],
  "Realized P&L": [
    "Profit or loss from sold positions.",
    "Selling a ₹100 share at ₹110 yields ₹10 before costs.",
    "The accounting method and allocation of fees affect realized cost basis and P&L.",
  ],
  "Unrealized P&L": [
    "The difference between current value and the cost of held assets.",
    "A held share bought at ₹100 and marked at ₹110 has ₹10 unrealized gain.",
    "Marking is not cash received; liquidity, spread and taxes can change eventual outcomes.",
  ],
  "Investment return": [
    "Change in equity attributable to investments, excluding funding.",
    "Adding ₹10,000 to a wallet is funding, not investment profit.",
    "External cash flows require time-weighted or money-weighted analysis for meaningful multi-period returns.",
  ],
  "Market Index": [
    "A defined basket used to describe a market segment.",
    "The NIFTY 50 tracks a selected group of Indian equities.",
    "Weighting, reconstitution, dividends and survivorship affect comparisons.",
  ],
  ETF: [
    "A fund whose shares trade on an exchange.",
    "An ETF may hold a basket tracking an index.",
    "Expense ratios, tracking error, underlying liquidity and fund structure matter.",
  ],
  Revenue: [
    "Income from sales before expenses.",
    "Selling 100 items at ₹10 gives ₹1,000 revenue before costs.",
    "Revenue recognition, segment mix and one-time effects matter when comparing financial statements.",
  ],
  Earnings: [
    "Profit after relevant expenses.",
    "₹1,000 revenue minus ₹800 costs gives ₹200 profit in a simplified example.",
    "Operating, net and adjusted earnings measure different things; consult reported definitions.",
  ],
  "Balance Sheet": [
    "A statement of assets, liabilities and equity at a point in time.",
    "Assets are funded by liabilities and shareholder equity.",
    "Book values, fair-value measurements, liquidity and off-balance-sheet commitments require context.",
  ],
};
export default function Glossary({
  term,
  onLearn,
}: {
  term: string;
  onLearn?: () => void;
}) {
  const [open, setOpen] = useState(false),
    [depth, setDepth] = useState(0);
  const entry = glossary[term] ?? [
    `${term} is a learning metric shown in this workspace.`,
    `Review this metric alongside the account and session context.`,
    `No single metric can establish the quality of a decision.`,
  ];
  return (
    <span className="glossary">
      <button
        type="button"
        className="help"
        aria-label={`Explain ${term}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <HelpCircle size={13} />
      </button>
      {open && (
        <span className="glossary-popover" role="dialog" aria-label={term}>
          <button
            className="close"
            aria-label="Close explanation"
            onClick={() => setOpen(false)}
          >
            <X size={15} />
          </button>
          <strong>{term}</strong>
          <span className="chart-tabs">
            {["Beginner", "Intermediate", "Advanced"].map((d, i) => (
              <button
                key={d}
                className={depth === i ? "selected" : ""}
                onClick={() => setDepth(i)}
              >
                {d}
              </button>
            ))}
          </span>
          <span className="glossary-text">{entry[depth]}</span>
          {onLearn && (
            <button
              className="text-link"
              onClick={() => {
                setOpen(false);
                onLearn();
              }}
            >
              Explore the learning academy →
            </button>
          )}
        </span>
      )}
    </span>
  );
}
