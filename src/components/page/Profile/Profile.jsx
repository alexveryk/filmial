import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Bookmark,
  CheckCircle2,
  Clock3,
  Heart,
  ListVideo,
  Pencil,
  Plus,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { useAppDispatch } from "../../../app/hooks";
import { selectUserProfile } from "../../../features/user/userSlice";
import {
  createCustomList,
  deleteCustomList,
  renameCustomList,
} from "../../../features/customLists/customListsSlice";
import { useGetMediaDetailsQuery } from "../../../services/tmdbApi";
import { MediaCard } from "../../MediaCard/MediaCard";
import { UserAvatar } from "../../UserAvatar/UserAvatar";
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
  const dispatch = useAppDispatch();
  const profile = useSelector(selectUserProfile);
  const favorites = useSelector((state) => state.favorites.byMediaId);
  const watched = useSelector((state) => state.watched.byMediaId);
  const watchLater = useSelector((state) => state.watchLater.byMediaId);
  const watchNow = useSelector((state) => state.watchNow.byMediaId);
  const customLists = useSelector((state) => state.customLists.namesById);
  const customListMemberships = useSelector(
    (state) => state.customLists.byMediaId,
  );
  const [activeTab, setActiveTab] = useState("favorites");
  const [requestedCustomListId, setRequestedCustomListId] = useState("");
  const [requestedCustomListName, setRequestedCustomListName] = useState("");
  const [newListName, setNewListName] = useState("");
  const [newListError, setNewListError] = useState("");
  const [editingListId, setEditingListId] = useState("");
  const [editingListName, setEditingListName] = useState("");
  const [editingListError, setEditingListError] = useState("");
  const customListMediaIdsById = useMemo(() => {
    const mediaIdsByListId = Object.fromEntries(
      Object.keys(customLists).map((id) => [id, []]),
    );
    Object.entries(customListMemberships).forEach(([mediaId, listIds]) => {
      listIds.forEach((listId) => {
        const normalizedListId = String(listId);
        if (mediaIdsByListId[normalizedListId]) {
          mediaIdsByListId[normalizedListId].push(mediaId);
        }
      });
    });
    return mediaIdsByListId;
  }, [customListMemberships, customLists]);
  const requestedCustomListIdByName = Object.entries(customLists).find(
    ([, name]) =>
      name.toLowerCase() === requestedCustomListName.toLowerCase(),
  )?.[0];
  const activeCustomListId = customLists[requestedCustomListId]
    ? requestedCustomListId
    : requestedCustomListIdByName || Object.keys(customLists)[0] || "";
  const activeCustomListMediaIds =
    customListMediaIdsById[activeCustomListId] || [];

  const handleStartEditingList = (id, name) => {
    setRequestedCustomListId(id);
    setRequestedCustomListName("");
    setEditingListId(id);
    setEditingListName(name);
    setEditingListError("");
  };

  const handleCreateList = (event) => {
    event.preventDefault();
    const name = newListName.trim();
    if (!name) return;

    const duplicateName = Object.values(customLists).some(
      (existingName) => existingName.toLowerCase() === name.toLowerCase(),
    );
    if (duplicateName) {
      setNewListError("Список із такою назвою вже існує.");
      return;
    }

    dispatch(createCustomList(name));
    setRequestedCustomListId("");
    setRequestedCustomListName(name);
    setNewListName("");
    setNewListError("");
  };

  const handleRenameList = (event, id) => {
    event.preventDefault();
    const name = editingListName.trim();
    const duplicateName = Object.entries(customLists).some(
      ([existingId, existingName]) =>
        existingId !== id && existingName.toLowerCase() === name.toLowerCase(),
    );
    if (duplicateName) {
      setEditingListError("Список із такою назвою вже існує.");
      return;
    }

    dispatch(renameCustomList({ id, name }));
    setEditingListId("");
    setEditingListName("");
    setEditingListError("");
  };

  const handleDeleteList = (id, name) => {
    if (
      !window.confirm(
        `Видалити список «${name}»? Усі фільми буде прибрано саме з цього списку. Цю дію не можна скасувати.`,
      )
    ) {
      return;
    }

    dispatch(deleteCustomList(id));
    if (requestedCustomListId === id) {
      setRequestedCustomListId(
        Object.keys(customLists).find((listId) => listId !== id) || "",
      );
    }
    if (requestedCustomListName.toLowerCase() === name.toLowerCase()) {
      setRequestedCustomListName("");
    }
    if (editingListId === id) {
      setEditingListId("");
      setEditingListName("");
      setEditingListError("");
    }
  };

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
          <UserAvatar
            photoURL={profile?.photoURL}
            fallbackText={(profile?.displayName || "К").charAt(0).toUpperCase()}
            imageClassName="-mt-12 h-24 w-24 rounded-full border-4 border-slate-900 object-cover shadow-xl"
            fallbackClassName="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-900 bg-blue-500 text-3xl font-bold text-white shadow-xl"
          />

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

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
          <ListVideo size={20} className="text-blue-400" />
          Мої списки
        </h2>
        <form
          onSubmit={handleCreateList}
          className="mb-4 flex max-w-xl flex-col gap-2 sm:flex-row">
          <label htmlFor="profile-custom-list-name" className="sr-only">
            Назва нового списку
          </label>
          <input
            id="profile-custom-list-name"
            value={newListName}
            onChange={(event) => {
              setNewListName(event.target.value);
              setNewListError("");
            }}
            maxLength={40}
            required
            placeholder="Наприклад, На вечір"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={!newListName.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={16} aria-hidden="true" />
            Створити список
          </button>
        </form>
        {newListError && (
          <p className="mb-3 text-sm text-rose-300" role="alert">
            {newListError}
          </p>
        )}
        {Object.keys(customLists).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(customLists).map(([id, name]) => (
              <div
                key={id}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
                {editingListId === id ? (
                  <form
                    onSubmit={(event) => handleRenameList(event, id)}
                    className="flex min-w-0 flex-wrap items-center gap-2">
                    <label htmlFor={`custom-list-name-${id}`} className="sr-only">
                      Нова назва списку «{name}»
                    </label>
                    <input
                      id={`custom-list-name-${id}`}
                      value={editingListName}
                      onChange={(event) => setEditingListName(event.target.value)}
                      maxLength={40}
                      required
                      autoFocus
                      className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white outline-none focus:border-blue-400"
                    />
                    <button
                      type="submit"
                      disabled={!editingListName.trim()}
                      aria-label={`Зберегти назву списку «${name}»`}
                      className="rounded-lg p-1 text-emerald-300 hover:bg-slate-800 disabled:opacity-50">
                      <Check size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingListId("");
                        setEditingListError("");
                      }}
                      aria-label="Скасувати редагування назви"
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                      <X size={16} aria-hidden="true" />
                    </button>
                    {editingListError && (
                      <p className="basis-full text-xs text-rose-300" role="alert">
                        {editingListError}
                      </p>
                    )}
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRequestedCustomListId(id);
                        setRequestedCustomListName("");
                      }}
                      aria-pressed={activeCustomListId === id}
                      className={`rounded-lg px-2 py-1 text-left transition-colors ${
                        activeCustomListId === id
                          ? "bg-blue-500/15 text-blue-200"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}>
                      <span className="block text-sm">{name}</span>
                      <span className="block text-xs text-slate-500">
                        {customListMediaIdsById[id]?.length || 0} фільмів
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEditingList(id, name)}
                      aria-label={`Змінити назву списку «${name}»`}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                      <Pencil size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteList(id, name)}
                      aria-label={`Видалити список «${name}»`}
                      className="rounded-lg p-1 text-slate-400 hover:bg-red-400/10 hover:text-red-300">
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-5 text-sm text-slate-400">
            Списків поки немає. Створіть перший за допомогою поля вище.
          </p>
        )}
      </section>

      {activeCustomListId && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-white">
            {customLists[activeCustomListId]}
          </h2>
          {activeCustomListMediaIds.length ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 xl:grid-cols-5">
              {activeCustomListMediaIds.map((mediaId) => (
                <ProfileMediaCard
                  key={`custom-${activeCustomListId}-${mediaId}`}
                  mediaId={mediaId}
                />
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-10 text-center text-sm text-slate-400">
              У цьому списку ще немає фільмів. Додайте їх кнопкою «+» на картці.
            </div>
          )}
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
