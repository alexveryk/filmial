import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaState } from "../../context/MediaStateContext";

const defaultLists = [
  { id: 1, name: "Комедії" },
  { id: 2, name: "Романтичні" },
  { id: 3, name: "Улюблені" },
  { id: 4, name: "Планую подивитися" },
];

export const MediaCard = ({
  items,
  lists = defaultLists,
  onAddToList,
  onToggleWatched,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { isWatched, getSelectedListIds, toggleWatched, toggleList } =
    useMediaState();
  const watched = isWatched(items.id);
  const selectedListIds = getSelectedListIds(items.id);

  const handleToggleWatched = useCallback(() => {
    const nextValue = !watched;
    toggleWatched(items.id);

    if (onToggleWatched) {
      onToggleWatched(items.id, nextValue);
    }
  }, [items.id, onToggleWatched, toggleWatched, watched]);

  const handleAddToList = useCallback(
    (listId) => {
      toggleList(items.id, listId);

      if (onAddToList) {
        onAddToList(items.id, listId);
      }

      setIsOpen(false);
    },
    [items.id, onAddToList, toggleList]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`group relative w-full overflow-visible rounded-xl bg-gray-800 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isOpen ? "z-50" : "z-0"
      }`}
    >
      <div className="relative">
        <img
          className="h-[420px] w-full rounded-t-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          src={`https://image.tmdb.org/t/p/w500/${items.poster_path}`}
          alt={items.title || items.name || "Movie Poster"}
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950 via-gray-900/65 to-transparent p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                handleToggleWatched();
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                watched
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {watched ? "✓ Дивився" : "○ Дивився"}
            </button>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setIsOpen((prev) => !prev);
                }}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500"
              >
                Додати до...
              </button>

              {isOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] z-[9999] w-56 rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-2xl"
                  style={{ animation: "fadeIn 0.2s ease-out" }}
                >
                  {lists.length > 0 ? (
                    lists.map((list) => (
                      <button
                        key={list.id}
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          handleAddToList(list.id);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-colors duration-150 hover:bg-gray-800 hover:text-white"
                      >
                        <span>{list.name}</span>
                        {selectedListIds.includes(list.id) && (
                          <span className="ml-3 font-bold text-green-400" aria-label="Додано до списку">
                            ✓
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-2 text-sm text-gray-400">
                      Немає доступних списків
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
