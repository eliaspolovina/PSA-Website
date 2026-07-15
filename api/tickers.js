export const config = { runtime: 'edge' };

const API_KEY = "95XzbYI2nbs2ASsUWoSJglFyMtpGzkSE";
const SYMBOLS = ["REGN","VRTX","MRNA","BMRN","CRSP","NTLA","BEAM","RARE","ALNY","IONS","SRPT","RCKT","ACAD","PTGX","KYMR","IOVA","MNPR","REPL"];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default async function handler() {
  try {
    const results = [];
    for (const sym of SYMBOLS) {
      try {
        const url  = `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${API_KEY}`;
        const res  = await fetch(url);
        const json = await res.json();
        const r    = json.results?.[0];
        if (r) {
          const chg = r.c - r.o;
          const pct = (chg / r.o) * 100;
          results.push({ sym, price: `$${r.c.toFixed(2)}`, pct: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`, up: chg >= 0 });
        } else {
          results.push({ sym, price: "—", pct: "—", up: null });
        }
      } catch {
        results.push({ sym, price: "—", pct: "—", up: null });
      }
      await sleep(300);
    }
    return new Response(JSON.stringify({ tickers: results }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "s-maxage=300" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
