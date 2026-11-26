# 🌍 Around the World

A responsive React app to explore every country in the world — search by name, filter by region,
and open a detail page for any country. Includes a light / dark theme.

**🔗 Live demo:** <https://around-the-world-livid.vercel.app>

## ✨ Features

- Grid of all countries with flag, population, region and capital
- Instant search by country name
- Filter by region (Africa, Americas, Asia, Europe, Oceania)
- Country detail page: population, region, sub-region, capital, top-level domain, currencies, languages
- Client-side routing with React Router (`/` and `/:country`)
- Light / dark mode switcher
- Loading, error and "no results" states
- Reusable components and a custom `useFetchData` hook

## 🛠 Tech stack

React 19 · Vite · Tailwind CSS v4 · React Router v7 · React Select · REST Countries API · Vercel Serverless Functions

## 🧠 How the data is loaded

The data comes from [REST Countries](https://restcountries.com/). Its old v1–v4 endpoints were shut down,
and the new **v5 API requires an API key**, so the key must never be exposed in the browser.
The app therefore uses a serverless function:

```
Browser  ──►  /api/countries  (Vercel function, holds RESTCOUNTRIES_API_KEY, cached 24h)  ──►  api.restcountries.com/countries/v5
```

- `/api/countries` → all countries
- `/api/countries?name=egypt` → a single country

The function also converts the v5 response into the simple shape the components use
(`name`, `flags`, `population`, `region`, `capital`, `currencies`, `languages`, …).
During `npm run dev`, a small Vite plugin serves the same function locally.

## 🚀 Getting started

```bash
git clone https://github.com/MarwanAlBadri/Around-the-World.git
cd Around-the-World
npm install
cp .env.example .env      # then add your REST Countries API key
npm run dev
```

Get a free key at <https://restcountries.com/sign-up>.

## ☁️ Deploying to Vercel

1. Import the repo into Vercel (framework preset: **Vite**).
2. In **Project → Settings → Environment Variables**, add `RESTCOUNTRIES_API_KEY`.
3. Redeploy.

## 📂 Project structure

```
api/
  countries.js         # Serverless function – REST Countries v5, mapping & caching
src/
  useFetchData.js      # Custom hook: loading / error / data
  pages/
    HomePage.jsx       # Search + region filter + country grid
    CountryPage.jsx    # Country details
    Layout.jsx, NoPage.jsx
  components/
    CountryCard.jsx, CountryList.jsx, SearchInput.jsx, RegionMenu.jsx,
    ThemeSwitcher.jsx, Header.jsx, ShowMessage.jsx, EmptySearch.jsx
vite.config.js         # Includes a dev plugin that serves /api locally
vercel.json            # SPA rewrites (keeps /api routes working)
```

## 👤 Author

**Marwan Al-Badri** — Junior Front-End Developer (React.js & TypeScript)

- GitHub: [@MarwanAlBadri](https://github.com/MarwanAlBadri)
