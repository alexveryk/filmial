import { Container } from "../Container/Container";

export const Main = ({ children }) => {
  return (
    <main className="flex-grow">
      <Container>{children}</Container>
    </main>
  );
};
