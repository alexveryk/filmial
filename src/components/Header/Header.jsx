import React from "react";
import { Container } from "../Container/Container";
import { Link, Links } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-blue-600 text-white ">
      <Container>
        <div className="">
          <h1 className="text-xl font-semibold p-4">Filmial</h1>
          <nav>
            <Link to="/">Головна</Link>
            <Link to="/movies">Фільми</Link>
            <Link to="/serials">Серіали</Link>
          </nav>
        </div>
      </Container>
    </header>
  );
};
