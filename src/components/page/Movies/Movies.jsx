import { useEffect, useRef, useState } from "react";
import { fetchMoviesTrending } from "../../../services/api";

import { MediaList } from "../../MediaList/MediaList";
import { Button } from "../../Button/Button";
import { incrementPage } from "../../../services/incrementPage";

export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const getMovies = async () => {
      const data = await fetchMoviesTrending(page);
      if (data) {
        setMovies((prev) => [...prev, ...data.results]);
      }
    };
    getMovies();
  }, [page]);

  return (
    <>
      <h2 className="hidden">Movies page</h2>
      <MediaList mediaItems={movies} />
      <div className="flex justify-center mb-4">
        <Button
          text={"Завантажити ще "}
          onClick={() => incrementPage(setPage)}
        />
      </div>
    </>
  );
};
