import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MediaList } from "../MediaList/MediaList";
import { Button } from "../Button/Button";
import { Spinner } from "../Spiner/Spiner";
import { useSearchMultiQuery } from "../../services/tmdbApi";

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const [result, setResult] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { currentData, isLoading, isFetching, isError } = useSearchMultiQuery(
    { query, page },
    { skip: !query },
  );

  useEffect(() => {
    setResult([]);
    setPage(1);
    setTotalPages(1);
  }, [query]);

  useEffect(() => {
    if (!currentData?.results) return;
    const mediaResults = currentData.results.filter((item) =>
      ["movie", "tv"].includes(item.media_type),
    );
    setResult((previous) =>
      page === 1 ? mediaResults : [...previous, ...mediaResults],
    );
    setTotalPages(currentData.total_pages || 1);
  }, [currentData, page]);

  return (
    <div>
      <h1 className="mt-4 mb-5 p-3 w-fit rounded-xl bg-slate-800/80 text-white font-semibold border border-slate-700 shadow-lg shadow-black/20">
        Результат пошуку:
        <span className="ml-2 text-green-400 font-medium">{query}</span>
      </h1>
      {isLoading || (isFetching && page === 1) ? (
        <Spinner />
      ) : (
        <div>
          {isError ? (
            <p className="py-8 text-center text-rose-300" role="alert">
              Не вдалося виконати пошук. Спробуйте ще раз.
            </p>
          ) : (
            <MediaList mediaItems={result} listType="search" />
          )}
          <div className="flex justify-center mb-4">
            {page < totalPages && !isError && (
              <Button
                text={"Завантажити ще"}
                disabled={isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
