import { useEffect, useState } from "react";
import { MediaList } from "../../MediaList/MediaList";
import { fetchPopularSeries } from "../../../services/api";
import { Button } from "../../Button/Button";
import { incrementPage } from "../../../services/incrementPage";
import { Spinner } from "../../Spiner/Spiner";

export const Serials = () => {
  const [tvSeries, setTvSeries] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getTvSeries = async () => {
      setIsLoading(true);

      try {
        const data = await fetchPopularSeries(page);

        if (data?.results) {
          setTvSeries((prev) => {
            const nextItems = page === 1 ? data.results : [...prev, ...data.results];
            return nextItems.filter(
              (item, index, array) =>
                array.findIndex((candidate) => candidate.id === item.id) === index
            );
          });
        }
      } catch (error) {
        console.error(error);
        setTvSeries([]);
      } finally {
        setIsLoading(false);
      }
    };

    getTvSeries();
  }, [page]);

  return (
    <>
      <h2 className="hidden">TV Serias Page</h2>
      {isLoading ? <Spinner /> : <MediaList mediaItems={tvSeries} listType="serials" />}
      <div className="flex justify-center mb-4">
        {!isLoading && (
          <Button
            text={"??????????? ?? "}
            onClick={() => incrementPage(setPage)}
          />
        )}
      </div>
    </>
  );
};
