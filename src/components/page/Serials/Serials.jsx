import { useEffect, useState } from "react";
import { MediaList } from "../../MediaList/MediaList";
import { fetchPopularSeries } from "../../../services/api";
import { Button } from "../../Button/Button";
import { incrementPage } from "../../../services/incrementPage";
import { Spinner } from "../../Spiner/Spiner";

export const Serials = () => {
  const [TvSeries, setTvSeries] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getTvSeris = async () => {
      const data = await fetchPopularSeries(page);
      if (data) {
        setTvSeries((prev) => [...prev, ...data.results]);
        setIsLoading(true);
      }
    };

    getTvSeris();
  }, [page]);

  return (
    <>
      <h2 className="hidden">TV Serias Page</h2>
      {isLoading ? <MediaList mediaItems={TvSeries} /> : <Spinner />}
      <div className="flex justify-center mb-4">
        {isLoading && (
          <Button
            text={"Завантажити ще "}
            onClick={() => incrementPage(setPage)}
          />
        )}
      </div>
    </>
  );
};
