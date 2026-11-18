import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Eye, Heart, Pin, Plus, FolderPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectIsFavorite,
  toggleFavorite,
} from "../../features/favorites/favoritesSlice";
import {
  selectIsWatchLater,
  toggleWatchLater,
} from "../../features/watchLater/watchLaterSlice";
import {
  selectIsWatched,
  toggleWatched,
} from "../../features/watched/watchedSlice";
import {
  selectIsWatchNow,
  toggleWatchNow,
} from "../../features/watchNow/watchNowSlice";
import {
  createCustomList,
  selectCustomListIds,
  selectCustomLists,
  toggleCustomList,
} from "../../features/customLists/customListsSlice";

const isReleased = (item) => {
  const date = item.release_date || item.first_air_date;
  if (!date) return true;
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsedDate <= today;
};

export const MediaActions = ({ items, variant = "card" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const menuRef = useRef(null);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const dispatch = useAppDispatch();
  const title = items.title || items.name || "Без назви";
  const watched = useAppSelector((state) => selectIsWatched(state, items.id));
  const isFavorite = useAppSelector((state) =>
    selectIsFavorite(state, items.id)
  );
  const isWatchLater = useAppSelector((state) =>
    selectIsWatchLater(state, items.id)
  );
  const isWatchNow = useAppSelector((state) =>
    selectIsWatchNow(state, items.id)
  );
  const customListIds = useAppSelector((state) =>
    selectCustomListIds(state, items.id)
  );
  const customLists = useAppSelector(selectCustomLists);
  const selectedListIds = [
    ...(isWatchNow ? ["watch-now"] : []),
    ...(isWatchLater ? [4] : []),
    ...(isFavorite ? [3] : []),
    ...customListIds,
  ];
  const isHero = variant === "hero";
  const mediaIsReleased = isReleased(items);

  const handleToggleWatched = useCallback(() => {
    dispatch(toggleWatched(items.id));
  }, [dispatch, items.id]);

  const handleToggleWatchNow = useCallback(() => {
    dispatch(toggleWatchNow(items.id));
  }, [dispatch, items.id]);

  const handleToggleWatchLater = useCallback(() => {
    dispatch(toggleWatchLater(items.id));
  }, [dispatch, items.id]);

  const handleToggleFavorite = useCallback(() => {
    dispatch(toggleFavorite(items.id));
  }, [dispatch, items.id]);

  const handleCreateList = (event) => {
    event.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    dispatch(createCustomList(name));
    setNewListName("");
  };

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const buttonBounds = buttonRef.current.getBoundingClientRect();
    const menuWidth = Math.min(280, window.innerWidth - 16);
    const menuHeight = Math.min(
      window.innerHeight - 16,
      56 + (4 + customLists.length) * 44 + 58,
    );
    const top =
      buttonBounds.top >= menuHeight + 8
        ? buttonBounds.top - menuHeight - 8
        : buttonBounds.bottom + 8;
    const boundedTop = Math.max(
      8,
      Math.min(top, window.innerHeight - menuHeight - 8)
    );

    setMenuPosition({
      top: boundedTop,
      left: Math.max(
        8,
        Math.min(buttonBounds.right - menuWidth, window.innerWidth - menuWidth - 8)
      ),
      width: menuWidth,
    });
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !rootRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleViewportChange = (event) => {
      if (event?.type === "scroll" && menuRef.current?.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`items-center ${
        isHero
          ? "flex flex-wrap gap-3"
          : "flex gap-2"
      }`}
    >
      <button
        type="button"
        onClick={mediaIsReleased ? handleToggleWatched : undefined}
        disabled={!mediaIsReleased}
        aria-label={
          watched
            ? `Прибрати позначку перегляду для «${title}»`
            : `Позначити «${title}» як переглянутий`
        }
        aria-pressed={watched}
        title={
          !mediaIsReleased
            ? "Тайтл ще не вийшов"
            : watched
              ? "Вже дивився"
              : "Позначити як переглянутий"
        }
        className={`inline-flex min-w-0 items-center justify-center gap-1 rounded-lg font-semibold transition-colors ${
          isHero
            ? "gap-2 rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white backdrop-blur hover:bg-slate-800"
            : "h-9 w-9 rounded-xl border backdrop-blur transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
        } ${!mediaIsReleased ? "cursor-not-allowed opacity-50" : ""} ${
          watched
            ? "border-emerald-400/50 bg-emerald-500/90 text-white hover:bg-emerald-400"
            : isHero
              ? ""
              : "border-white/20 bg-slate-950/70 text-slate-200 hover:border-emerald-400/50 hover:text-emerald-300"
        }`}
      >
        {watched ? (
          <Check size={isHero ? 17 : 16} aria-hidden="true" />
        ) : (
          <span className="text-lg leading-none" aria-hidden="true">○</span>
        )}
        {isHero && <span className="whitespace-nowrap">Дивився</span>}
      </button>

      <div className={`relative ${isHero ? "" : "min-w-0"}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={`Додати «${title}» до списку`}
          title="Додати до списку"
          className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg font-semibold text-white transition-colors hover:bg-blue-400 ${
            isHero
              ? "gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm"
              : `relative h-9 w-9 rounded-xl border p-0 backdrop-blur transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
                  selectedListIds.length
                    ? "border-emerald-300/50 bg-emerald-500/90"
                    : "border-blue-300/30 bg-blue-500/90"
                }`
          }`}
        >
          {selectedListIds.length ? (
            <Check size={17} aria-hidden="true" />
          ) : (
            <Plus size={17} aria-hidden="true" />
          )}
          {isHero && <span>Додати до...</span>}
        </button>

        {isOpen &&
          menuPosition &&
          createPortal(
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[100] max-h-[calc(100vh-16px)] overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-slate-900/95 p-2 text-left shadow-2xl shadow-black/50 backdrop-blur-xl"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
              }}
            >
              {[
                {
                  id: "watch-now",
                  name: "Дивлюся зараз",
                  icon: Eye,
                  checked: isWatchNow,
                  onClick: handleToggleWatchNow,
                },
                {
                  id: 4,
                  name: "Буду дивитися",
                  icon: Pin,
                  checked: isWatchLater,
                  onClick: handleToggleWatchLater,
                },
                {
                  id: "watched",
                  name: "Переглянуто",
                  icon: Check,
                  checked: watched,
                  onClick: handleToggleWatched,
                  disabled: !mediaIsReleased,
                },
                {
                  id: 3,
                  name: "Улюблене",
                  icon: Heart,
                  checked: isFavorite,
                  onClick: handleToggleFavorite,
                },
              ].map((list) => (
                <button
                  key={list.id}
                  type="button"
                  role="menuitemcheckbox"
                  onClick={list.disabled ? undefined : list.onClick}
                  disabled={list.disabled}
                  aria-checked={list.checked}
                  className="flex w-full items-center justify-between gap-5 rounded-lg px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <span className="flex items-center gap-2.5">
                    <list.icon size={16} aria-hidden="true" />
                    {list.name}
                  </span>
                  {list.checked && (
                    <Check
                      size={16}
                      className="ml-3 text-emerald-400"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
              {customLists.length > 0 && (
                <div className="my-1 border-t border-slate-800" />
              )}
              {customLists.map((list) => {
                const checked = customListIds.includes(list.id);
                return (
                  <button
                    key={list.id}
                    type="button"
                    role="menuitemcheckbox"
                    onClick={() =>
                      dispatch(toggleCustomList({
                        mediaId: items.id,
                        listId: list.id,
                      }))
                    }
                    aria-checked={checked}
                    className="flex w-full items-center justify-between gap-5 rounded-lg px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-white">
                    <span className="flex items-center gap-2.5">
                      <FolderPlus size={16} aria-hidden="true" />
                      {list.name}
                    </span>
                    {checked && (
                      <Check
                        size={16}
                        className="ml-3 text-emerald-400"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
              <form
                onSubmit={handleCreateList}
                className="mt-1 flex gap-2 border-t border-slate-800 pt-2">
                <input
                  value={newListName}
                  onChange={(event) => setNewListName(event.target.value)}
                  aria-label="Назва нового списку"
                  placeholder="Новий список..."
                  maxLength={40}
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
                />
                <button
                  type="submit"
                  disabled={!newListName.trim()}
                  aria-label="Створити список"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50">
                  <Plus size={17} aria-hidden="true" />
                </button>
              </form>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
};
