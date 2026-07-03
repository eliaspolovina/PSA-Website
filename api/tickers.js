export const config = { runtime: 'edge' };

const API_KEY = "95XzbYI2nbs2ASsUWoSJglFyMtpGzkSE";
const SYMBOLS = ["REGN","VRTX","MRNA","BMRN","BLUE","CRSP","EDIT","NTLA","BEAM","RARE","FATE","SANA","ALNY","IONS","SRPT","RCKT","ACAD","PTGX","KYMR"];

export default async function handler() {
  try {
    const results = await Promise.all(
      SYMBOLS.map(async (sym) => {
        try {
          const url  = `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${API_KEY}`;
          const res  = await fetch(url);
          const json = await res.json();
          const r    = json.results?.[0];
          if (!r) return { sym, price: "—", pct: "—", up: null };
          const close = r.c;
          const open  = r.o;
          const chg   = close - open;
          const pct   = (chg / open) * 100;
          return {
            sym,
            price: `$${close.toFixed(2)}`,
            pct:   `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
            up:    chg >= 0,
          };
        } catch {
          return { sym, price: "—", pct: "—", up: null };
        }
      })
    );

    return new Response(JSON.stringify({ tickers: results }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Fetch failed" }), { status: 500 });
  }
}
