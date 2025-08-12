import { Heart } from "lucide-react";
import { Container } from "../Container/Container";

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <Container>
        <div className="flex flex-wrap flex-row gap-4 justify-evenly py-4">
          <p className="text-center">
            &copy; 2025 Filmial. Всі права захищені.
          </p>
          <span className="flex items-center gap-2  ">
            <p className="flex gap-2 text-center">
              Зроблено з
              <Heart
                color="#ff0000"
                fill="#ff0000"
                strokeWidth={2}
                absoluteStrokeWidth
              />
              <a
                href="https://github.com/alexveryk"
                className="underline hover:text-green-600"
                target="_blank"
                rel="noopener noreferrer">
                veryk.ov
              </a>
            </p>
          </span>
        </div>
      </Container>
    </footer>
  );
};
