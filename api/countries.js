// Vercel Serverless Function: loads country data from REST Countries v5.
// It runs on the server, so REST_COUNTRIES_API_KEY never reaches the browser.
//
// GET /api/countries            -> all countries
// GET /api/countries?name=egypt -> one country

const BASE = "https://api.restcountries.com/countries/v5";
// only the fields the components use
const FIELDS = [
  "names.common",
  "names.official",
  "flag.url_svg",
  "flag.description",
  "population",
  "capitals",
  "region",
  "subregion",
  "tlds",
  "currencies",
  "languages",
].join(",");
const PAGE_SIZE = 100; // max page size on the free plan
const ONE_DAY = 60 * 60 * 24; // seconds

let cache = null; // reused while the function instance stays warm

class ApiError extends Error {
  constructor(status, code) {
    super(`REST Countries request failed: ${status} ${code}`);
    this.status = status;
  }
}

async function fetchPage(offset, apiKey, canRetry = true) {
  const url = `${BASE}?limit=${PAGE_SIZE}&offset=${offset}&response_fields=${FIELDS}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  // a 429 has a plain-text body, so handle it before parsing JSON
  if (response.status === 429) {
    if (!canRetry) throw new ApiError(429, "rate limited");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return fetchPage(offset, apiKey, false);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.data?.objects) {
    throw new ApiError(response.status, body?.errors?.[0]?.code ?? "unknown");
  }
  return body.data;
}

// v5 record -> the shape used by the components (same as the old v3.1 API)
function toAppShape(country) {
  return {
    name: {
      common: country.names.common,
      official: country.names.official,
    },
    flags: {
      svg: country.flag?.url_svg,
      alt: country.flag?.description,
    },
    population: country.population,
    region: country.region,
    subregion: country.subregion,
    capital: (country.capitals ?? []).map((capital) => capital.name),
    tld: country.tlds ?? [],
    currencies: Object.fromEntries(
      (country.currencies ?? []).map(({ code, name, symbol }) => [
        code,
        { name, symbol },
      ]),
    ),
    languages: Object.fromEntries(
      (country.languages ?? []).map((language) => [
        language.iso639_3 || language.name,
        language.name,
      ]),
    ),
  };
}

async function loadAllCountries(apiKey) {
  const records = [];
  let more = true;
  while (more) {
    const data = await fetchPage(records.length, apiKey);
    records.push(...data.objects);
    more = data.meta?.more && data.objects.length > 0;
  }
  // a few disputed territories have no flag image, so their cards would be broken
  return records.filter((country) => country.flag?.url_svg).map(toAppShape);
}

function getAllCountries(apiKey) {
  if (!cache || Date.now() > cache.expiresAt) {
    const promise = loadAllCountries(apiKey);
    cache = { promise, expiresAt: Date.now() + ONE_DAY * 1000 };
    // don't keep a failed request in the cache
    promise.catch(() => (cache = null));
  }
  return cache.promise;
}

export default async function handler(req, res) {
  const apiKey = process.env.REST_COUNTRIES_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ message: "REST_COUNTRIES_API_KEY is not set on the server." });
  }

  try {
    let result = await getAllCountries(apiKey);

    const { name } = req.query;
    if (name) {
      const wanted = String(name).toLowerCase();
      result = result.find((country) =>
        [country.name.common, country.name.official].some(
          (value) => value.toLowerCase() === wanted,
        ),
      );
      if (!result) {
        return res.status(404).json({ message: "Country not found" });
      }
    }

    // the REST Countries terms allow caching for up to three days
    res.setHeader(
      "Cache-Control",
      `s-maxage=${ONE_DAY}, stale-while-revalidate=${ONE_DAY}`,
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    return res
      .status(error.status === 429 ? 429 : 502)
      .json({ message: "Could not load countries data." });
  }
}
