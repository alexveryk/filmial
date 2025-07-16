import { Container } from "../components/Container/Container";
import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";
import { Main } from "../components/Main/Main";

export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Main>{children}</Main>
      <Footer />
    </div>
  );
};
