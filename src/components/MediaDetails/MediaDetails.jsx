import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  Film,
  ListPlus,
  MapPin,
  Play,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectIsFavorite,
  toggleFavorite,
} from "../../features/favorites/favoritesSlice";
import {
  selectCustomListIds,
  toggleCustomList,
} from "../../features/customLists/customListsSlice";
import {
  selectIsWatchLater,
  toggleWatchLater,
} from "../../features/watchLater/watchLaterSlice";
import {
  selectIsWatched,
  toggleWatched,
} from "../../features/watched/watchedSlice";
import {
  useGetMediaDetailsQuery,
  useGetMediaCreditsQuery,
  useGetMediaVideosQuery,
} from "../../services/tmdbApi";

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

const selectTrailer = (videos = []) =>
  videos
    .filter(
      (video) =>
        video.site === "YouTube" &&
        video.key &&
        ["Trailer", "Teaser"].includes(video.type),
    )
    .sort((first, second) => {
      const getPriority = (video) =>
        (video.official ? 0 : 2) +
        (video.type === "Trailer" ? 0 : 1) +
        (video.iso_639_1 === "uk" ? 0 : video.iso_639_1 === "en" ? 1 : 2);

      return getPriority(first) - getPriority(second);
    })[0];

export const MediaDetails = () => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const listMenuRef = useRef(null);

  const { id } = useParams();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const watched = useAppSelector((state) => selectIsWatched(state, id));
  const isFavorite = useAppSelector((state) => selectIsFavorite(state, id));
  const isWatchLater = useAppSelector((state) => selectIsWatchLater(state, id));
  const customListIds = useAppSelector((state) =>
    selectCustomListIds(state, id),
  );

  const isMovieRoute = pathname.includes("/movies/");
  const isSeriesRoute = pathname.includes("/serials/");
  const routeMediaType = isSeriesRoute
    ? "tv"
    : isMovieRoute
      ? "movie"
      : "unknown";
  const {
    data: mediaDetails,
    isLoading,
    isError: loadError,
  } = useGetMediaDetailsQuery({ id, mediaType: routeMediaType }, { skip: !id });
  const trailerMediaType = mediaDetails?.media_type || routeMediaType;
  const { data: videoData, isLoading: isTrailerLoading } =
    useGetMediaVideosQuery(
      { id, mediaType: trailerMediaType },
      { skip: !mediaDetails || trailerMediaType === "unknown" },
    );
  const {
    data: creditsData,
    isLoading: isCreditsLoading,
  } = useGetMediaCreditsQuery(
    { id, mediaType: trailerMediaType },
    { skip: !mediaDetails || trailerMediaType === "unknown" },
  );
  const trailer = selectTrailer(videoData?.results);
  const selectedListIds = [
    ...customListIds,
    ...(isFavorite ? [3] : []),
    ...(isWatchLater ? [4] : []),
  ];

  useEffect(() => {
    setIsTrailerOpen(false);
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listMenuRef.current && !listMenuRef.current.contains(event.target)) {
        setIsListOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isTrailerOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsTrailerOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isTrailerOpen]);

  const handleAddToList = (listId) => {
    if (listId === 1 || listId === 2) {
      dispatch(toggleCustomList({ mediaId: id, listId }));
    } else if (listId === 3) {
      dispatch(toggleFavorite(id));
    } else if (listId === 4) {
      dispatch(toggleWatchLater(id));
    }
    setIsListOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400" role="status">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
          Завантажуємо деталі...
        </div>
      </div>
    );
  }

  if (loadError || !mediaDetails) {
    return (
      <div className="mx-auto my-16 max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-12 text-center">
        <Film className="mx-auto mb-4 text-slate-500" size={36} />
        <h1 className="text-xl font-semibold text-white">
          Не вдалося знайти цей фільм або серіал
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Спробуйте повернутися до каталогу та вибрати інший варіант.
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
    {
      label: "Мова оригіналу",
      value: mediaDetails.original_language || "Невідомо",
    },
    { label: "Жанри", value: formatNames(mediaDetails.genres) },
    {
      label: "Країна виробництва",
      value: formatNames(mediaDetails.production_countries),
    },
    {
      label: "Бюджет",
      value: formatCurrency(mediaDetails.budget),
      icon: Wallet,
    },
    {
      label: "Дохід",
      value: formatCurrency(mediaDetails.revenue),
      icon: Wallet,
    },
    { label: "Статус", value: mediaDetails.status || "Невідомо" },
    {
      label: "Тривалість",
      value: runtime ? `${runtime} хв.` : "Невідомо",
      icon: Clock3,
    },
    {
      label: "Компанії-виробники",
      value: formatNames(mediaDetails.production_companies),
    },
  ];
  const cast = (creditsData?.cast || [])
    .map((actor) => {
      const role = actor.character
        || actor.roles?.map((item) => item.character).filter(Boolean).join(", ")
        || "Роль невідома";

      return {
        id: actor.id,
        name: actor.name,
        originalName: actor.original_name,
        character: role,
        profilePath: actor.profile_path,
      };
    })
    .filter((actor) => actor.id)
    .slice(0, 20);

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
                alt={`Постер «${title}»`}
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
                <span className="text-sm font-bold ">
                  <span className="ml-1 text-xsfont-bold text-slate-300">
                    TMDB
                  </span>
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
                Про {isSeriesRoute ? "серіал" : "фільм"}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                {mediaDetails.overview ||
                  "Опис для цього фільму поки відсутній."}
              </p>
            </div>

            <div className="relative mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                disabled={!trailer || isTrailerLoading}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:border disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-400">
                <Play size={17} fill="currentColor" aria-hidden="true" />
                {isTrailerLoading
                  ? "Завантажуємо трейлер..."
                  : trailer
                    ? "Дивитися трейлер"
                    : "Трейлер недоступний"}
              </button>

              <button
                type="button"
                onClick={() => dispatch(toggleWatched(id))}
                aria-pressed={watched}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                  watched
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "border border-slate-600 bg-slate-800/80 text-slate-100 hover:border-slate-500 hover:bg-slate-700"
                }`}>
                {watched ? <Check size={17} /> : <Film size={17} />}
                Дивився
              </button>

              <div ref={listMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsListOpen((previous) => !previous)}
                  aria-expanded={isListOpen}
                  aria-haspopup="menu"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300">
                  <ListPlus size={18} />
                  Додати до...
                </button>

                {isListOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 top-[calc(100%+8px)] z-20 w-60 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/50">
                    {mediaLists.map((list) => {
                      const isSelected = selectedListIds.includes(list.id);
                      return (
                        <button
                          key={list.id}
                          type="button"
                          role="menuitemcheckbox"
                          aria-checked={isSelected}
                          onClick={() => handleAddToList(list.id)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800">
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
              className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              Інформація про {isSeriesRoute ? "серіал" : "фільм"}
            </h2>
          </div>
          <MapPin className="mb-1 hidden text-slate-600 sm:block" size={22} />
        </div>

        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metadata.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-colors hover:border-slate-700">
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

      <section className="mt-10" aria-labelledby="cast-heading">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            Зйомки
          </p>
          <h2
            id="cast-heading"
            className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            У головних ролях
          </h2>
        </div>

        {isCreditsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="aspect-[2/3] bg-slate-800" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-4/5 rounded bg-slate-700" />
                  <div className="h-3 w-3/5 rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : cast.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {cast.map((actor) => (
              <article
                key={actor.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 transition-colors hover:border-slate-700">
                {actor.profilePath ? (
                  <img
                    className="aspect-[2/3] w-full object-cover"
                    src={`${imageBaseUrl}/w185${actor.profilePath}`}
                    alt={actor.name ? `Фото актора ${actor.name}` : "Актор"}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center bg-slate-800 text-slate-600">
                    <UserRound size={48} strokeWidth={1.2} aria-hidden="true" />
                    <span className="sr-only">Фото актора недоступне</span>
                  </div>
                )}
                <div className="p-3 sm:p-4">
                  <h3 className="line-clamp-2 text-sm font-bold leading-5 text-white sm:text-base">
                    {actor.name || "Ім'я невідоме"}
                  </h3>
                  {actor.originalName &&
                    actor.originalName !== actor.name && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {actor.originalName}
                      </p>
                    )}
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-blue-300 sm:text-sm">
                    {actor.character}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-sm text-slate-400">
            Інформація про акторський склад поки недоступна.
          </div>
        )}
      </section>

      {isTrailerOpen && trailer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsTrailerOpen(false);
            }
          }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="trailer-heading"
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3 sm:px-6">
              <h2
                id="trailer-heading"
                className="truncate font-semibold text-white">
                Трейлер: {title}
              </h2>
              <button
                type="button"
                onClick={() => setIsTrailerOpen(false)}
                aria-label="Закрити трейлер"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}?autoplay=1`}
                title={`Трейлер: ${title}`}
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 text-sm text-slate-400 transition-colors hover:text-white sm:px-6">
              Відкрити на YouTube
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </section>
        </div>
      )}
    </article>
  );
};
