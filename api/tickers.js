export const config = { runtime: 'edge' };

const API_KEY = "95XzbYI2nbs2ASsUWoSJglFyMtpGzkSE";

export default async function handler() {
  try {
    const date = getPreviousWeekday();
    const url  = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${date}?adjusted=true&apiKey=${API_KEY}`;
    const res  = await fetch(url);
    const json = await res.json();

    return new Response(JSON.stringify({
      debug_date: date,
      debug_status: json.status,
      debug_count: json.resultsCount,
      debug_error: json.error ?? null,
      results_sample: (json.results ?? []).slice(0, 3),
    }), {
      headers: { "Content-Type": "application/json" },
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
