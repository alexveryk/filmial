import { useLocation, useParams } from "react-router-dom";
import { fetchMovieDetails, fetchTvSeriesDetails } from "../../services/api";
import { useEffect, useRef, useState } from "react";

const mediaLists = [
  { id: 1, name: "Комедії" },
  { id: 2, name: "Романтичні" },
  { id: 3, name: "Улюблені" },
  { id: 4, name: "Планую подивитися" },
];

export const MediaDetails = () => {
  const [mediaDetails, setMediaDetails] = useState({});
  const [isWatched, setIsWatched] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const listMenuRef = useRef(null);

  const { id } = useParams();
  const location = useLocation();
  const pathname = location.pathname;

  const isMovieRoute = pathname.includes("/movies/");
  const isSeriesRoute = pathname.includes("/serials/");
  const isSearchRoute = pathname.includes("/search/");

  useEffect(() => {
    let isMounted = true;

    const getDetails = async () => {
      try {
        let data = null;

        if (isMovieRoute) {
          data = await fetchMovieDetails(id);
        } else if (isSeriesRoute) {
          data = await fetchTvSeriesDetails(id);
        } else if (isSearchRoute) {
          data =
            (await fetchMovieDetails(id).catch(() => null)) ??
            (await fetchTvSeriesDetails(id).catch(() => null));
        }

        if (isMounted && data) {
          setMediaDetails(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getDetails();

    return () => {
      isMounted = false;
    };
  }, [id, isMovieRoute, isSeriesRoute, isSearchRoute]);

  const valuesToString = (values) => {
    if (!values || values.length === 0) {
      return "????????, ?? ? ???????????? ????? ????????";
    }

    return values.map((value) => value.name).join(", ");
  };

  const title = mediaDetails.title || mediaDetails.name || "??? ?????";
  const releaseDate =
    mediaDetails.release_date || mediaDetails.first_air_date || "????????";
  const voteAverage =
    typeof mediaDetails.vote_average === "number"
      ? mediaDetails.vote_average.toFixed(1)
      : "N/A";

  const handleAddToList = (listId) => {
    console.log("Додано до списку:", { mediaId: id, listId });
    setIsListOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listMenuRef.current && !listMenuRef.current.contains(event.target)) {
        setIsListOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!mediaDetails || Object.keys(mediaDetails).length === 0) {
    return <div className="text-center py-8">?????????? ??????????.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-lg"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original/${mediaDetails.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative grid md:grid-cols-3 gap-6 p-6 text-white">
          <div className="col-span-1 flex justify-center">
            <img
              className="rounded-xl shadow-lg max-h-[450px] object-cover"
              src={`https://image.tmdb.org/t/p/original/${mediaDetails.poster_path}`}
              alt={title}
            />
          </div>

          <div className="col-span-2 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{title}</h1>
              <p className="italic text-gray-300 mb-4">
                {mediaDetails.tagline || ""}
              </p>
              <p className="text-gray-200 leading-relaxed mb-4">
                {mediaDetails.overview || "???? ?????????"}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <span className="px-3 py-2 bg-yellow-400 text-black rounded-full font-semibold flex items-center gap-2">
                <img
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg"
                  alt="TMDB Logo"
                  className="h-5"
                />
                {voteAverage}/10
              </span>

              <span className="px-3 py-2 bg-gray-700 text-white rounded-full text-sm font-semibold">
                ?? {releaseDate}
              </span>
            </div>

            <div className="relative mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWatched((previous) => !previous)}
                aria-pressed={isWatched}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  isWatched
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {isWatched ? "✓ Дивився" : "○ Дивився"}
              </button>

              <div ref={listMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsListOpen((previous) => !previous)}
                  aria-expanded={isListOpen}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500"
                >
                  Додати до...
                </button>

                {isListOpen && (
                  <div
                    className="absolute left-0 top-[calc(100%+8px)] z-20 w-56 rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-2xl"
                    style={{ animation: "fadeIn 0.2s ease-out" }}
                  >
                    {mediaLists.map((list) => (
                      <button
                        key={list.id}
                        type="button"
                        onClick={() => handleAddToList(list.id)}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-colors hover:bg-gray-800 hover:text-white"
                      >
                        {list.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded-2xl shadow-md mb-4">
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">??????</h2>
        <ul className="grid md:grid-cols-2 gap-y-3 gap-x-8 text-gray-300">
          <li>
            <strong>???? ?????????:</strong> {mediaDetails.original_language}
          </li>
          <li>
            <strong>?????:</strong> {valuesToString(mediaDetails.genres)}
          </li>
          <li>
            <strong>??????:</strong>{" "}
            {valuesToString(mediaDetails.production_countries)}
          </li>
          <li>
            <strong>??????:</strong> ${mediaDetails.budget?.toLocaleString()}
          </li>
          <li>
            <strong>?????:</strong> ${mediaDetails.revenue?.toLocaleString()}
          </li>
          <li>
            <strong>??????:</strong> {mediaDetails.status}
          </li>
          <li>
            <strong>??????????:</strong> {mediaDetails.runtime || mediaDetails.episode_run_time?.[0] || "????????"} ??.
          </li>
          <li>
            <strong>?????????:</strong>{" "}
            {valuesToString(mediaDetails.production_companies)}
          </li>
        </ul>
      </div>
    </div>
  );
};
