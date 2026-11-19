import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const AuthButton = ({ className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const profile = useSelector(selectUserProfile);
  const tokenClientRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated") return;

    initializeGoogleAuth(googleClientId, async (response) => {
      if (response.error) {
        console.error("Не вдалося увійти через Google:", response.error);
        setIsLoading(false);
        return;
      }

      try {
        const userResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error("Не вдалося отримати профіль Google");
        }

        const payload = await userResponse.json();
        dispatch(setAuthIdentity(payload.sub));
        dispatch(
          setUserProfile({
            displayName: payload.name || null,
            email: payload.email || null,
            photoURL: payload.picture || null,
          })
        );
      } catch (error) {
        console.error(error.message);
      } finally {
        setIsLoading(false);
      }
    })
      .then((tokenClient) => {
        tokenClientRef.current = tokenClient;
      })
      .catch((error) => {
        console.error(error.message);
        setIsLoading(false);
      });
  }, [dispatch, status]);

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
    if (!tokenClientRef.current) return;
    setIsLoading(true);
    tokenClientRef.current.requestAccessToken();
  };

  const handleSignOut = () => {
    setIsMenuOpen(false);
    signOutFromGoogle();
    dispatch(clearAuthIdentity());
    dispatch(clearUserProfile());
    dispatch(clearFavorites());
    dispatch(clearWatched());
    dispatch(clearWatchLater());
    dispatch(clearWatchNow());
    dispatch(clearCustomLists());
    localStorage.removeItem("filmial-media-state");

    if (window.location.pathname === "/profile") {
      navigate("/");
    }
  };

  if (status === "authenticated") {
    const displayName = profile?.displayName || "Користувач";

    return (
      <div ref={menuRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-700/90 bg-slate-900/80 px-2 pr-3 text-left shadow-lg shadow-black/10 transition-colors hover:border-blue-400/40 hover:bg-slate-800/90"
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
          <span className="hidden max-w-28 truncate text-sm font-semibold text-slate-100 xl:block">
            {displayName}
          </span>
          <ChevronDown
            size={15}
            className={`shrink-0 text-slate-400 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/50">
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
              onClick={() => setIsMenuOpen(false)}
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
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
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
      <span>{isLoading ? "Завантаження…" : "Увійти через Google"}</span>
    </button>
  );
};
