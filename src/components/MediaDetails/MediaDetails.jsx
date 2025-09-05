import { useLocation, useParams } from "react-router-dom";
import { fetchMovieDetails, fetchTvSeriesDetails } from "../../services/api";
import { useEffect, useState } from "react";

export const MediaDetails = () => {
  const [MediaDetails, setMediaDetails] = useState([]);

  const { id } = useParams();
  const location = useLocation();

  const pathname = location.pathname.split("/")[1];

  useEffect(() => {
    const getMovieDetails = async () => {
      const data = await fetchMovieDetails(id);
      if (data) {
        setMediaDetails(data);
      }
    };

    const getTvSeriesDetails = async () => {
      const data = await fetchTvSeriesDetails(id);
      if (data) {
        setMediaDetails(data);
      }
    };

    if (pathname === "serials") {
      getTvSeriesDetails();
    }
    if (pathname === "movies") {
      getMovieDetails();
    }
  }, [id, pathname]);

  const valuesToString = (values) => {
    if (!values) {
      return "Порожньо, як у холодильнику після зарплати";
    }

    return values.map((value) => value.name).join(", ");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {console.log(pathname)}
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-lg"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original/${MediaDetails.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative grid md:grid-cols-3 gap-6 p-6 text-white">
          <div className="col-span-1 flex justify-center">
            <img
              className="rounded-xl shadow-lg max-h-[450px] object-cover"
              src={`https://image.tmdb.org/t/p/original/${MediaDetails.poster_path}`}
              alt={MediaDetails.title}
            />
          </div>

          <div className="col-span-2 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{MediaDetails.title}</h1>
              <p className="italic text-gray-300 mb-4">
                {MediaDetails.tagline}
              </p>
              <p className="text-gray-200 leading-relaxed mb-4">
                {MediaDetails.overview || "Опис відсутній"}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <span className="px-3 py-2 bg-yellow-400 text-black rounded-full font-semibold flex items-center gap-2">
                <img
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg"
                  alt="TMDB Logo"
                  className="h-5"
                />
                {MediaDetails.vote_average?.toFixed(1)}/10
              </span>

              <span className="px-3 py-2 bg-gray-700 text-white rounded-full text-sm font-semibold">
                📅 {MediaDetails.release_date}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-800  p-6 rounded-2xl shadow-md mb-4">
        <h2 className="text-2xl font-semibold text-gray-300  mb-4">Деталі</h2>
        <ul className="grid md:grid-cols-2 gap-y-3 gap-x-8 text-gray-300 ">
          <li>
            <strong>Мова оригіналу:</strong> {MediaDetails.original_language}
          </li>
          <li>
            <strong>Жанри:</strong> {valuesToString(MediaDetails.genres)}
          </li>
          <li>
            <strong>Країна:</strong>{" "}
            {valuesToString(MediaDetails.production_countries)}
          </li>
          <li>
            <strong>Бюджет:</strong> ${MediaDetails.budget?.toLocaleString()}
          </li>
          <li>
            <strong>Дохід:</strong> ${MediaDetails.revenue?.toLocaleString()}
          </li>
          <li>
            <strong>Статус:</strong> {MediaDetails.status}
          </li>
          <li>
            <strong>Тривалість:</strong> {MediaDetails.runtime} хв.
          </li>
          <li>
            <strong>Виробники:</strong>{" "}
            {valuesToString(MediaDetails.production_companies)}
          </li>
        </ul>
      </div>
    </div>
  );
};
