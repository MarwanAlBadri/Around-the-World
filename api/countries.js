// Vercel Serverless Function: fetches country data from REST Countries on the
// server. REST Countries now redirects /v3.1/all to a file host, which can fail
// in the browser (CORS) and may ignore the `fields` filter, so we fetch it here,
// trim the fields, and cache the result on Vercel's edge.
const FIELDS = [
  "name", "flags", "population", "capital", "region",
  "subregion", "tld", "currencies", "languages",
];
const SOURCE = `https://restcountries.com/v3.1/all?fields=${FIELDS.join(",")}`;

let cache = null;

// The response may be a plain array, or wrapped in an object
// (e.g. { countries: [...] } or { "EG": {...}, ... }).
function toArray(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    const firstArray = Object.values(parsed).find(Array.isArray);
    if (firstArray) return firstArray;
    const values = Object.values(parsed);
    if (values.length && values.every((v) => v && typeof v === "object" && v.name)) {
      return values;
    }
  }
  return null;
} // reused while the function instance stays warm

async function getAllCountries() {
  if (cache) return cache;
  const response = await fetch(SOURCE, { redirect: "follow" });
  if (!response.ok) throw new Error(`REST Countries responded ${response.status}`);
  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`REST Countries returned non-JSON: ${text.slice(0, 120)}`);
  }
  const data = toArray(parsed);
  if (!data) {
    throw new Error(`Unexpected REST Countries response: ${text.slice(0, 120)}`);
  }
  cache = data.map((c) =>
    Object.fromEntries(FIELDS.map((f) => [f, c[f]]))
  );
  return cache;
}

export default async function handler(req, res) {
  if (req.query.debug === "1") {
    const path = String(req.query.path || "");
    const host = String(req.query.host || "restcountries.com");
    if (!/^([a-z0-9-]+\.)?restcountries\.com$/.test(host)) return res.status(400).end();
    const target = path.startsWith("/") ? `https://${host}${path}` : SOURCE;
    const r = await fetch(target, { redirect: "follow" });
    let t = await r.text();
    if (req.query.strip === "1") {
      t = t.replace(/<(script|style|head)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    }
    if (req.query.links === "1") {
      t = [...new Set([...t.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))].filter((h) => h.includes("docs")).join("\n");
    }
    const from = Number(req.query.from) || 0;
    t = t.slice(from);
    return res.status(200).json({ status: r.status, url: r.url, length: t.length, head: t.slice(0, Number(req.query.n) || 1500) });
  }
  try {
    const countries = await getAllCountries();
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");

    const { name } = req.query;
    if (!name) return res.status(200).json(countries);

    const wanted = String(name).toLowerCase();
    const match =
      countries.find((c) => c.name?.common?.toLowerCase() === wanted) ||
      countries.find((c) => c.name?.official?.toLowerCase() === wanted) ||
      countries.find((c) => c.name?.common?.toLowerCase().includes(wanted));

    if (!match) return res.status(404).json({ message: "Country not found" });
    return res.status(200).json(match);
  } catch (error) {
    return res.status(502).json({ message: error.message });
  }
}
