"use client";
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
  UTCTimestamp,
} from "lightweight-charts";
import { sma, ema, rsi, macd } from "@/lib/indicators";
type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};
export default function Chart({ bars }: { bars: Bar[] }) {
  const ref = useRef<HTMLDivElement>(null),
    [kind, setKind] = useState("candles"),
    [count, setCount] = useState(0),
    [indicator, setIndicator] = useState("none"),
    [hover, setHover] = useState("");
  useEffect(() => {
    if (!ref.current) return;
    const source = count ? bars.slice(-count) : bars;
    const c = createChart(ref.current, {
      height: 310,
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#7a8796",
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: "#8795aa14" },
        horzLines: { color: "#8795aa14" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.12, bottom: 0.2 },
      },
      timeScale: { borderVisible: false },
    });
    const candlestick = c.addSeries(CandlestickSeries, {
      upColor: "#008b76",
      downColor: "#d36464",
      borderVisible: false,
      wickUpColor: "#008b76",
      wickDownColor: "#d36464",
      visible: kind === "candles",
    });
    candlestick.setData(
      source.map((b) => ({ ...b, time: b.time as UTCTimestamp })),
    );
    if (kind !== "candles") {
      const series =
        kind === "line"
          ? c.addSeries(LineSeries, { color: "#008b76", lineWidth: 2 })
          : c.addSeries(AreaSeries, {
              lineColor: "#008b76",
              topColor: "#008b7633",
              bottomColor: "#008b7600",
            });
      series.setData(
        source.map((b) => ({ time: b.time as UTCTimestamp, value: b.close })),
      );
    }
    if (indicator !== "none") {
      const closing = source.map((b) => b.close);
      const values =
        indicator === "sma"
          ? sma(closing, 5)
          : indicator === "ema"
            ? ema(closing, 5)
            : indicator === "rsi"
              ? rsi(closing)
              : macd(closing);
      const separate = indicator === "rsi" || indicator === "macd";
      c.addSeries(
        LineSeries,
        {
          color: "#d9a34a",
          lineWidth: 1,
          title: indicator.toUpperCase(),
          priceLineVisible: false,
        },
        separate ? 1 : 0,
      ).setData(
        values.flatMap((value, i) =>
          value === null
            ? []
            : [{ time: source[i].time as UTCTimestamp, value }],
        ),
      );
    }
    const volume = c.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      priceLineVisible: false,
      lastValueVisible: false,
    });
    volume
      .priceScale()
      .applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
    volume.setData(
      source.map((b) => ({
        time: b.time as UTCTimestamp,
        value: b.volume ?? 0,
        color: b.close >= b.open ? "#008b7630" : "#d3646430",
      })),
    );
    c.subscribeCrosshairMove((p) => {
      const b = p.seriesData.get(candlestick) as Bar | undefined;
      setHover(
        b
          ? `O ${b.open.toFixed(2)}  H ${b.high.toFixed(2)}  L ${b.low.toFixed(2)}  C ${b.close.toFixed(2)}`
          : "",
      );
    });
    c.timeScale().fitContent();
    return () => c.remove();
  }, [bars, kind, count, indicator]);
  return (
    <div>
      <div className="chart-controls">
        <div className="chart-tabs">
          {["candles", "line", "area"].map((k) => (
            <button
              key={k}
              className={kind === k ? "selected" : ""}
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
            >
              {k}
            </button>
          ))}
        </div>
        <select
          aria-label="Chart observations"
          value={count}
          onChange={(e) => {
            setCount(Number(e.target.value));
            setIndicator("none");
          }}
        >
          <option value={0}>All observations</option>
          <option value={20}>Last 20</option>
          <option value={10}>Last 10</option>
        </select>
        <select
          aria-label="Chart indicator"
          value={indicator}
          onChange={(e) => setIndicator(e.target.value)}
        >
          <option value="none">No indicator</option>
          <option value="sma">SMA 5</option>
          <option value="ema">EMA 5</option>
          <option disabled={count > 0 && count < 15} value="rsi">
            RSI 14
          </option>
          <option disabled={count > 0 && count < 26} value="macd">
            MACD 12 / 26
          </option>
        </select>
      </div>
      <div className="chart-ohlc">
        {hover || "Hover to inspect OHLC · drag to pan · scroll to zoom"}
      </div>
      <div
        className="financial-chart"
        style={{ height: 310, width: "100%", overflow: "hidden" }}
        ref={ref}
        aria-label="Interactive illustrative price and volume chart"
      />
    </div>
  );
}
