// Vercel Serverless Function — loads country data from REST Countries v5.
//
// REST Countries retired its old v1–v4 endpoints (they now return an error)
// and v5 requires an API key. This function:
//   1. calls v5 on the server with the secret RESTCOUNTRIES_API_KEY,
//   2. converts the v5 shape into the shape the React app already uses,
//   3. caches the result on Vercel's edge for 24h (so we use very few requests).
//
// GET /api/countries            -> all countries
// GET /api/countries?name=egypt -> one country

const BASE = "https://api.restcountries.com/countries/v5";
// drop the heavy branches we never use (documented example in the v5 docs)
const OMIT = "names.translations,leaders";
const PAGE = 100; // max page size on the free plan

let cache = null; // reused while the function instance stays warm

// v5 record -> the shape used by the components (same as the old v3.1 API)
function toAppShape(c) {
  return {
    name: {
      common: c.names?.common,
      official: c.names?.official,
      nativeName: c.names?.native,
    },
    flags: { svg: c.flag?.url_svg, png: c.flag?.url_png, alt: c.flag?.description },
    population: c.population,
    region: c.region,
    subregion: c.subregion,
    capital: (c.capitals || []).map((cap) => cap.name),
    tld: c.tlds || [],
    currencies: Object.fromEntries(
      (c.currencies || []).map((cur) => [cur.code, { name: cur.name, symbol: cur.symbol }])
    ),
    languages: Object.fromEntries(
      (c.languages || []).map((lang) => [lang.iso639_3 || lang.name, lang.name])
    ),
  };
}

async function fetchPage(offset, apiKey) {
  const url = `${BASE}?limit=${PAGE}&offset=${offset}&response_fields_omit=${OMIT}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.data?.objects) {
    const reason = body?.errors?.[0]?.message || `status ${response.status}`;
    throw new Error(`REST Countries error: ${reason}`);
  }
  return body.data;
}

async function getAllCountries(apiKey) {
  if (cache) return cache;
  const all = [];
  let offset = 0;
  // follow pagination until the API says there are no more records
  for (let i = 0; i < 10; i++) {
    const data = await fetchPage(offset, apiKey);
    all.push(...data.objects);
    const { total, more } = data.meta || {};
    offset += PAGE;
    if (!more || (total && offset >= total)) break;
  }
  cache = all
    .map(toAppShape)
    .sort((a, b) => (a.name.common || "").localeCompare(b.name.common || ""));
  return cache;
}

export default async function handler(req, res) {
  const apiKey = process.env.RESTCOUNTRIES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "RESTCOUNTRIES_API_KEY is not set on the server." });
  }

  try {
    const countries = await getAllCountries(apiKey);
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");

    const { name } = req.query;
    if (!name) return res.status(200).json(countries);

    const wanted = String(name).toLowerCase();
    const match =
      countries.find((c) => c.name.common?.toLowerCase() === wanted) ||
      countries.find((c) => c.name.official?.toLowerCase() === wanted) ||
      countries.find((c) => c.name.common?.toLowerCase().includes(wanted));

    if (!match) return res.status(404).json({ message: "Country not found" });
    return res.status(200).json(match);
  } catch (error) {
    return res.status(502).json({ message: error.message });
  }
}
