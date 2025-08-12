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
      <ul className="flex flex-wrap justify-between gap-[12px]">
        {movies.map((movie) => (
          <li key={movie.id}>
            <Link to={`${movie.id}`}>
              <div className="relative max-w-xs rounded-lg overflow-hidden shadow-lg">
                <img
                  className="w-full h-56 object-cover"
                  src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
                  alt="Movie Poster"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-4">
                  <h3 className="text-white text-xl font-bold">Назва фільму</h3>
                  <p className="text-gray-300 text-sm">Вихід: 12.08.2025</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};
