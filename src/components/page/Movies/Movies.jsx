import { useEffect, useState } from "react";
import { fetchMoviesTrending } from "../../../services/api";
import { Link } from "react-router-dom";
import { MediaCard } from "../../MediaCard/MediaCard";

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
      <h2 className="hidden">Movies page</h2>
      <ul className="flex flex-wrap justify-between gap-[12px] p-4">
        {movies.map((movie) => (
          <li key={movie.id}>
            <Link to={`${movie.id}`}>
             <MediaCard items={movie}/>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};
