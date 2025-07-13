import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";



export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

