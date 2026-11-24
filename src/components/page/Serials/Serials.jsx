import { useEffect, useState } from "react";
import { toast } from "sonner";
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
    if (!isError) return;
    toast.error("Не вдалося завантажити серіали.", {
      action: {
        label: "Спробувати ще",
        onClick: refetch,
      },
    });
  }, [isError, refetch]);

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
