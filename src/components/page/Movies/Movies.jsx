import { useEffect, useState } from "react";
import { fetchMoviesTrending } from "../../../services/api";
import { Link } from "react-router-dom";

export const Movies = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const getMovies = async () => {
      const data = await fetchMoviesTrending();
      if (data) {
        setMovies(data.results);
      }
    };
    getMovies();
  }, []);

  return (
    <>
      <h2>Movies page</h2>
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}><Link to={`${movie.id}`}>{movie.title}</Link></li>
        ))}
      </ul>
    </>
  );
};
