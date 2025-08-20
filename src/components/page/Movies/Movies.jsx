import { useEffect, useState } from "react";
import { fetchMoviesTrending } from "../../../services/api";

import { MediaList } from "../../MediaList/MediaList";
import { Button } from "../../Button/Button";
import { incrementPage } from "../../../services/incrementPage";
import { Spinner } from "../../Spiner/Spiner";

export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getMovies = async () => {
      const data = await fetchMoviesTrending(page);
      if (data) {
        setMovies((prev) => [...prev, ...data.results]);
        setIsLoading(true);
      }
    };
    getMovies();
  }, [page]);

  return (
    <>
      <h2 className="hidden">Movies page</h2>
      {console.log(movies)}
      {isLoading ? <MediaList mediaItems={movies} /> : <Spinner />}
      <div className="flex justify-center mb-4">
        {isLoading && (
          <Button
            text={"Завантажити ще"}
            onClick={() => incrementPage(setPage)}
          />
        )}
      </div>
    </>
  );
};
