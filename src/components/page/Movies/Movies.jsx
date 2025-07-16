import { useEffect, useState } from "react";
import { fetchMoviesTrending } from "../../../services/api";

export const Movies = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const getMovies = async () => {
      const data = await fetchMoviesTrending();
      console.log("Data", data);
      if (data) {
        setMovies(data.results);
      }
    };
    getMovies();
  }, []);

  console.log(movies);
  return (
    <>
      <h2>Movies page</h2>
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </>
  );
};
