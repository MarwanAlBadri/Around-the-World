import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NoPage from "./pages/NoPage";
import Layout from "./pages/Layout";
import CountryPage from "./pages/CountryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<HomePage/>} />
          <Route path=":country" element={<CountryPage/>} />
          <Route path="*" element={<NoPage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
