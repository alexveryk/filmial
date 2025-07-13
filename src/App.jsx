
import { Container } from "./components/Container/Container";
import { Layout } from "./layouts/MainLayout";



export const App = () => {
  return (
    <Layout>
      <Container>
        <h2 className="text-2xl font-bold text-center mt-8">
          Welcome to my React Project
        </h2>
        <p className="mt-4 text-center">
          This is a basic template using React and Tailwind CSS.
        </p>
      </Container>
    </Layout>
  );
}

