import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Film, Plus, Search, Trash2, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { selectAuthUid } from "../../../features/auth/authSlice";
import { useSearchMoviesQuery } from "../../../services/tmdbApi";
import {
  getPublicProfile,
  loadFriendRequests,
} from "../../../services/firebaseFriends";
import {
  addMovieGroupMember,
  createMovieGroup,
  deleteMovieGroup,
  loadMovieGroups,
  removeMovieGroupMember,
  renameMovieGroup,
  subscribeMovieGroupMembers,
  subscribeUserMovieGroups,
  toggleMovieGroupPick,
} from "../../../services/firebaseMovieGroups";
import { UserAvatar } from "../../UserAvatar/UserAvatar";

const getFriendUid = (request, uid) =>
  request.fromUid === uid ? request.toUid : request.fromUid;

export const SharedMovieGroups = () => {
  const uid = useSelector(selectAuthUid);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState("");
  const [members, setMembers] = useState([]);
  const [membersGroupId, setMembersGroupId] = useState("");
  const [memberProfiles, setMemberProfiles] = useState({});
  const [groupName, setGroupName] = useState("");
  const [selectedFriendUids, setSelectedFriendUids] = useState([]);
  const [friendToAdd, setFriendToAdd] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [movieSearchInput, setMovieSearchInput] = useState("");
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const memberProfileCache = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [busyMovieId, setBusyMovieId] = useState("");

  const {
    data: movieSearchData,
    isFetching: isMovieSearchLoading,
    isError: isMovieSearchError,
  } = useSearchMoviesQuery(
    { query: movieSearchQuery },
    { skip: !movieSearchQuery },
  );

  const refreshGroups = useCallback(async () => {
    const nextGroups = await loadMovieGroups(uid);
    setGroups(nextGroups);
    setActiveGroupId((currentGroupId) =>
      nextGroups.some((group) => group.id === currentGroupId)
        ? currentGroupId
        : nextGroups[0]?.id || "",
    );
    return nextGroups;
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return undefined;
    }

    let active = true;
    let unsubscribeGroups = () => {};
    setIsLoading(true);

    void (async () => {
      try {
        const [nextGroups, requests] = await Promise.all([
          loadMovieGroups(uid),
          loadFriendRequests(uid),
        ]);
        if (!active) return;

        const friendUids = [
          ...new Set(
            requests
              .filter((request) => request.status === "accepted")
              .map((request) => getFriendUid(request, uid)),
          ),
        ];
        const nextFriends = await Promise.all(
          friendUids.map(async (friendUid) => ({
            uid: friendUid,
            ...(await getPublicProfile(friendUid)),
          })),
        );
        if (!active) return;

        setGroups(nextGroups);
        setFriends(nextFriends);
        setActiveGroupId((currentGroupId) =>
          nextGroups.some((group) => group.id === currentGroupId)
            ? currentGroupId
            : nextGroups[0]?.id || "",
        );
        unsubscribeGroups = subscribeUserMovieGroups(
          uid,
          (updatedGroups) => {
            if (!active) return;
            setGroups(updatedGroups);
            setActiveGroupId((currentGroupId) =>
              updatedGroups.some((group) => group.id === currentGroupId)
                ? currentGroupId
                : updatedGroups[0]?.id || "",
            );
          },
          (groupError) => {
            console.error("Не вдалося оновити список спільних груп:", groupError);
            if (active) {
              toast.error("Не вдалося оновити список груп.");
            }
          },
        );
      } catch (loadError) {
        console.error("Не вдалося завантажити спільні групи:", loadError);
        if (active) {
          toast.error("Не вдалося завантажити групи. Спробуйте оновити сторінку.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
      unsubscribeGroups();
    };
  }, [uid]);

  useEffect(() => {
    if (!activeGroupId) {
      setMembers([]);
      setMemberProfiles({});
      return undefined;
    }

    let active = true;
    let latestSnapshot = 0;
    setIsMembersLoading(true);
    setMembers([]);
    setMemberProfiles({});
    setMembersGroupId("");
    const unsubscribe = subscribeMovieGroupMembers(
      activeGroupId,
      (nextMembers) => {
        const currentSnapshot = ++latestSnapshot;
        const missingProfileUids = nextMembers
          .map((member) => member.uid)
          .filter((memberUid) => !memberProfileCache.current[memberUid]);
        void Promise.all(
          missingProfileUids.map(async (memberUid) => [
            memberUid,
            await getPublicProfile(memberUid),
          ]),
        )
          .then((profileEntries) => {
            if (!active || currentSnapshot !== latestSnapshot) return;
            Object.assign(
              memberProfileCache.current,
              Object.fromEntries(profileEntries),
            );
            setMembers(nextMembers);
            setMemberProfiles((currentProfiles) => ({
              ...currentProfiles,
              ...memberProfileCache.current,
            }));
            setMembersGroupId(activeGroupId);
          })
          .catch((loadError) => {
            console.error("Не вдалося завантажити профілі учасників:", loadError);
            if (active && currentSnapshot === latestSnapshot) {
              toast.error("Не вдалося завантажити профілі учасників.");
            }
          })
          .finally(() => {
            if (active && currentSnapshot === latestSnapshot) {
              setIsMembersLoading(false);
            }
          });
      },
      (loadError) => {
        console.error("Не вдалося завантажити склад групи:", loadError);
        if (active) {
          toast.error("Не вдалося завантажити склад групи.");
          setIsMembersLoading(false);
        }
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [activeGroupId]);

  const activeGroup = groups.find((group) => group.id === activeGroupId);
  const activeMembers = useMemo(
    () => (membersGroupId === activeGroupId ? members : []),
    [activeGroupId, members, membersGroupId],
  );
  const isGroupOwner = activeGroup?.ownerUid === uid;
  const ownMembership = activeMembers.find((member) => member.uid === uid);
  const selectedMovies = ownMembership?.selectedMovies || [];

  useEffect(() => {
    setRenameValue(activeGroup?.name || "");
  }, [activeGroup?.id, activeGroup?.name]);

  const moviesById = useMemo(() => {
    const movies = new Map();
    activeMembers.forEach((member) => {
      (member.selectedMovies || []).forEach((movie) => {
        const currentMovie = movies.get(movie.mediaId) || {
          ...movie,
          selectedBy: [],
        };
        currentMovie.selectedBy.push(member.uid);
        movies.set(movie.mediaId, currentMovie);
      });
    });

    return [...movies.values()].sort(
      (first, second) =>
        second.selectedBy.length - first.selectedBy.length ||
        first.title.localeCompare(second.title, "uk"),
    );
  }, [activeMembers]);
  const movieResults = (movieSearchData?.results || []).slice(0, 6);

  useEffect(() => {
    if (isMovieSearchError) {
      toast.error("Не вдалося знайти фільми.");
    }
  }, [isMovieSearchError, movieSearchQuery]);

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setBusyAction("create");
    try {
      const newGroupId = await createMovieGroup(
        uid,
        groupName,
        selectedFriendUids,
      );
      setGroupName("");
      setSelectedFriendUids([]);
      await refreshGroups();
      setActiveGroupId(newGroupId);
    } catch (createError) {
      console.error("Не вдалося створити групу:", createError);
      toast.error(createError.message || "Не вдалося створити групу.");
    } finally {
      setBusyAction("");
    }
  };

  const handleAddFriend = async () => {
    if (!activeGroupId || !friendToAdd) return;
    setBusyAction("add-member");
    try {
      await addMovieGroupMember(activeGroupId, friendToAdd);
      setFriendToAdd("");
    } catch (addError) {
      console.error("Не вдалося додати друга до групи:", addError);
      toast.error(addError.message || "Не вдалося додати друга до групи.");
    } finally {
      setBusyAction("");
    }
  };

  const handleRemoveMember = async (memberUid, isLeaving = false) => {
    if (
      !activeGroupId ||
      !window.confirm(
        isLeaving
          ? "Ви впевнені, що хочете покинути групу? Ваші вибрані фільми також буде прибрано."
          : "Ви впевнені, що хочете вилучити учасника з групи? Його вибрані фільми також буде прибрано.",
      )
    ) {
      return;
    }

    setBusyAction(`remove:${memberUid}`);
    try {
      await removeMovieGroupMember(activeGroupId, memberUid);
      if (isLeaving) {
        await refreshGroups();
      }
    } catch (removeError) {
      console.error("Не вдалося вилучити учасника групи:", removeError);
      toast.error(removeError.message || "Не вдалося вилучити учасника.");
    } finally {
      setBusyAction("");
    }
  };

  const handleRenameGroup = async (event) => {
    event.preventDefault();
    if (!activeGroupId) return;
    setBusyAction("rename");
    try {
      await renameMovieGroup(activeGroupId, renameValue);
      await refreshGroups();
      setRenameValue("");
    } catch (renameError) {
      console.error("Не вдалося перейменувати групу:", renameError);
      toast.error(renameError.message || "Не вдалося перейменувати групу.");
    } finally {
      setBusyAction("");
    }
  };

  const handleDeleteGroup = async () => {
    if (
      !activeGroupId ||
      !window.confirm("Видалити групу разом з усіма виборами учасників?")
    ) {
      return;
    }

    setBusyAction("delete-group");
    try {
      const deletedGroupId = activeGroupId;
      await deleteMovieGroup(deletedGroupId);
      const remainingGroups = groups.filter(
        (group) => group.id !== deletedGroupId,
      );
      setGroups(remainingGroups);
      setActiveGroupId((currentGroupId) =>
        currentGroupId === deletedGroupId
          ? remainingGroups[0]?.id || ""
          : currentGroupId,
      );
    } catch (deleteError) {
      console.error("Не вдалося видалити групу:", deleteError);
      toast.error(deleteError.message || "Не вдалося видалити групу.");
    } finally {
      setBusyAction("");
    }
  };

  const handleMovieSearch = (event) => {
    event.preventDefault();
    setMovieSearchQuery(movieSearchInput.trim());
  };

  const handleToggleMovie = async (movie, isSelected) => {
    if (!activeGroupId || !uid || !ownMembership) return;
    setBusyMovieId(String(movie.id));
    try {
      await toggleMovieGroupPick(activeGroupId, uid, movie, isSelected);
    } catch (pickError) {
      console.error("Не вдалося оновити вибір фільмів:", pickError);
      toast.error(pickError.message || "Не вдалося оновити вибір фільму.");
    } finally {
      setBusyMovieId("");
    }
  };

  if (!uid) {
    return (
      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
        Увійдіть у профіль, щоб створювати спільні кінодобірки.
      </section>
    );
  }

  return (
    <section
      className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7"
      aria-labelledby="movie-groups-heading">
      <div className="mb-5 flex items-center gap-3">
        <Users className="text-blue-400" size={22} />
        <div>
          <h2 id="movie-groups-heading" className="text-xl font-bold text-white">
            Спільні кінодобірки
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Створюйте окремі групи для сім’ї, друзів або родичів і знаходьте
            фільми, які сподобалися кільком учасникам.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleCreateGroup}
        className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
        <label
          htmlFor="movie-group-name"
          className="mb-2 block text-sm font-semibold text-slate-200">
          Нова група
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="movie-group-name"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            maxLength={40}
            placeholder="Наприклад, Сім’я"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={!groupName.trim() || busyAction === "create" || isLoading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={16} aria-hidden="true" />
            {busyAction === "create" ? "Створюємо..." : "Створити"}
          </button>
        </div>

        {isLoading ? (
          <p className="mt-3 text-xs text-slate-500">Завантажуємо друзів...</p>
        ) : friends.length > 0 ? (
          <fieldset className="mt-4">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Додати друзів
            </legend>
            <div className="flex flex-wrap gap-2">
              {friends.map((friend) => {
                const isSelected = selectedFriendUids.includes(friend.uid);
                return (
                  <label
                    key={friend.uid}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "border-blue-400/40 bg-blue-500/15 text-blue-200"
                        : "border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        setSelectedFriendUids((current) =>
                          isSelected
                            ? current.filter((friendUid) => friendUid !== friend.uid)
                            : [...current, friend.uid],
                        )
                      }
                      className="accent-blue-500"
                    />
                    {friend.displayName ||
                      (friend.username ? `@${friend.username}` : "Користувач")}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Щоб додати інших учасників, спершу додайте їх у друзі.
          </p>
        )}
      </form>

      {isLoading ? (
        <p className="mt-5 text-sm text-slate-400" role="status">
          Завантажуємо групи...
        </p>
      ) : groups.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-5 text-sm text-slate-400">
          Створіть групу або попросіть друга додати вас до його добірки.
        </p>
      ) : (
        <>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  setActiveGroupId(group.id);
                  setRenameValue(group.name);
                  setMovieSearchInput("");
                  setMovieSearchQuery("");
                }}
                aria-pressed={group.id === activeGroupId}
                className={`shrink-0 rounded-xl border px-4 py-3 text-left transition-colors ${
                  group.id === activeGroupId
                    ? "border-blue-400/40 bg-blue-500/10"
                    : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                }`}>
                <span className="block font-semibold text-white">
                  {group.name}
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  {group.ownerUid === uid ? "Ваша група" : "Група друга"}
                </span>
              </button>
            ))}
          </div>

          {activeGroup && (
            <div className="mt-4 min-w-0 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeGroup.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {activeMembers.length} учасників · фільми, вибрані щонайменше
                    двома, позначені як спільний інтерес.
                  </p>
                </div>
                {isGroupOwner ? (
                  <button
                    type="button"
                    onClick={handleDeleteGroup}
                    disabled={busyAction === "delete-group"}
                    className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-red-400/20 px-3 text-sm text-red-300 hover:bg-red-400/10 disabled:opacity-60">
                    <Trash2 size={15} aria-hidden="true" />
                    Видалити групу
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(uid, true)}
                    disabled={busyAction === `remove:${uid}`}
                    className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-slate-700 px-3 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-60">
                    <X size={15} aria-hidden="true" />
                    Покинути групу
                  </button>
                )}
              </div>

              {isGroupOwner && (
                <div className="mt-5 grid min-w-0 gap-4 border-t border-slate-800 pt-4 lg:grid-cols-2">
                  <form
                    onSubmit={handleRenameGroup}
                    className="flex min-w-0 flex-col gap-2 sm:flex-row">
                    <label htmlFor="rename-movie-group" className="sr-only">
                      Назва групи
                    </label>
                    <input
                      id="rename-movie-group"
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                      maxLength={40}
                      className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-blue-400"
                    />
                    <button
                      type="submit"
                      disabled={!renameValue.trim() || busyAction === "rename"}
                      className="min-h-10 rounded-xl border border-slate-700 px-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50">
                      Змінити назву
                    </button>
                  </form>

                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                    <label htmlFor="add-group-friend" className="sr-only">
                      Додати друга до групи
                    </label>
                    <select
                      id="add-group-friend"
                      value={friendToAdd}
                      onChange={(event) => setFriendToAdd(event.target.value)}
                      className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-white">
                      <option value="">Додати друга...</option>
                      {friends
                        .filter(
                          (friend) =>
                            !activeMembers.some(
                              (member) => member.uid === friend.uid,
                            ),
                        )
                        .map((friend) => (
                          <option key={friend.uid} value={friend.uid}>
                            {friend.displayName ||
                              (friend.username
                                ? `@${friend.username}`
                                : "Користувач")}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddFriend}
                      disabled={
                        !friendToAdd ||
                        busyAction === "add-member" ||
                        isMembersLoading
                      }
                      className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-blue-500 px-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">
                      <Plus size={15} aria-hidden="true" />
                      Додати
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {activeMembers.map((member) => {
                  const memberProfile = memberProfiles[member.uid];
                  return (
                    <span
                      key={member.uid}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200">
                      <UserAvatar
                        photoURL={memberProfile?.photoURL}
                        fallbackText={(
                          memberProfile?.displayName ||
                          memberProfile?.username ||
                          "?"
                        )
                          .charAt(0)
                          .toUpperCase()}
                        imageClassName="h-5 w-5 rounded-full object-cover"
                        fallbackClassName="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/30 text-[10px]"
                      />
                      {memberProfile?.displayName ||
                        (memberProfile?.username
                          ? `@${memberProfile.username}`
                          : "Користувач")}
                      {member.uid === activeGroup.ownerUid && " · власник"}
                      {isGroupOwner && member.uid !== uid && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.uid)}
                          disabled={busyAction === `remove:${member.uid}`}
                          aria-label={`Вилучити ${memberProfile?.displayName || "учасника"} з групи`}
                          className="ml-1 text-slate-400 hover:text-red-300 disabled:opacity-50">
                          <X size={13} aria-hidden="true" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>

              <form
                onSubmit={handleMovieSearch}
                className="mt-6 flex flex-col gap-2 border-t border-slate-800 pt-5 sm:flex-row">
                <label htmlFor="group-movie-search" className="sr-only">
                  Знайти фільм для групи
                </label>
                <input
                  id="group-movie-search"
                  value={movieSearchInput}
                  onChange={(event) => setMovieSearchInput(event.target.value)}
                  placeholder="Знайти фільм, щоб додати до добірки"
                  className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
                />
                <button
                  type="submit"
                  disabled={!movieSearchInput.trim() || isMovieSearchLoading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50">
                  <Search size={16} aria-hidden="true" />
                  {isMovieSearchLoading ? "Шукаємо..." : "Знайти"}
                </button>
              </form>

              {movieResults.length > 0 && (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {movieResults.map((movie) => {
                    const isSelected = selectedMovies.some(
                      (selection) => selection.mediaId === String(movie.id),
                    );
                    return (
                      <li
                        key={movie.id}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-2">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt=""
                            className="h-14 w-10 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <span className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-slate-800 text-slate-500">
                            <Film size={18} />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block line-clamp-2 text-sm font-medium text-slate-100">
                            {movie.title}
                          </span>
                          {movie.release_date && (
                            <span className="mt-1 block text-xs text-slate-500">
                              {movie.release_date.slice(0, 4)}
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          disabled={
                            busyMovieId === String(movie.id) ||
                            isMembersLoading ||
                            !ownMembership
                          }
                          onClick={() => handleToggleMovie(movie, isSelected)}
                          aria-label={
                            isSelected
                              ? `Прибрати «${movie.title}» зі своїх виборів`
                              : `Додати «${movie.title}» до своїх виборів`
                          }
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border disabled:opacity-50 ${
                            isSelected
                              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                              : "border-slate-700 text-slate-300 hover:border-blue-400/50 hover:text-blue-200"
                          }`}>
                          {isSelected ? (
                            <X size={16} aria-hidden="true" />
                          ) : (
                            <Plus size={16} aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-7 border-t border-slate-800 pt-5">
                <h4 className="mb-3 text-sm font-semibold text-slate-200">
                  Вибрані фільми ({moviesById.length})
                </h4>
                {isMembersLoading ? (
                  <p className="text-sm text-slate-400" role="status">
                    Завантажуємо вибори учасників...
                  </p>
                ) : moviesById.length ? (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {moviesById.map((movie) => {
                      const memberCount = movie.selectedBy.length;
                      const isMatch = memberCount >= 2;
                      return (
                        <li
                          key={movie.mediaId}
                          className={`flex min-w-0 gap-3 rounded-xl border p-3 ${
                            isMatch
                              ? "border-emerald-400/25 bg-emerald-500/5"
                              : "border-slate-800 bg-slate-900/60"
                          }`}>
                          <Link
                            to={`/movies/${movie.mediaId}`}
                            className="shrink-0">
                            {movie.posterPath ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                                alt=""
                                className="h-20 w-14 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="flex h-20 w-14 items-center justify-center rounded-lg bg-slate-800 text-slate-500">
                                <Film size={20} />
                              </span>
                            )}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/movies/${movie.mediaId}`}
                              className="line-clamp-2 text-sm font-semibold text-white hover:text-blue-300">
                              {movie.title}
                            </Link>
                            <p
                              className={`mt-1 text-xs ${
                                isMatch ? "text-emerald-300" : "text-slate-400"
                              }`}>
                              {isMatch ? "Спільний інтерес · " : ""}
                              {memberCount} із {activeMembers.length}{" "}
                              {activeMembers.length === 1
                                ? "учасника вибрав"
                                : "учасників вибрали"}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {movie.selectedBy
                                .map(
                                  (memberUid) =>
                                    memberProfiles[memberUid]?.displayName ||
                                    `@${memberProfiles[memberUid]?.username || "користувач"}`,
                                )
                                .join(", ")}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-5 text-sm text-slate-400">
                    У цій групі ще не вибрали фільмів. Знайдіть фільм вище, щоб
                    додати свій вибір.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

    </section>
  );
};
