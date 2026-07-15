export const config = { runtime: 'edge' };

const API_KEY = "d9bdbupr01qmk4glb9g0d9bdbupr01qmk4glb9gg";
const SYMBOLS = ["REGN","VRTX","MRNA","BMRN","CRSP","NTLA","BEAM","RARE","ALNY","IONS","SRPT","RCKT","ACAD","PTGX","KYMR","IOVA","MNPR","REPL"];

export default async function handler() {
  try {
    const results = await Promise.all(
      SYMBOLS.map(async (sym) => {
        try {
          const url  = `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${API_KEY}`;
          const res  = await fetch(url);
          const json = await res.json();
          if (!json.c || json.c === 0) return { sym, price: "—", pct: "—", up: null };
          const up = json.d >= 0;
          return { sym, price: `$${json.c.toFixed(2)}`, pct: `${up ? "+" : ""}${json.dp.toFixed(2)}%`, up };
        } catch {
          return { sym, price: "—", pct: "—", up: null };
        }
      })
    );
    return new Response(JSON.stringify({ tickers: results }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
