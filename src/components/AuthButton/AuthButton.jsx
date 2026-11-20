import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { store } from "../../app/store";
import {
  deserializeMediaState,
  restoreMediaState,
  serializeMediaState,
} from "../../app/mediaPersistence";
import {
  clearAuthIdentity,
  selectAuthStatus,
  setAuthIdentity,
} from "../../features/auth/authSlice";
import {
  clearUserProfile,
  selectUserProfile,
  setUserProfile,
} from "../../features/user/userSlice";
import { clearFavorites } from "../../features/favorites/favoritesSlice";
import { clearWatched } from "../../features/watched/watchedSlice";
import { clearWatchLater } from "../../features/watchLater/watchLaterSlice";
import { clearWatchNow } from "../../features/watchNow/watchNowSlice";
import { clearCustomLists } from "../../features/customLists/customListsSlice";
import {
  initializeGoogleAuth,
  signOutFromGoogle,
} from "../../services/googleAuth";
import {
  loadCloudMediaState,
  saveCloudMediaState,
  setCloudMediaSyncUser,
  waitForCloudMediaWrites,
} from "../../services/firebaseMedia";
import { firebaseAuth, requireFirebaseAuth } from "../../services/firebase";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const clearSignedInMedia = (dispatch) => {
  dispatch(clearFavorites());
  dispatch(clearWatched());
  dispatch(clearWatchLater());
  dispatch(clearWatchNow());
  dispatch(clearCustomLists());
};

export const AuthButton = ({ className = "", isMobile = false, onAction }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const profile = useSelector(selectUserProfile);
  const tokenClientRef = useRef(null);
  const processedUidRef = useRef(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated") {
      tokenClientRef.current = null;
      setIsAuthReady(false);
      return undefined;
    }

    let active = true;
    setIsAuthReady(false);
    setAuthError("");

    initializeGoogleAuth(googleClientId, async (response) => {
      if (!active) return;
      if (response.error) {
        console.error("Не вдалося увійти через Google:", response.error);
        setAuthError(`Google не завершив авторизацію (${response.error}).`);
        setIsLoading(false);
        return;
      }

      try {
        const credential = GoogleAuthProvider.credential(
          null,
          response.access_token
        );
        await signInWithCredential(requireFirebaseAuth(), credential);
      } catch (error) {
        console.error("Не вдалося увійти через Firebase:", error);
        setAuthError(
          error.code === "auth/operation-not-allowed"
            ? "У Firebase не ввімкнено вхід через Google."
            : error.code === "auth/unauthorized-domain"
              ? "Додайте цей сайт до дозволених доменів у Firebase Authentication."
              : `Не вдалося увійти через Google (${error.code || "невідома помилка"}).`
        );
        setIsLoading(false);
      }
    })
      .then((tokenClient) => {
        if (!active) return;
        tokenClientRef.current = tokenClient;
        setIsAuthReady(true);
      })
      .catch((error) => {
        if (!active) return;
        console.error(error.message);
        setAuthError(error.message);
        setIsLoading(false);
      });

    return () => {
      active = false;
      tokenClientRef.current = null;
    };
  }, [status]);

  useEffect(() => {
    if (!firebaseAuth) return undefined;

    let active = true;
    let hasSeenAuthState = false;
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (firebaseUser) => {
        if (!active) return;

        if (!firebaseUser) {
          setCloudMediaSyncUser(null);
          processedUidRef.current = null;
          const wasInitialAuthState = !hasSeenAuthState;
          hasSeenAuthState = true;
          if (store.getState().auth.uid) {
            dispatch(clearAuthIdentity());
            dispatch(clearUserProfile());
            if (!wasInitialAuthState) {
              clearSignedInMedia(dispatch);
            }
            if (window.location.pathname === "/profile") {
              navigate("/");
            }
          }
          return;
        }

        hasSeenAuthState = true;
        if (processedUidRef.current === firebaseUser.uid) return;
        processedUidRef.current = firebaseUser.uid;
        setCloudMediaSyncUser(null);

        void (async () => {
          const isCurrentUser = () =>
            active && processedUidRef.current === firebaseUser.uid;
          const currentState = store.getState();
          const canReuseLocalData =
            !currentState.auth.uid || currentState.auth.uid === firebaseUser.uid;

          if (currentState.auth.uid && !canReuseLocalData) {
            dispatch(clearAuthIdentity());
            dispatch(clearUserProfile());
            clearSignedInMedia(dispatch);
          }

          try {
            const cloudMediaState = await loadCloudMediaState(firebaseUser.uid);
            if (!isCurrentUser()) return;

            if (cloudMediaState) {
              dispatch(restoreMediaState(deserializeMediaState(cloudMediaState)));
            } else {
              const mediaState = serializeMediaState(store.getState());
              await saveCloudMediaState(firebaseUser.uid, mediaState);
            }

            if (!isCurrentUser()) return;
            setCloudMediaSyncUser(firebaseUser.uid);
            dispatch(setAuthIdentity(firebaseUser.uid));
            dispatch(
              setUserProfile({
                displayName: firebaseUser.displayName || null,
                email: firebaseUser.email || null,
                photoURL: firebaseUser.photoURL || null,
              })
            );
            setIsLoading(false);
          } catch (error) {
            console.error("Не вдалося синхронізувати списки з Firebase:", error);
            if (!isCurrentUser()) return;

            dispatch(setAuthIdentity(firebaseUser.uid));
            dispatch(
              setUserProfile({
                displayName: firebaseUser.displayName || null,
                email: firebaseUser.email || null,
                photoURL: firebaseUser.photoURL || null,
              })
            );
            setIsLoading(false);
          }
        })();
      },
      (error) => {
        console.error("Не вдалося перевірити авторизацію Firebase:", error);
        setAuthError("Не вдалося перевірити вхід у Firebase.");
        setIsLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleSignIn = () => {
    if (!tokenClientRef.current) {
      setAuthError("Google ще підключається. Спробуйте натиснути ще раз.");
      return;
    }
    setAuthError("");
    setIsLoading(true);
    try {
      tokenClientRef.current.requestAccessToken();
    } catch (error) {
      console.error("Не вдалося відкрити вхід через Google:", error);
      setAuthError("Не вдалося відкрити вхід через Google. Спробуйте ще раз.");
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    try {
      await waitForCloudMediaWrites();
    } catch (error) {
      console.error("Не вдалося зберегти списки перед виходом:", error);
    }

    try {
      signOutFromGoogle();
      await firebaseSignOut(requireFirebaseAuth());
    } catch (error) {
      console.error("Не вдалося вийти з Firebase:", error);
    }
  };

  if (status === "authenticated") {
    const displayName = profile?.displayName || "Користувач";

    return (
      <div ref={menuRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          className={`inline-flex h-11 items-center gap-2 border border-slate-700/90 bg-slate-900/80 px-2 pr-3 text-left shadow-lg shadow-black/10 transition-colors hover:border-blue-400/40 hover:bg-slate-800/90 ${
            isMobile
              ? "w-full rounded-xl"
              : "rounded-full"
          }`}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full border border-slate-600"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className={`truncate text-sm font-semibold text-slate-100 ${
            isMobile ? "block max-w-[220px]" : "hidden max-w-28 xl:block"
          }`}>
            {displayName}
          </span>
          <ChevronDown
            size={15}
            className={`shrink-0 text-slate-400 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            } ${isMobile ? "ml-auto" : ""}`}
          />
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            className={`z-50 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/50 ${
              isMobile
                ? "relative mt-2 w-full"
                : "absolute right-0 top-[calc(100%+10px)] w-72"
            }`}>
            <div className="mb-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-full border border-slate-600"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {displayName}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Авторизовано
                </p>
              </div>
            </div>

            <Link
              to="/profile"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                onAction?.();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-blue-300">
              <UserRound size={18} className="text-blue-400" />
              Профіль
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white">
              <LogOut size={18} className="text-red-400" />
              Вийти
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading || !isAuthReady}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-600/80 px-4 text-sm font-semibold text-white transition-colors hover:border-slate-500 hover:bg-slate-800/30 disabled:cursor-wait disabled:opacity-60 ${className}`}>
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.23-.16-1.8H9v3.4h4.84a4.14 4.14 0 0 1-1.8 2.72v2.22h2.92c1.71-1.58 2.68-3.9 2.68-6.54Z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.22c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.7H.96v2.29A9 9 0 0 0 9 18Z"/>
          <path fill="#FBBC05" d="M3.96 10.76A5.4 5.4 0 0 1 3.68 9c0-.61.1-1.21.28-1.76V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3-2.29Z"/>
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A8.64 8.64 0 0 0 9 0 9 9 0 0 0 .96 4.95l3 2.29C4.67 5.16 6.66 3.58 9 3.58Z"/>
        </svg>
        <span>
          {isLoading
            ? "Завантаження…"
            : isAuthReady
              ? "Увійти через Google"
              : "Підключення до Google…"}
        </span>
      </button>
      {authError && (
        <p role="alert" className="mt-2 max-w-64 text-xs text-red-300">
          {authError}
        </p>
      )}
    </>
  );
};
