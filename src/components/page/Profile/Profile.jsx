import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Bookmark, CheckCircle2, Clock3, Heart, ListVideo } from "lucide-react";
import { selectUserProfile } from "../../../features/user/userSlice";
import { useGetMediaDetailsQuery } from "../../../services/tmdbApi";
import { MediaCard } from "../../MediaCard/MediaCard";
import { UserConnections } from "./UserConnections";
import { SharedMovieGroups } from "./SharedMovieGroups";

const tabs = [
  { id: "favorites", label: "Обране", icon: Heart },
  { id: "watched", label: "Переглянуте", icon: CheckCircle2 },
  { id: "watchLater", label: "Подивитися пізніше", icon: Clock3 },
  { id: "watchNow", label: "Дивлюся зараз", icon: Bookmark },
];

const ProfileMediaCard = ({ mediaId }) => {
  const { data, isLoading, isError } = useGetMediaDetailsQuery({
    id: mediaId,
    mediaType: "unknown",
  }, {
    skip: !mediaId,
  });

  if (isLoading) {
    return (
      <li className="aspect-[2/3] animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />
    );
  }

  if (isError) {
    return (
      <li className="flex aspect-[2/3] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-4 text-center text-xs text-slate-400">
        Не вдалося завантажити медіа
      </li>
    );
  }

  if (!data) return null;

  const mediaType =
    data.media_type === "tv"
      ? "serials"
      : "movies";

  return (
    <li className="min-w-0">
      <MediaCard
        items={data}
        linkTo={`/${mediaType}/${mediaId}`}
      />
    </li>
  );
};

export const Profile = () => {
  const profile = useSelector(selectUserProfile);
  const favorites = useSelector((state) => state.favorites.byMediaId);
  const watched = useSelector((state) => state.watched.byMediaId);
  const watchLater = useSelector((state) => state.watchLater.byMediaId);
  const watchNow = useSelector((state) => state.watchNow.byMediaId);
  const customLists = useSelector((state) => state.customLists.namesById);
  const [activeTab, setActiveTab] = useState("favorites");

  const collections = useMemo(
    () => ({
      favorites: Object.keys(favorites).filter((id) => Boolean(favorites[id])),
      watched: Object.keys(watched).filter((id) => Boolean(watched[id])),
      watchLater: Object.keys(watchLater).filter((id) => Boolean(watchLater[id])),
      watchNow: Object.keys(watchNow).filter((id) => Boolean(watchNow[id])),
    }),
    [favorites, watched, watchLater, watchNow]
  );

  const activeMediaIds = collections[activeTab] || [];

  return (
    <div className="mx-auto w-full max-w-6xl py-6 sm:py-10">
      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80">
        <div className="h-28 bg-gradient-to-r from-slate-950 via-blue-950/40 to-slate-900 sm:h-36" />
        <div className="relative px-5 pb-6 sm:px-8">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt=""
              className="-mt-12 h-24 w-24 rounded-full border-4 border-slate-900 object-cover shadow-xl"
            />
          ) : (
            <span className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-900 bg-blue-500 text-3xl font-bold text-white shadow-xl">
              {(profile?.displayName || "К").charAt(0).toUpperCase()}
            </span>
          )}

          <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            {profile?.displayName || "Користувач"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Особистий профіль</p>
          {profile?.username && (
            <p className="mt-1 text-sm text-blue-300">@{profile.username}</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex min-h-20 flex-col items-start justify-between rounded-2xl border p-4 text-left transition-colors ${
                  activeTab === id
                    ? "border-blue-400/50 bg-blue-500/10"
                    : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                }`}>
                <Icon
                  size={18}
                  className={
                    activeTab === id ? "text-blue-400" : "text-slate-500"
                  }
                />
                <span className="mt-3">
                  <strong className="block text-lg text-white">
                    {collections[id].length}
                  </strong>
                  <span className="text-xs text-slate-400">{label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <UserConnections />
      <SharedMovieGroups />

      {Object.keys(customLists).length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
            <ListVideo size={20} className="text-blue-400" />
            Мої списки
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(customLists).map(([id, name]) => (
              <span
                key={id}
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
                {name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">
          {tabs.find((tab) => tab.id === activeTab)?.label}
        </h2>
        {activeMediaIds.length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 xl:grid-cols-5">
            {activeMediaIds.map((mediaId) => (
              <ProfileMediaCard
                key={`${activeTab}-${mediaId}`}
                mediaId={mediaId}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-10 text-center text-sm text-slate-400">
            У цьому розділі поки нічого немає.
          </div>
        )}
      </section>
    </div>
  );
};
