/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "filmial-media-state";

const initialState = {
  watchedByMediaId: {},
  listsByMediaId: {},
};

const MediaStateContext = createContext(null);

const readStoredState = () => {
  const storedState = localStorage.getItem(STORAGE_KEY);

  if (!storedState) {
    return initialState;
  }

  try {
    const parsedState = JSON.parse(storedState);

    return {
      watchedByMediaId: parsedState.watchedByMediaId || {},
      listsByMediaId: parsedState.listsByMediaId || {},
    };
  } catch (error) {
    console.error("Не вдалося прочитати збережений стан:", error);
    return initialState;
  }
};

export const MediaStateProvider = ({ children }) => {
  const [mediaState, setMediaState] = useState(readStoredState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaState));
  }, [mediaState]);

  const value = useMemo(
    () => ({
      isWatched: (mediaId) => Boolean(mediaState.watchedByMediaId[mediaId]),
      getSelectedListIds: (mediaId) =>
        mediaState.listsByMediaId[mediaId] || [],
      toggleWatched: (mediaId) => {
        setMediaState((previous) => ({
          ...previous,
          watchedByMediaId: {
            ...previous.watchedByMediaId,
            [mediaId]: !previous.watchedByMediaId[mediaId],
          },
        }));
      },
      toggleList: (mediaId, listId) => {
        setMediaState((previous) => {
          const selectedListIds = previous.listsByMediaId[mediaId] || [];
          const nextListIds = selectedListIds.includes(listId)
            ? selectedListIds.filter((selectedId) => selectedId !== listId)
            : [...selectedListIds, listId];

          return {
            ...previous,
            listsByMediaId: {
              ...previous.listsByMediaId,
              [mediaId]: nextListIds,
            },
          };
        });
      },
    }),
    [mediaState]
  );

  return (
    <MediaStateContext.Provider value={value}>
      {children}
    </MediaStateContext.Provider>
  );
};

export const useMediaState = () => {
  const context = useContext(MediaStateContext);

  if (!context) {
    throw new Error("useMediaState має використовуватися всередині MediaStateProvider");
  }

  return context;
};
