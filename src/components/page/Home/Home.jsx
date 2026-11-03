import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clapperboard, Play, Star, TrendingUp } from "lucide-react";
import {
  fetchMoviesByGenre,
  fetchMoviesNowPlaying,
  fetchMoviesPopularity,
  fetchMoviesTrending,
  fetchPopularSeries,
} from "../../../services/api";
import { MediaActions } from "../../MediaActions/MediaActions";
import { MediaCard } from "../../MediaCard/MediaCard";
import { Spinner } from "../../Spiner/Spiner";

const initialSections = {
  featured: { items: [], loading: true, error: false },
  newReleases: { items: [], loading: true, error: false },
  comedies: { items: [], loading: true, error: false },
  series: { items: [], loading: true, error: false },
  trending: { items: [], loading: true, error: false },
};

const sectionRequests = [
  { key: "featured", load: fetchMoviesPopularity },
  { key: "newReleases", load: fetchMoviesNowPlaying },
  { key: "comedies", load: () => fetchMoviesByGenre(35) },
  { key: "series", load: fetchPopularSeries },
  { key: "trending", load: fetchMoviesTrending },
];

const shelves = [
  {
    key: "newReleases",
    title: "Новинки цього тижня",
    description: "Найсвіжіші фільми на великому екрані",
    mediaType: "movies",
    href: "/movies",
  },
  {
    key: "comedies",
    title: "Топ комедій",
    description: "Трохи гумору для гарного вечора",
    mediaType: "movies",
    href: "/movies",
  },
  {
    key: "series",
    title: "Популярні серіали",
    description: "Історії, від яких важко відірватися",
    mediaType: "serials",
    href: "/serials",
  },
  {
    key: "trending",
    title: "Зараз у тренді",
    description: "Фільми, які обговорюють просто зараз",
    mediaType: "movies",
    href: "/movies",
  },
];

const getTitle = (item) => item.title || item.name || "Без назви";

const getYear = (item) => {
  const date = item.release_date || item.first_air_date;
  return date ? date.slice(0, 4) : "";
};

const getDescription = (text = "") => {
  if (!text) {
    return "Відкрийте для себе історію, яка залишиться з вами надовго.";
  }

  return text.length > 220 ? `${text.slice(0, 217).trimEnd()}...` : text;
};

const MovieShelf = ({ shelf, section }) => (
  <section className="mb-10 sm:mb-14" aria-labelledby={`${shelf.key}-heading`}>
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2
          id={`${shelf.key}-heading`}
          className="text-xl font-bold tracking-tight text-white sm:text-2xl"
        >
          {shelf.title}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{shelf.description}</p>
      </div>
      <Link
        to={shelf.href}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
      >
        Усі <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>

    {section.loading ? (
      <Spinner />
    ) : section.error ? (
      <p className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-5 text-sm text-slate-300">
        Не вдалося завантажити добірку. Спробуйте пізніше.
      </p>
    ) : section.items.length === 0 ? (
      <p className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-5 text-sm text-slate-400">
        У цій добірці поки немає фільмів.
      </p>
    ) : (
      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-4 sm:gap-5">
        {section.items.map((item) => (
          <li
            key={`${shelf.mediaType}-${item.id}`}
            className="w-[min(42vw,10rem)] shrink-0 snap-start sm:w-44 md:w-48"
          >
            <MediaCard
              items={item}
              linkTo={`/${shelf.mediaType}/${item.id}`}
            />
          </li>
        ))}
      </ul>
    )}
  </section>
);

export const Home = () => {
  const [sections, setSections] = useState(initialSections);

  useEffect(() => {
    let isMounted = true;

    sectionRequests.forEach(async ({ key, load }) => {
      try {
        const data = await load();

        if (!Array.isArray(data?.results)) {
          throw new Error(`TMDB повернув некоректну добірку: ${key}`);
        }

        if (isMounted) {
          setSections((previous) => ({
            ...previous,
            [key]: { items: data.results, loading: false, error: false },
          }));
        }
      } catch (error) {
        console.error(`Не вдалося завантажити добірку "${key}":`, error);

        if (isMounted) {
          setSections((previous) => ({
            ...previous,
            [key]: { items: [], loading: false, error: true },
          }));
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const featured = sections.featured.items[0];
  const featuredYear = featured ? getYear(featured) : "";

  return (
    <div className="pb-6 pt-5 sm:pt-8">
      <section
        className="relative mb-10 min-h-[440px] overflow-visible rounded-3xl border border-slate-800 bg-slate-900 sm:mb-14 sm:min-h-[500px]"
        aria-label="Рекомендація Filmial"
      >
        <div className="absolute inset-0 -z-0 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
          {featured?.backdrop_path && (
            <img
              src={`https://image.tmdb.org/t/p/original/${featured.backdrop_path}`}
              alt=""
              className="h-full w-full object-cover object-center opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
        </div>

        <div className="relative z-10 flex min-h-[440px] items-end px-5 py-9 sm:min-h-[500px] sm:px-10 sm:py-12 lg:px-14">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
              <Clapperboard size={14} aria-hidden="true" />
              Рекомендація Filmial
            </p>

            {sections.featured.loading ? (
              <div className="py-8">
                <Spinner />
              </div>
            ) : sections.featured.error ? (
              <div className="max-w-lg">
                <h1 className="text-3xl font-bold text-white sm:text-5xl">
                  Твій наступний фільм чекає
                </h1>
                <p className="mt-4 leading-7 text-slate-300">
                  Зараз не вдалося отримати рекомендацію. Переглянь каталог і
                  знайди історію до душі.
                </p>
                <Link
                  to="/movies"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
                >
                  До каталогу <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            ) : featured ? (
              <>
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
                  {getTitle(featured)}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-200">
                  {featuredYear && <span>{featuredYear}</span>}
                  {featured.vote_average > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1.5 font-semibold text-white backdrop-blur">
                      <Star
                        size={15}
                        className="fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />
                      {featured.vote_average.toFixed(1)}
                      <span className="font-normal text-slate-400">TMDB</span>
                    </span>
                  )}
                  {featured.original_language && (
                    <span className="rounded-lg border border-white/10 bg-slate-950/50 px-2.5 py-1.5 uppercase text-slate-300">
                      {featured.original_language}
                    </span>
                  )}
                </div>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                  {getDescription(featured.overview)}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/movies/${featured.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
                  >
                    <Play size={17} fill="currentColor" aria-hidden="true" />
                    Детальніше
                  </Link>
                  <MediaActions items={featured} variant="hero" />
                </div>
              </>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-white sm:text-5xl">
                  Світ кіно — у Filmial
                </h1>
                <p className="mt-4 text-slate-300">
                  Знайди свій наступний улюблений фільм чи серіал.
                </p>
              </div>
            )}
          </div>

          <div className="absolute right-8 top-8 hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-slate-200 backdrop-blur sm:flex">
            <TrendingUp size={16} className="text-blue-300" aria-hidden="true" />
            Популярне сьогодні
          </div>
        </div>
      </section>

      <div>
        {shelves.map((shelf) => (
          <MovieShelf
            key={shelf.key}
            shelf={shelf}
            section={sections[shelf.key]}
          />
        ))}
      </div>
    </div>
  );
};
