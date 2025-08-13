import { useEffect, useState } from "react";
import { fetchMoviesTrending } from "../../../services/api";

import { MediaList } from "../../MediaList/MediaList";

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
      <MediaList mediaItems={movies} />
    </>
  );
};
