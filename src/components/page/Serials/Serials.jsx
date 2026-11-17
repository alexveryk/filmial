import { useEffect, useState } from "react";
import { MediaList } from "../../MediaList/MediaList";
import { Button } from "../../Button/Button";
import { incrementPage } from "../../../services/incrementPage";
import { Spinner } from "../../Spiner/Spiner";
import { useGetPopularSeriesQuery } from "../../../services/tmdbApi";

export const Serials = () => {
  const [tvSeries, setTvSeries] = useState([]);
  const [page, setPage] = useState(1);
  const { currentData, isLoading, isFetching, isError, refetch } =
    useGetPopularSeriesQuery(page);

  useEffect(() => {
    if (!Array.isArray(currentData?.results)) return;
    setTvSeries((previous) => {
      const nextItems =
        page === 1
          ? currentData.results
          : [...previous, ...currentData.results];
      return nextItems.filter(
        (item, index, array) =>
          array.findIndex((candidate) => candidate.id === item.id) === index
      );
    });
  }, [currentData, page]);

  return (
    <>
      <h2 className="hidden">TV Serias Page</h2>
      {isLoading && tvSeries.length === 0 ? (
        <Spinner />
      ) : (
        <MediaList mediaItems={tvSeries} listType="serials" />
      )}
      {isError && (
        <div className="py-4 text-center text-sm text-rose-300" role="alert">
          Не вдалося завантажити серіали.
          <Button text="Спробувати ще" variant="secondary" onClick={refetch} />
        </div>
      )}
      {isFetching && tvSeries.length > 0 && <Spinner />}
      <div className="flex justify-center mb-4">
        {!isFetching && !isError && (
          <Button
            text={"Завантажити ще "}
            onClick={() => incrementPage(setPage)}
          />
        )}
      </div>
    </>
  );
};
