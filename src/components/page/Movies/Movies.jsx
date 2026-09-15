import { useEffect, useState } from "react";
import { fetchMoviesTrending } from "../../../services/api";

import { MediaList } from "../../MediaList/MediaList";
import { Button } from "../../Button/Button";
import { incrementPage } from "../../../services/incrementPage";
import { Spinner } from "../../Spiner/Spiner";

export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getMovies = async () => {
      setIsLoading(true);

      try {
        const data = await fetchMoviesTrending(page);

        if (data?.results) {
          setMovies((prev) => {
            const nextItems = page === 1 ? data.results : [...prev, ...data.results];
            return nextItems.filter(
              (item, index, array) =>
                array.findIndex((candidate) => candidate.id === item.id) === index
            );
          });
        }
      } catch (error) {
        console.error(error);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    getMovies();
  }, [page]);

  return (
    <>
      <h2 className="hidden">Movies page</h2>
      {isLoading ? <Spinner /> : <MediaList mediaItems={movies} listType="movies" />}
      <div className="flex justify-center mb-4">
        {!isLoading && (
          <Button
            text={"??????????? ??"}
            onClick={() => incrementPage(setPage)}
          />
        )}
      </div>
    </>
  );
};
