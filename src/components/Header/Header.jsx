import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Clapperboard, Menu, X } from "lucide-react";
import { Container } from "../Container/Container";
import { SearchBar } from "../SearchBar/SearchBar";

const links = [
  { to: "/", label: "Головна", end: true },
  { to: "/movies", label: "Фільми" },
  { to: "/serials", label: "Серіали" },
];

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "text-blue-300"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`;

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/95 text-white backdrop-blur-xl">
      <Container>
        <div className="flex min-h-[72px] items-center gap-5">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-white"
            aria-label="Filmial — на головну"
          >
            <Clapperboard className="text-blue-400" size={23} />
            <span>
              Film<span className="text-blue-400">ial</span>
            </span>
          </Link>

          <nav aria-label="Головна навігація" className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={navLinkClass}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <SearchBar className="ml-auto hidden md:block" />

          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-200 transition-colors hover:bg-slate-800 md:hidden"
            aria-label={isMobileMenuOpen ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-slate-800 py-4 md:hidden">
            <nav aria-label="Мобільна навігація" className="mb-4 grid gap-1">
              {links.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={closeMobileMenu}
                  className={navLinkClass}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <SearchBar
              className="max-w-none"
              onAction={closeMobileMenu}
            />
          </div>
        )}
      </Container>
    </header>
  );
};
