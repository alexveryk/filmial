import { useState } from "react";
import { Link } from "react-router-dom";
import { Film, Star } from "lucide-react";
import { MediaActions } from "../MediaActions/MediaActions";

export const MediaCard = ({ items, linkTo }) => {
  const [hasPoster, setHasPoster] = useState(Boolean(items.poster_path));
  const title = items.title || items.name || "Без назви";
  const releaseDate = items.release_date || items.first_air_date;
  const releaseYear = releaseDate ? releaseDate.slice(0, 4) : null;

  return (
    <article
      className="group relative w-full rounded-2xl border border-slate-800 bg-slate-900 shadow-sm transition duration-300 hover:z-20 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20"
    >
      <div className="relative">
        <Link
          to={linkTo}
          className="block rounded-t-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-t-2xl bg-slate-800">
            {hasPoster ? (
              <img
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={`https://image.tmdb.org/t/p/w500/${items.poster_path}`}
                alt={`Постер фільму «${title}»`}
                loading="lazy"
                onError={() => setHasPoster(false)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 to-slate-950 text-slate-500">
                <Film size={34} aria-hidden="true" />
                <span className="px-3 text-center text-xs">Постер відсутній</span>
              </div>
            )}

            {typeof items.vote_average === "number" &&
              items.vote_average > 0 && (
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
                  <Star
                    size={12}
                    className="fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                  {items.vote_average.toFixed(1)}
                </span>
              )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/90 to-transparent" />
          </div>
        </Link>

        <div className="absolute inset-x-2 bottom-2 z-10 sm:inset-x-3 sm:bottom-3">
          <MediaActions items={items} />
        </div>
      </div>

      <Link
        to={linkTo}
        className="block min-h-20 rounded-b-2xl px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 sm:px-4"
      >
        <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-100 sm:text-base">
          {title}
        </h2>
        {releaseYear && (
          <p className="mt-1 text-xs text-slate-400">{releaseYear}</p>
        )}
      </Link>
    </article>
  );
};
