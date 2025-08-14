import { useEffect, useState } from "react";
import { MediaList } from "../../MediaList/MediaList";
import { fetchPopularSeries } from "../../../services/api";
import { Button } from "../../Button/Button";

export const Serials = () => {
  const [TvSeries, setTvSeries] = useState([]);

  useEffect(() => {
    const getTvSeris = async () => {
      const data = await fetchPopularSeries();
      if (data) {
        console.log("Save Serials", data);
        setTvSeries(data.results);
      }
    };

    getTvSeris();
  }, []);

  return (
    <>
      <h2 className="hidden">TV Serias Page</h2>
      <MediaList mediaItems={TvSeries} />
      <div className="flex justify-center mb-4">
        <Button text={"Завантажити ще "} />
      </div>
    </>
  );
};
