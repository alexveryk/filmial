import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMovie } from "../../services/api";
import { MediaList } from "../MediaList/MediaList";
import { Button } from "../Button/Button";

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const [result, setResult] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchResult = async () => {
      setIsLoading(true);
      const data = await searchMovie(query, page);

      setResult((prev) =>
        page === 1 ? data.results : [...prev, ...data.results]
      );

      setTotalPages(data.total_pages || 1);

      setIsLoading(false);
    };

    fetchResult();
  }, [query, page]);

  return (
    <div>
      <h1 className="mt-4 p-2 w-fit rounded-md bg-gray-800 text-white font-semibold">
        Результат пошуку: {query}
      </h1>
      {console.log("Пошук ", result)}
      <MediaList mediaItems={result} />
      <div className="flex justify-center mb-4">
        {page < totalPages && (
          <Button
            text={"Завантажити ще"}
            onClick={() => setPage((prev) => prev + 1)}
          />
        )}
      </div>
    </div>
  );
};
