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

React 19 · Vite · Tailwind CSS v4 · React Router v7 · React Select · Static JSON data (lazy-loaded)

## 🧠 How the data is loaded

The app used to call the [REST Countries](https://restcountries.com/) API, but its free v1–v4 endpoints were shut down
and the new version requires a paid/registered API key. To keep the project **free, fast and reliable**, the data now ships with the app:

- `src/data/countries.json` — 250 countries (names, native names, region, sub-region, capital, population, TLD, currencies, languages).
  It is **lazy-loaded** with a dynamic `import()`, so it's split into its own chunk (~23 KB gzipped).
- `public/flags/*.svg` — an SVG flag for every country, served as static files.

No API key, no network dependency, no rate limits.

## 🚀 Getting started

```bash
git clone https://github.com/MarwanAlBadri/Around-the-World.git
cd Around-the-World
npm install
npm run dev
```

## 📚 Data credits

- Country data & flags: [mledoze/countries](https://github.com/mledoze/countries) (ODbL)
- Population figures (≈2020 estimates): [apilayer/restcountries](https://github.com/apilayer/restcountries) (MPL-2.0)

## 📂 Project structure

```
public/
  flags/               # 250 SVG flags
src/
  data/countries.json  # Bundled country data (lazy-loaded)
  useFetchData.js      # Custom hook: lazy-loads the data, loading / error states
  pages/
    HomePage.jsx       # Search + region filter + country grid
    CountryPage.jsx    # Country details
    Layout.jsx, NoPage.jsx
  components/
    CountryCard.jsx, CountryList.jsx, SearchInput.jsx, RegionMenu.jsx,
    ThemeSwitcher.jsx, Header.jsx, ShowMessage.jsx, EmptySearch.jsx
vercel.json            # SPA rewrites for client-side routing
```

## 👤 Author

**Marwan Al-Badri** — Junior Front-End Developer (React.js & TypeScript)

- GitHub: [@MarwanAlBadri](https://github.com/MarwanAlBadri)
