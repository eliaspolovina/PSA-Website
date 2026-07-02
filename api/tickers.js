export const config = { runtime: 'edge' };

const API_KEY = "95XzbYI2nbs2ASsUWoSJglFyMtpGzkSE";
const SYMBOLS = ["REGN","VRTX","MRNA","BMRN","BLUE","CRSP","EDIT","NTLA","BEAM","RARE","FATE","SANA","ALNY","IONS","SRPT","RCKT","ACAD","PTGX","KYMR"];

export default async function handler() {
  const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${SYMBOLS.join(",")}&apiKey=${API_KEY}`;
  const res  = await fetch(url);
  const json = await res.json();

  const results = (json.tickers ?? []).map(t => {
    const close = t.day?.c ?? t.prevDay?.c ?? null;
    const open  = t.day?.o ?? t.prevDay?.o ?? null;
    const chg   = close !== null && open !== null ? close - open : null;
    const pct   = chg !== null && open ? (chg / open) * 100 : null;
    return {
      sym:   t.ticker,
      price: close !== null ? `$${close.toFixed(2)}` : "—",
      pct:   pct   !== null ? `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%` : "—",
      up:    chg   !== null ? chg >= 0 : null,
    };
  });

  return new Response(JSON.stringify({ tickers: results }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
