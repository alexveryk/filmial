import { useCallback, useEffect, useRef, useState } from "react";

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
  const [isWatched, setIsWatched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleToggleWatched = useCallback(() => {
    const nextValue = !isWatched;
    setIsWatched(nextValue);

    if (onToggleWatched) {
      onToggleWatched(items.id, nextValue);
    }
  }, [isWatched, items.id, onToggleWatched]);

  const handleAddToList = useCallback(
    (listId) => {
      if (onAddToList) {
        onAddToList(items.id, listId);
      }

      setIsOpen(false);
    },
    [items.id, onAddToList]
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
    <div className="group relative w-full overflow-hidden rounded-xl bg-gray-800 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <img
          className="h-[420px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
                isWatched
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {isWatched ? "✓ Дивився" : "○ Дивився"}
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
                  className="absolute right-0 top-[calc(100%+8px)] z-20 w-56 rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-2xl"
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
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-colors duration-150 hover:bg-gray-800 hover:text-white"
                      >
                        {list.name}
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
