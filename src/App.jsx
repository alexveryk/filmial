import { Route, Routes } from "react-router-dom";
import { Layout } from "./layouts/MainLayout";
import { Home } from "./components/page/Home/Home";
import { Movies } from "./components/page/Movies/Movies";
import { Serials } from "./components/page/Serials/Serials";
import { MediaDetails } from "./components/MediaDetails/MediaDetails";

export const App = () => {
  return (
    <>
      <Layout>
        <section>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:movieId" element={<MediaDetails />} />
            <Route path="/serials" element={<Serials />} />
            <Route path="/serials/:seriesId" element={<MediaDetails />} />
          </Routes>
        </section>
      </Layout>
    </>
  );
};
