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

The [REST Countries API](https://restcountries.com/) now redirects its `/v3.1/all` endpoint to a separate file host,
which can break requests made directly from the browser. To keep the live site reliable, the app uses a serverless function:

```
Browser  ──►  /api/countries  (Vercel function, cached 24h)  ──►  restcountries.com
```

- `/api/countries` → all countries (only the fields the app needs)
- `/api/countries?name=egypt` → a single country

In development (`npm run dev`) the app calls REST Countries directly.

## 🚀 Getting started

```bash
git clone https://github.com/MarwanAlBadri/Around-the-World.git
cd Around-the-World
npm install
npm run dev
```

No API key is required.

## 📂 Project structure

```
api/
  countries.js         # Serverless function – fetches & caches country data
src/
  useFetchData.js      # Custom hook: loading / error / data
  pages/
    HomePage.jsx       # Search + region filter + country grid
    CountryPage.jsx    # Country details
    Layout.jsx, NoPage.jsx
  components/
    CountryCard.jsx, CountryList.jsx, SearchInput.jsx, RegionMenu.jsx,
    ThemeSwitcher.jsx, Header.jsx, ShowMessage.jsx, EmptySearch.jsx
vercel.json            # SPA rewrites (keeps /api routes working)
```

## 👤 Author

**Marwan Al-Badri** — Junior Front-End Developer (React.js & TypeScript)

- GitHub: [@MarwanAlBadri](https://github.com/MarwanAlBadri)
