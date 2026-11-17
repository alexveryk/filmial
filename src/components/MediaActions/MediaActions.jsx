import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Heart, Pin, Plus } from "lucide-react";
import { useMediaState } from "../../context/MediaStateContext";

const defaultLists = [
  { id: 4, name: "Хочу подивитися", icon: Pin },
  { id: 3, name: "Улюблені", icon: Heart },
];

export const MediaActions = ({ items, variant = "card" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const { isWatched, getSelectedListIds, toggleWatched, toggleList } =
    useMediaState();
  const title = items.title || items.name || "Без назви";
  const watched = isWatched(items.id);
  const selectedListIds = getSelectedListIds(items.id);
  const isHero = variant === "hero";

  const handleToggleWatched = useCallback(() => {
    toggleWatched(items.id);
    setIsOpen(false);
  }, [items.id, toggleWatched]);

  const handleAddToList = useCallback(
    (listId) => {
      toggleList(items.id, listId);
      setIsOpen(false);
    },
    [items.id, toggleList]
  );

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const buttonBounds = buttonRef.current.getBoundingClientRect();
    const menuWidth = Math.min(224, window.innerWidth - 16);
    const menuHeight = (defaultLists.length + 1) * 40 + 16;
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
    const handleScroll = () => setIsOpen(false);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
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
        onClick={handleToggleWatched}
        aria-label={
          watched
            ? `Прибрати позначку перегляду для «${title}»`
            : `Позначити «${title}» як переглянутий`
        }
        aria-pressed={watched}
        title={watched ? "Вже дивився" : "Позначити як переглянутий"}
        className={`inline-flex min-w-0 items-center justify-center gap-1 rounded-lg font-semibold transition-colors ${
          isHero
            ? "gap-2 rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white backdrop-blur hover:bg-slate-800"
            : "h-9 w-9 rounded-xl border backdrop-blur transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
        } ${
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
              : "h-9 w-9 rounded-xl border border-blue-300/30 bg-blue-500/90 p-0 backdrop-blur transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          }`}
        >
          <Plus size={17} aria-hidden="true" />
          {isHero && <span>Додати до...</span>}
        </button>

        {isOpen &&
          menuPosition &&
          createPortal(
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[100] rounded-xl border border-white/10 bg-slate-900/95 p-2 text-left shadow-2xl shadow-black/50 backdrop-blur-xl"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
              }}
            >
              {defaultLists.map((list) => (
                <button
                  key={list.id}
                  type="button"
                  role="menuitemcheckbox"
                  onClick={() => handleAddToList(list.id)}
                  aria-checked={selectedListIds.includes(list.id)}
                  className="flex w-full items-center justify-between gap-5 rounded-lg px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <span className="flex items-center gap-2.5">
                    <list.icon size={16} aria-hidden="true" />
                    {list.name}
                  </span>
                  {selectedListIds.includes(list.id) && (
                    <Check
                      size={16}
                      className="ml-3 text-emerald-400"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
              <button
                type="button"
                role="menuitemcheckbox"
                onClick={handleToggleWatched}
                aria-checked={watched}
                className="flex w-full items-center justify-between gap-5 rounded-lg px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <span className="flex items-center gap-2.5">
                  <Check size={16} aria-hidden="true" />
                  Вже дивився
                </span>
                {watched && (
                  <Check
                    size={16}
                    className="ml-3 text-emerald-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
};
