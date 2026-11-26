# 🌍 Around the World

A responsive React app to explore every country in the world — search by name, filter by region,
and open a detail page for any country. Includes a light / dark theme.

**🔗 Live demo:** <https://around-the-world-livid.vercel.app>

## ✨ Features

- Grid of all countries with flag, population, region and capital
- Search by country name (common or official)
- Filter by region (Africa, Americas, Asia, Europe, Oceania)
- Country detail page: population, region, sub-region, capital, top-level domain, currencies, languages
- Client-side routing with React Router (`/` and `/:country`)
- Light / dark mode switcher
- Loading, error and "no results" states
- Reusable components and a custom `useFetchData` hook

## 🛠 Tech stack

React 19 · Vite · Tailwind CSS v4 · React Router v7 · React Select · Vercel Serverless Functions · REST Countries API v5

## 🧠 How the data is loaded

The data comes from the [REST Countries](https://restcountries.com/) v5 API, which requires an API key.
To keep the key out of the browser, the app calls its own route and the server calls REST Countries:

- `GET /api/countries` returns all countries, and `GET /api/countries?name=egypt` returns one.
- `api/countries.js` adds the key, requests only the fields the app uses and caches the result for 24 hours.
- On Vercel it runs as a Serverless Function. During `npm run dev`, a small plugin in `vite.config.js` serves it.
  `npm run preview` does not serve this route.

## 🚀 Getting started

```bash
git clone https://github.com/MarwanAlBadri/Around-the-World.git
cd Around-the-World
npm install
```

[Get an API key](https://restcountries.com/sign-up), then create a `.env.local` file in the project root
(it is ignored by Git):

```
REST_COUNTRIES_API_KEY=your_api_key
```

```bash
npm run dev
```

To deploy on Vercel, add `REST_COUNTRIES_API_KEY` under **Settings → Environment Variables**.

## 📚 Data credits

- Country data & flags: [REST Countries](https://restcountries.com/)

## 📂 Project structure

```
api/
  countries.js         # Serverless Function that calls REST Countries
src/
  useFetchData.js      # Custom hook: fetches the data, loading / error states
  pages/
    HomePage.jsx       # Search + region filter + country grid
    CountryPage.jsx    # Country details
    Layout.jsx, NoPage.jsx
  components/
    CountryCard.jsx, CountryList.jsx, SearchInput.jsx, RegionMenu.jsx,
    ThemeSwitcher.jsx, Header.jsx, ShowMessage.jsx, EmptySearch.jsx
vite.config.js         # Vite setup + local /api route for development
vercel.json            # SPA rewrites for client-side routing
```

## 👤 Author

**Marwan Al-Badri** — Junior Front-End Developer (React.js & TypeScript)

- GitHub: [@MarwanAlBadri](https://github.com/MarwanAlBadri)
