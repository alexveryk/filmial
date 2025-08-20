import { Route, Routes } from "react-router-dom";
import { Layout } from "./layouts/MainLayout";
import { Home } from "./components/page/Home/Home";
import { Movies } from "./components/page/Movies/Movies";
import { Serials } from "./components/page/Serials/Serials";
import { MediaDetails } from "./components/MediaDetails/MediaDetails";
import { SearchResults } from "./components/SearchResults/SearchResults";

export const App = () => {
  return (
    <>
      <Layout>
        <section>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MediaDetails />} />
            <Route path="/serials" element={<Serials />} />
            <Route path="/serials/:id" element={<MediaDetails />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/search/:id" element={<MediaDetails />} />
          </Routes>
        </section>
      </Layout>
    </>
  );
};
