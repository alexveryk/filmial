import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Plus } from "lucide-react";
import { useMediaState } from "../../context/MediaStateContext";

const defaultLists = [
  { id: 1, name: "Комедії" },
  { id: 2, name: "Романтичні" },
  { id: 3, name: "Улюблені" },
  { id: 4, name: "Планую подивитися" },
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
    const menuHeight = defaultLists.length * 36 + 16;
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

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`items-center ${
        isHero
          ? "flex flex-wrap gap-3"
          : "grid grid-cols-1 gap-1.5 sm:gap-2 xl:grid-cols-[1fr_auto]"
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
        className={`inline-flex min-w-0 items-center justify-center gap-1 rounded-lg font-semibold transition-colors ${
          isHero
            ? "gap-2 rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white backdrop-blur hover:bg-slate-800"
            : "gap-1 px-2 py-2 text-[11px] sm:gap-1.5 sm:px-2.5 sm:text-xs xl:gap-1 xl:px-1.5 xl:text-[10px]"
        } ${
          watched
            ? "border-emerald-400 bg-emerald-500 text-white hover:bg-emerald-400"
            : isHero
              ? ""
              : "border border-white/15 bg-slate-950/80 text-slate-100 backdrop-blur hover:bg-slate-800"
        }`}
      >
        {watched ? (
          <Check size={isHero ? 17 : 14} aria-hidden="true" />
        ) : (
          <span aria-hidden="true">○</span>
        )}
        <span className="whitespace-nowrap">Дивився</span>
      </button>

      <div className={`relative ${isHero ? "" : "min-w-0"}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label={`Додати «${title}» до списку`}
          className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-blue-500 font-semibold text-white transition-colors hover:bg-blue-400 ${
            isHero
              ? "gap-2 rounded-xl px-4 py-3 text-sm"
              : "w-full px-2 py-2 text-[11px] sm:gap-1.5 sm:px-2.5 sm:text-xs xl:gap-1 xl:px-1.5 xl:text-[10px]"
          }`}
        >
          <Plus size={isHero ? 17 : 14} aria-hidden="true" />
          <span>Додати до...</span>
        </button>

        {isOpen &&
          menuPosition &&
          createPortal(
            <div
              ref={menuRef}
              className="fixed z-[100] rounded-xl border border-slate-700 bg-slate-900 p-2 text-left shadow-2xl"
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
                  onClick={() => handleAddToList(list.id)}
                  aria-pressed={selectedListIds.includes(list.id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <span>{list.name}</span>
                  {selectedListIds.includes(list.id) && (
                    <Check
                      size={16}
                      className="ml-3 text-emerald-400"
                      aria-label="Додано до списку"
                    />
                  )}
                </button>
              ))}
            </div>,
            document.body
          )}
      </div>
    </div>
  );
};
