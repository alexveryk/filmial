import { Heart } from "lucide-react";
import { Container } from "../Container/Container";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-slate-800 bg-slate-950 text-slate-400">
      <Container>
        <div className="flex flex-col items-center justify-between gap-3 py-6 text-sm sm:flex-row">
          <p className="text-center">
            &copy; {year} Filmial. Всі права захищені.
          </p>
          <p className="flex items-center gap-2">
            Зроблено з
            <Heart
              size={15}
              className="fill-rose-500 text-rose-500"
              aria-label="любов'ю"
            />
            <a
              href="https://github.com/alexveryk"
              className="font-medium text-slate-200 underline decoration-slate-600 underline-offset-4 transition-colors hover:text-blue-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              veryk.ov
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
};
