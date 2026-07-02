import type { APIRoute } from "astro";

const API_KEY = "95XzbYI2nbs2ASsUWoSJglFyMtpGzkSE";

const SYMBOLS = [
  "REGN","VRTX","MRNA","BMRN","BLUE","CRSP","EDIT",
  "NTLA","BEAM","RARE","FATE","SANA","ALNY","IONS",
  "SRPT","RCKT","ACAD","PTGX","KYMR"
];

export const GET: APIRoute = async () => {
  try {
    const syms = SYMBOLS.join(",");
    const url  = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${syms}&apiKey=${API_KEY}`;
    const res  = await fetch(url);
    const json = await res.json();

    if (!json.tickers) {
      return new Response(JSON.stringify({ error: "No data returned" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = json.tickers.map((t: any) => {
      const close = t.day?.c ?? t.prevDay?.c ?? null;
      const open  = t.day?.o ?? t.prevDay?.o ?? null;
      const chg   = close !== null && open !== null ? close - open : null;
      const pct   = chg !== null && open ? (chg / open) * 100 : null;
      return {
        sym:   t.ticker,
        price: close !== null ? `$${close.toFixed(2)}` : "—",
        change: chg !== null ? `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}` : "—",
        pct:    pct !== null ? `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%` : "—",
        up:     chg !== null ? chg >= 0 : null,
      };
    });

    return new Response(JSON.stringify({ tickers: results }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Fetch failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
