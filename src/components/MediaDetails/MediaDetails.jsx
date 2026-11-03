import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Clock3,
  Film,
  ListPlus,
  MapPin,
  Wallet,
} from "lucide-react";
import { fetchMovieDetails, fetchTvSeriesDetails } from "../../services/api";
import { useMediaState } from "../../context/MediaStateContext";

const mediaLists = [
  { id: 1, name: "Комедії" },
  { id: 2, name: "Романтичні" },
  { id: 3, name: "Улюблені" },
  { id: 4, name: "Планую подивитися" },
];

const imageBaseUrl = "https://image.tmdb.org/t/p";

const formatDate = (date) => {
  if (!date) return "Дата невідома";

  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
};

const formatCurrency = (amount) =>
  typeof amount === "number" && amount > 0
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(amount)
    : "Невідомо";

const formatNames = (values) =>
  values?.length ? values.map((value) => value.name).join(", ") : "Невідомо";

export const MediaDetails = () => {
  const [mediaDetails, setMediaDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const listMenuRef = useRef(null);

  const { id } = useParams();
  const { pathname } = useLocation();
  const { isWatched, getSelectedListIds, toggleWatched, toggleList } =
    useMediaState();
  const watched = isWatched(id);
  const selectedListIds = getSelectedListIds(id);

  const isMovieRoute = pathname.includes("/movies/");
  const isSeriesRoute = pathname.includes("/serials/");
  const isSearchRoute = pathname.includes("/search/");

  useEffect(() => {
    let isMounted = true;

    const getDetails = async () => {
      setIsLoading(true);
      setLoadError(false);
      setMediaDetails(null);

      try {
        let data = null;

        if (isMovieRoute) {
          data = await fetchMovieDetails(id);
        } else if (isSeriesRoute) {
          data = await fetchTvSeriesDetails(id);
        } else if (isSearchRoute) {
          data =
            (await fetchMovieDetails(id).catch(() => null)) ??
            (await fetchTvSeriesDetails(id));
        }

        if (isMounted) {
          setMediaDetails(data);
          setLoadError(!data);
        }
      } catch (error) {
        console.error("Не вдалося завантажити інформацію про фільм:", error);
        if (isMounted) setLoadError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    getDetails();
    return () => {
      isMounted = false;
    };
  }, [id, isMovieRoute, isSeriesRoute, isSearchRoute]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listMenuRef.current && !listMenuRef.current.contains(event.target)) {
        setIsListOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToList = (listId) => {
    toggleList(id, listId);
    setIsListOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400" role="status">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
          Завантажуємо деталі фільму...
        </div>
      </div>
    );
  }

  if (loadError || !mediaDetails) {
    return (
      <div className="mx-auto my-16 max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-12 text-center">
        <Film className="mx-auto mb-4 text-slate-500" size={36} />
        <h1 className="text-xl font-semibold text-white">
          Не вдалося знайти цей фільм
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Спробуйте повернутися до каталогу та вибрати інший фільм.
        </p>
      </div>
    );
  }

  const title = mediaDetails.title || mediaDetails.name || "Без назви";
  const releaseDate =
    mediaDetails.release_date || mediaDetails.first_air_date || "";
  const rating =
    typeof mediaDetails.vote_average === "number"
      ? mediaDetails.vote_average.toFixed(1)
      : "—";
  const runtime =
    mediaDetails.runtime || mediaDetails.episode_run_time?.[0] || null;
  const metadata = [
    { label: "Мова оригіналу", value: mediaDetails.original_language || "Невідомо" },
    { label: "Жанри", value: formatNames(mediaDetails.genres) },
    { label: "Країна виробництва", value: formatNames(mediaDetails.production_countries) },
    { label: "Бюджет", value: formatCurrency(mediaDetails.budget), icon: Wallet },
    { label: "Дохід", value: formatCurrency(mediaDetails.revenue), icon: Wallet },
    { label: "Статус", value: mediaDetails.status || "Невідомо" },
    { label: "Тривалість", value: runtime ? `${runtime} хв.` : "Невідомо", icon: Clock3 },
    { label: "Компанії-виробники", value: formatNames(mediaDetails.production_companies) },
  ];

  return (
    <article className="mx-auto max-w-6xl pb-12 text-slate-100">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20">
        {mediaDetails.backdrop_path && (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: `url(${imageBaseUrl}/w1280${mediaDetails.backdrop_path})`,
            }}
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/70"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20"
        />

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(230px,0.78fr)_minmax(0,1.6fr)] lg:gap-12 lg:p-12">
          <div className="mx-auto w-full max-w-[330px] lg:max-w-none">
            {mediaDetails.poster_path ? (
              <img
                className="aspect-[2/3] w-full rounded-2xl border border-white/10 object-cover shadow-2xl shadow-black/50"
                src={`${imageBaseUrl}/w500${mediaDetails.poster_path}`}
                alt={`Постер фільму «${title}»`}
              />
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-800 text-slate-600">
                <Film size={56} strokeWidth={1.2} />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-center py-1 lg:py-3">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5">
                {mediaDetails.media_type === "tv" || isSeriesRoute
                  ? "Серіал"
                  : "Фільм"}
              </span>
              {mediaDetails.original_language && (
                <span className="text-slate-400">
                  {mediaDetails.original_language}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            {mediaDetails.tagline && (
              <p className="mt-3 text-lg italic text-slate-300 sm:text-xl">
                «{mediaDetails.tagline}»
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-full border border-amber-300/20 bg-slate-950/60 py-1.5 pl-1.5 pr-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-400 text-xs font-bold text-amber-300">
                  {rating}
                </span>
                <span className="text-sm font-bold text-white">
                  /10 <span className="ml-1 text-xs font-normal text-slate-500">TMDB</span>
                </span>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                <CalendarDays size={16} className="text-blue-300" />
                {formatDate(releaseDate)}
              </span>
              {runtime && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                  <Clock3 size={16} className="text-blue-300" />
                  {runtime} хв.
                </span>
              )}
            </div>

            <div className="mt-7">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Про фільм
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                {mediaDetails.overview || "Опис для цього фільму поки відсутній."}
              </p>
            </div>

            <div className="relative mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => toggleWatched(id)}
                aria-pressed={watched}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                  watched
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "border border-slate-600 bg-slate-800/80 text-slate-100 hover:border-slate-500 hover:bg-slate-700"
                }`}
              >
                {watched ? <Check size={17} /> : <Film size={17} />}
                Дивився
              </button>

              <div ref={listMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsListOpen((previous) => !previous)}
                  aria-expanded={isListOpen}
                  aria-haspopup="menu"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                >
                  <ListPlus size={18} />
                  Додати до...
                </button>

                {isListOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 top-[calc(100%+8px)] z-20 w-60 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/50"
                  >
                    {mediaLists.map((list) => {
                      const isSelected = selectedListIds.includes(list.id);
                      return (
                        <button
                          key={list.id}
                          type="button"
                          role="menuitemcheckbox"
                          aria-checked={isSelected}
                          onClick={() => handleAddToList(list.id)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
                        >
                          <span>{list.name}</span>
                          {isSelected && (
                            <Check
                              size={16}
                              className="text-emerald-400"
                              aria-label="Додано до списку"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="film-details-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Детальніше
            </p>
            <h2
              id="film-details-heading"
              className="mt-1 text-2xl font-bold text-white sm:text-3xl"
            >
              Інформація про фільм
            </h2>
          </div>
          <MapPin className="mb-1 hidden text-slate-600 sm:block" size={22} />
        </div>

        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metadata.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-colors hover:border-slate-700"
            >
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {Icon && <Icon size={14} className="text-blue-300" />}
                {label}
              </dt>
              <dd className="mt-2 break-words text-sm font-medium leading-6 text-slate-200">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
};
