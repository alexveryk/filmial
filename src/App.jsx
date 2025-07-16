import { Route, Routes } from "react-router-dom";
import { Layout } from "./layouts/MainLayout";
import { Home } from "./components/page/Home/Home";
import { Movies } from "./components/page/Movies/Movies";
import { Serials } from "./components/page/Serials/Serials";

export const App = () => {
  return (
    <>
      <Layout>
        <section>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/serials" element={<Serials />} />
          </Routes>
        </section>
      </Layout>
    </>
  );
};
