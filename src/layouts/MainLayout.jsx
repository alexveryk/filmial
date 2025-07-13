import { Container } from "../components/Container/Container";
import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";



export const Layout = ({ children }) => {
  return (

    <div className="flex flex-col min-h-screen">

      <Header />
      <Container className="flex-grow">
        <main className="h-full">{children}</main>
      </Container>
      <Footer />

    </div>
  );
};

