// Vercel Serverless Function: fetches country data from REST Countries on the
// server. REST Countries now redirects /v3.1/all to a file host, which can fail
// in the browser (CORS) and may ignore the `fields` filter, so we fetch it here,
// trim the fields, and cache the result on Vercel's edge.
const FIELDS = [
  "name", "flags", "population", "capital", "region",
  "subregion", "tld", "currencies", "languages",
];
const SOURCE = `https://restcountries.com/v3.1/all?fields=${FIELDS.join(",")}`;

let cache = null; // reused while the function instance stays warm

async function getAllCountries() {
  if (cache) return cache;
  const response = await fetch(SOURCE, { redirect: "follow" });
  if (!response.ok) throw new Error(`REST Countries responded ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Unexpected REST Countries response");
  cache = data.map((c) =>
    Object.fromEntries(FIELDS.map((f) => [f, c[f]]))
  );
  return cache;
}

export default async function handler(req, res) {
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
