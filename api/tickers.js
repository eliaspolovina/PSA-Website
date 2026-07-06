export const config = { runtime: 'edge' };

const API_KEY = "95XzbYI2nbs2ASsUWoSJglFyMtpGzkSE";
const SYMBOLS = ["REGN","VRTX","MRNA","BMRN","CRSP","NTLA","BEAM","RARE","ALNY","IONS","SRPT","RCKT","ACAD","PTGX","KYMR","IOVA","MNPR","REPL"];

export default async function handler() {
  try {
    const url  = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${getPreviousWeekday()}?adjusted=true&apiKey=${API_KEY}`;
    const res  = await fetch(url);
    const json = await res.json();

    const resultMap = {};
    for (const r of (json.results ?? [])) {
      if (SYMBOLS.includes(r.T)) {
        const chg = r.c - r.o;
        const pct = (chg / r.o) * 100;
        resultMap[r.T] = {
          sym:   r.T,
          price: `$${r.c.toFixed(2)}`,
          pct:   `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
          up:    chg >= 0,
        };
      }
    }

    const tickers = SYMBOLS.map(sym => resultMap[sym] ?? { sym, price: "—", pct: "—", up: null });

    return new Response(JSON.stringify({ tickers }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

function getPreviousWeekday() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  do { d.setUTCDate(d.getUTCDate() - 1); } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  return d.toISOString().split("T")[0];
}
