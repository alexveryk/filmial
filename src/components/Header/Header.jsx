import React, { useState } from "react";
import { Container } from "../Container/Container";
import { NavLink } from "react-router-dom";
import { AlignJustify, SquareX } from "lucide-react";

export const Header = () => {
  const [istoggleMobileMenu, setIsToggleMobileMenu] = useState(false);

  const isActiveLink = ({ isActive }) =>
    isActive
      ? " text-blue-300 font-semibold underline underline-offset-8 decoration-blue-300"
      : " text-white font-semibold  hover:text-blue-300 hover:underline hover:underline-offset-8 hover:decoration-blue-300  transition";

  const isMobileActiveLink = ({ isActive }) =>
    isActive
      ? "p-4 bg-white text-gray-800 font-semibold"
      : "p-4 hover:bg-white hover:text-gray-800 font-semibold ";

  const toggleMobileMenu = () => {
    setIsToggleMobileMenu((prev) => !prev);
  };

  return (
    <header className="bg-gray-800 text-white ">
      {console.log(istoggleMobileMenu)}
      <Container>
        <div className="flex items-center gap-12 py-2 ">
          <h1 className="text-xl font-semibold ">Filmial</h1>
          <nav className="hidden md:flex gap-[12px] text-base py-2 ">
            <NavLink className={isActiveLink} to="/">
              Головна
            </NavLink>
            <NavLink className={isActiveLink} to="/movies">
              Фільми
            </NavLink>
            <NavLink className={isActiveLink} to="/serials">
              Серіали
            </NavLink>
          </nav>

          {/* Mobile menu */}
          <div className="md:hidden" onClick={toggleMobileMenu}>
            {!istoggleMobileMenu && <AlignJustify size={32} />}
          </div>
          {istoggleMobileMenu && (
            <Container>
              <h2 className="fixed top-4 left-8  z-51 text-xl font-semibold p-1 border-2 border-white rounded-sm">
                Filmial
              </h2>
              <div className="fixed top-0 left-0 w-screen h-screen bg-gray-800  z-50 flex  flex-col text-2xl p-4 gap-4">
                <div className="flex justify-end" onClick={toggleMobileMenu}>
                  <SquareX size={32} />
                </div>
                <NavLink
                  className={isMobileActiveLink}
                  onClick={istoggleMobileMenu}
                  to="/">
                  Головна
                </NavLink>
                <NavLink
                  className={isMobileActiveLink}
                  onClick={istoggleMobileMenu}
                  to="/movies">
                  Фільми
                </NavLink>
                <NavLink
                  className={isMobileActiveLink}
                  onClick={istoggleMobileMenu}
                  to="/serials">
                  Серіали
                </NavLink>
              </div>
            </Container>
          )}
        </div>
      </Container>
    </header>
  );
};
