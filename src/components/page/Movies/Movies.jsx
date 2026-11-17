import { useEffect, useState } from "react";
import { Clapperboard } from "lucide-react";
import { MediaList } from "../../MediaList/MediaList";
import { Button } from "../../Button/Button";
import { incrementPage } from "../../../services/incrementPage";
import { Spinner } from "../../Spiner/Spiner";
import { useGetTrendingMoviesQuery } from "../../../services/tmdbApi";

export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const {
    currentData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetTrendingMoviesQuery(page);

  useEffect(() => {
    if (isError) {
      setError("Не вдалося завантажити фільми. Спробуйте ще раз.");
      return;
    }

    if (!Array.isArray(currentData?.results)) return;
    setError("");
    setMovies((previousMovies) => {
      const nextItems =
        page === 1
          ? currentData.results
          : [...previousMovies, ...currentData.results];

      return nextItems.filter(
        (item, index, array) =>
          array.findIndex((candidate) => candidate.id === item.id) === index
      );
    });
  }, [currentData, isError, page]);

  return (
    <section className="py-8 sm:py-10" aria-labelledby="movies-heading">
      <div className="mb-8 flex items-center justify-between gap-4 sm:mb-10">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            Відкрийте для себе
          </p>
          <h1
            id="movies-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Фільми
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Історії, які захочеться додати до свого списку перегляду.
          </p>
        </div>
        <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300 sm:flex">
          <Clapperboard size={25} aria-hidden="true" />
        </div>
      </div>

      {movies.length === 0 && isLoading && <Spinner />}

      {movies.length > 0 && (
        <MediaList mediaItems={movies} listType="movies" />
      )}

      {error && (
        <div
          className="my-8 flex flex-col items-center gap-4 rounded-2xl border border-rose-400/20 bg-rose-400/5 px-5 py-8 text-center"
          role="alert"
        >
          <p className="text-sm text-slate-300">{error}</p>
          <Button
            text="Спробувати ще"
            variant="secondary"
            onClick={refetch}
          />
        </div>
      )}

      {!isLoading && !error && movies.length === 0 && (
        <p className="py-12 text-center text-slate-400">
          Фільмів поки немає. Спробуйте оновити сторінку пізніше.
        </p>
      )}

      {isFetching && movies.length > 0 && <Spinner />}

      {!isFetching && !error && movies.length > 0 && (
        <div className="flex justify-center pb-4 pt-2">
          <Button
            text="Завантажити ще"
            disabled={isFetching}
            onClick={() => incrementPage(setPage)}
          />
        </div>
      )}
    </section>
  );
};
