import { Container } from "../Container/Container";

export const Main = ({ children }) => {
  return (
    <main>
      <Container className="flex-grow">{children}</Container>
    </main>
  );
};
