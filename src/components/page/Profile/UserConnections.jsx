import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { Check, Search, UserMinus, UserPlus, Users, X } from "lucide-react";
import { selectAuthUid } from "../../../features/auth/authSlice";
import {
  selectUserProfile,
  setUserProfile,
} from "../../../features/user/userSlice";
import { UserAvatar } from "../../UserAvatar/UserAvatar";
import {
  acceptFriendRequest,
  claimUsername,
  deleteFriendRequest,
  getPublicProfile,
  isValidUsername,
  loadFriendRequests,
  normalizeUsername,
  removeFriend,
  searchUsersByUsername,
  sendFriendRequest,
  syncPublicProfile,
} from "../../../services/firebaseFriends";

const getDisplayName = (profile) => profile?.displayName || profile?.username;

export const UserConnections = () => {
  const uid = useSelector(selectAuthUid);
  const profile = useSelector(selectUserProfile);
  const dispatch = useDispatch();
  const displayName = profile?.displayName;
  const email = profile?.email;
  const photoURL = profile?.photoURL;
  const [usernameDraft, setUsernameDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendProfiles, setFriendProfiles] = useState({});
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isFriendsLoading, setIsFriendsLoading] = useState(true);
  const [isClaimingUsername, setIsClaimingUsername] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);
  const [searchError, setSearchError] = useState("");

  const refreshFriendData = useCallback(async () => {
    const requests = await loadFriendRequests(uid);
    setFriendRequests(requests);

    const relatedUserIds = [
      ...new Set(
        requests.map((request) =>
          request.fromUid === uid ? request.toUid : request.fromUid,
        ),
      ),
    ];
    const relatedProfiles = await Promise.all(
      relatedUserIds.map(async (userId) => [
        userId,
        await getPublicProfile(userId),
      ]),
    );
    setFriendProfiles(Object.fromEntries(relatedProfiles));
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setIsProfileLoading(false);
      setIsFriendsLoading(false);
      return undefined;
    }

    let active = true;
    setIsProfileLoading(true);
    setIsFriendsLoading(true);

    void (async () => {
      try {
        const publicProfile = await syncPublicProfile(uid, {
          displayName,
          photoURL,
        });
        if (!active) return;
        dispatch(
          setUserProfile({
            displayName,
            email,
            photoURL: publicProfile?.photoURL || photoURL || null,
            username: publicProfile?.username || null,
          }),
        );
      } catch (loadError) {
        console.error("Не вдалося завантажити публічний профіль:", loadError);
        if (active) {
          toast.error("Не вдалося завантажити профіль. Спробуйте оновити сторінку.");
        }
      } finally {
        if (active) setIsProfileLoading(false);
      }

      try {
        await refreshFriendData();
      } catch (loadError) {
        console.error("Не вдалося завантажити список друзів:", loadError);
        if (active) {
          toast.error("Не вдалося завантажити список друзів.");
        }
      } finally {
        if (active) setIsFriendsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [dispatch, displayName, email, photoURL, refreshFriendData, uid]);

  const acceptedRequests = useMemo(
    () => friendRequests.filter((request) => request.status === "accepted"),
    [friendRequests],
  );
  const incomingRequests = useMemo(
    () =>
      friendRequests.filter(
        (request) => request.toUid === uid && request.status === "pending",
      ),
    [friendRequests, uid],
  );

  const getRelationship = (otherUid) => {
    const relationship = friendRequests.find(
      (request) =>
        (request.fromUid === uid && request.toUid === otherUid) ||
        (request.fromUid === otherUid && request.toUid === uid),
    );

    if (relationship?.status === "accepted") return { type: "friend", relationship };
    if (relationship?.status === "pending" && relationship.toUid === uid) {
      return { type: "incoming", relationship };
    }
    if (relationship?.status === "pending") {
      return { type: "outgoing", relationship };
    }
    return { type: "none", relationship: null };
  };

  const handleClaimUsername = async (event) => {
    event.preventDefault();
    const username = normalizeUsername(usernameDraft);
    if (!isValidUsername(username)) {
      toast.warning("Введіть 3–20 символів: латинські літери, цифри або _.");
      return;
    }

    setIsClaimingUsername(true);
    try {
      const claimedUsername = await claimUsername(uid, username, profile || {});
      dispatch(setUserProfile({ ...profile, username: claimedUsername }));
    } catch (claimError) {
      console.error("Не вдалося встановити username:", claimError);
      toast.error(claimError.message || "Не вдалося встановити username.");
    } finally {
      setIsClaimingUsername(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setSearchError("");
    if (normalizeUsername(searchTerm).length < 2) {
      setSearchResults([]);
      const message = "Введіть щонайменше 2 символи для пошуку.";
      setSearchError(message);
      toast.warning(message);
      return;
    }

    setIsSearching(true);
    try {
      setSearchResults(await searchUsersByUsername(searchTerm, uid));
    } catch (searchFailure) {
      console.error("Не вдалося знайти користувачів:", searchFailure);
      const message = "Не вдалося виконати пошук. Спробуйте ще раз.";
      setSearchError(message);
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRelationshipAction = async (userId, action, requestId) => {
    setBusyUserId(userId);
    try {
      if (action === "send") await sendFriendRequest(uid, userId);
      if (action === "accept") await acceptFriendRequest(requestId);
      if (action === "delete") await deleteFriendRequest(requestId);
      if (action === "remove") await removeFriend(uid, userId);
      await refreshFriendData();
    } catch (actionError) {
      console.error("Не вдалося оновити список друзів:", actionError);
      toast.error(actionError.message || "Не вдалося оновити список друзів.");
    } finally {
      setBusyUserId(null);
    }
  };

  if (!uid) {
    return (
      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
        Увійдіть у профіль, щоб шукати друзів.
      </section>
    );
  }

  return (
    <section
      className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7"
      aria-labelledby="friends-heading">
      <div className="mb-5 flex items-center gap-3">
        <Users className="text-blue-400" size={22} />
        <div>
          <h2 id="friends-heading" className="text-xl font-bold text-white">
            Друзі
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Знаходьте знайомих і надсилайте запити в друзі.
          </p>
        </div>
      </div>

      {isProfileLoading ? (
        <p className="text-sm text-slate-400" role="status">
          Завантажуємо профіль...
        </p>
      ) : !profile?.username ? (
        <form
          className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
          onSubmit={handleClaimUsername}>
          <label
            htmlFor="profile-username"
            className="mb-2 block text-sm font-medium text-slate-200">
            Створіть username для пошуку
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="profile-username"
              autoComplete="username"
              maxLength={20}
              value={usernameDraft}
              onChange={(event) => setUsernameDraft(event.target.value)}
              placeholder="наприклад, film_fan"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={isClaimingUsername}
              className="min-h-11 rounded-xl bg-blue-500 px-5 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-wait disabled:opacity-60">
              {isClaimingUsername ? "Зберігаємо..." : "Зберегти username"}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Username має містити 3–20 латинських літер, цифр або _ і не може
            бути змінений.
          </p>
        </form>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-400">
            Вас можна знайти за{" "}
            <span className="font-semibold text-blue-300">
              @{profile.username}
            </span>
          </p>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSearch}>
            <label htmlFor="user-search" className="sr-only">
              Пошук за username
            </label>
            <input
              id="user-search"
              autoComplete="off"
              maxLength={20}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Знайти за username"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 text-sm font-semibold text-white hover:border-slate-600 disabled:cursor-wait disabled:opacity-60">
              <Search size={16} aria-hidden="true" />
              {isSearching ? "Шукаємо..." : "Шукати"}
            </button>
          </form>

          {searchResults.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950/50">
              {searchResults.map((result) => {
                const relationship = getRelationship(result.uid);
                const isBusy = busyUserId === result.uid;
                return (
                  <li
                    key={result.uid}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <UserSummary user={result} />
                    <RelationshipButton
                      relationship={relationship}
                      disabled={isBusy}
                      onAction={(action) =>
                        handleRelationshipAction(
                          result.uid,
                          action,
                          relationship.relationship?.id,
                        )
                      }
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {!isSearching &&
            searchTerm.trim().length >= 2 &&
            !searchError &&
            searchResults.length === 0 && (
              <p className="mt-4 text-sm text-slate-400">
                Користувачів із таким username не знайдено.
              </p>
            )}

          {incomingRequests.length > 0 && (
            <div className="mt-7">
              <h3 className="mb-3 text-sm font-semibold text-slate-200">
                Запити в друзі ({incomingRequests.length})
              </h3>
              <ul className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950/50">
                {incomingRequests.map((request) => (
                  <li
                    key={request.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <UserSummary user={friendProfiles[request.fromUid]} />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyUserId === request.fromUid}
                        onClick={() =>
                          handleRelationshipAction(
                            request.fromUid,
                            "accept",
                            request.id,
                          )
                        }
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60">
                        <Check size={16} />
                        Прийняти
                      </button>
                      <button
                        type="button"
                        disabled={busyUserId === request.fromUid}
                        onClick={() =>
                          handleRelationshipAction(
                            request.fromUid,
                            "delete",
                            request.id,
                          )
                        }
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700 px-4 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-60">
                        <X size={16} />
                        Відхилити
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-7">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">
              Мої друзі ({acceptedRequests.length})
            </h3>
            {isFriendsLoading ? (
              <p className="text-sm text-slate-400" role="status">
                Завантажуємо друзів...
              </p>
            ) : acceptedRequests.length ? (
              <ul className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950/50">
                {acceptedRequests.map((request) => {
                  const friendUid =
                    request.fromUid === uid ? request.toUid : request.fromUid;
                  const friend = friendProfiles[friendUid];
                  return (
                    <li
                      key={request.id}
                      className="flex items-center justify-between gap-3 p-4">
                      <UserSummary user={friend} />
                      <button
                        type="button"
                        disabled={busyUserId === friendUid}
                        onClick={() =>
                          handleRelationshipAction(friendUid, "remove")
                        }
                        aria-label={`Видалити ${getDisplayName(friend) || "користувача"} з друзів`}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700 px-3 text-sm text-slate-300 hover:border-red-400/50 hover:text-red-300 disabled:opacity-60">
                        <UserMinus size={16} />
                        <span className="hidden sm:inline">Видалити</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-5 text-sm text-slate-400">
                Ви ще нікого не додали в друзі.
              </p>
            )}
          </div>
        </>
      )}

    </section>
  );
};

const UserSummary = ({ user }) => (
  <div className="flex min-w-0 items-center gap-3">
    <UserAvatar
      photoURL={user?.photoURL}
      fallbackText={(getDisplayName(user) || "?").charAt(0).toUpperCase()}
      imageClassName="h-10 w-10 shrink-0 rounded-full object-cover"
      fallbackClassName="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-200"
    />
    <span className="min-w-0">
      <span className="block truncate text-sm font-semibold text-white">
        {getDisplayName(user) || "Користувач"}
      </span>
      {user?.username && (
        <span className="block truncate text-xs text-slate-400">
          @{user.username}
        </span>
      )}
    </span>
  </div>
);

const RelationshipButton = ({ relationship, disabled, onAction }) => {
  if (relationship.type === "friend") {
    return (
      <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 text-sm text-emerald-300 sm:self-auto">
        <Check size={16} />
        У друзях
      </span>
    );
  }

  if (relationship.type === "incoming") {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAction("accept")}
        className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60 sm:self-auto">
        <Check size={16} />
        Прийняти запит
      </button>
    );
  }

  if (relationship.type === "outgoing") {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAction("delete")}
        className="min-h-10 self-start rounded-xl border border-slate-700 px-4 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-60 sm:self-auto">
        Скасувати запит
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onAction("send")}
      className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-200 hover:bg-blue-500/20 disabled:opacity-60 sm:self-auto">
      <UserPlus size={16} />
      Додати в друзі
    </button>
  );
};
