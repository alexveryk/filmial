import React from "react";
import { Container } from "../Container/Container";
import { NavLink } from "react-router-dom";

export const Header = () => {
  const isActiveLink = ({ isActive }) =>
    isActive
      ? "p-2 text-blue-300 font-semibold underline underline-offset-8 decoration-blue-300"
      : "p-2 text-white font-semibold  hover:text-blue-300 hover:underline hover:underline-offset-8 hover:decoration-blue-300  transition";

  return (
    <header className="bg-gray-800 text-white ">
      <Container>
        <div className="">
          <h1 className="text-xl font-semibold p-4">Filmial</h1>
          <nav className="flex gap-[12px] text-base">
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
        </div>
      </Container>
    </header>
  );
};
