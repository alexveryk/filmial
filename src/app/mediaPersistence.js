const STORAGE_KEY = "filmial-media-state";
const FAVORITES_LIST_ID = 3;
const WATCH_LATER_LIST_ID = 4;
const CUSTOM_LIST_IDS = [1, 2];

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const readStoredMediaState = () => {
  try {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (!storedState) return {};

    const parsedState = JSON.parse(storedState);
    return isRecord(parsedState) ? parsedState : {};
  } catch (error) {
    console.error("Не вдалося прочитати збережений стан:", error);
    return {};
  }
};

const selectListMemberships = (listsByMediaId, acceptedIds) =>
  Object.fromEntries(
    Object.entries(listsByMediaId)
      .filter(
        ([, listIds]) =>
          Array.isArray(listIds) &&
          listIds.some((listId) => acceptedIds.includes(listId))
      )
      .map(([mediaId, listIds]) => [
        mediaId,
        listIds.filter((listId) => acceptedIds.includes(listId)),
      ])
  );

export const loadPersistedMediaState = () => {
  const storedState = readStoredMediaState();
  const watchedByMediaId = isRecord(storedState.watchedByMediaId)
    ? storedState.watchedByMediaId
    : {};
  const listsByMediaId = isRecord(storedState.listsByMediaId)
    ? storedState.listsByMediaId
    : {};

  return {
    watched: { byMediaId: watchedByMediaId },
    favorites: {
      byMediaId: Object.fromEntries(
        Object.entries(
          selectListMemberships(listsByMediaId, [FAVORITES_LIST_ID])
        ).map(([mediaId]) => [mediaId, true])
      ),
    },
    watchLater: {
      byMediaId: Object.fromEntries(
        Object.entries(
          selectListMemberships(listsByMediaId, [WATCH_LATER_LIST_ID])
        ).map(([mediaId]) => [mediaId, true])
      ),
    },
    customLists: {
      byMediaId: selectListMemberships(listsByMediaId, CUSTOM_LIST_IDS),
    },
  };
};

export const persistMediaState = (state) => {
  const allMediaIds = new Set([
    ...Object.keys(state.watched.byMediaId),
    ...Object.keys(state.favorites.byMediaId),
    ...Object.keys(state.watchLater.byMediaId),
    ...Object.keys(state.customLists.byMediaId),
  ]);
  const watchedByMediaId = {};
  const listsByMediaId = {};

  allMediaIds.forEach((mediaId) => {
    if (state.watched.byMediaId[mediaId]) {
      watchedByMediaId[mediaId] = true;
    }

    const listIds = [
      ...(state.customLists.byMediaId[mediaId] || []),
      ...(state.favorites.byMediaId[mediaId] ? [FAVORITES_LIST_ID] : []),
      ...(state.watchLater.byMediaId[mediaId] ? [WATCH_LATER_LIST_ID] : []),
    ];

    if (listIds.length) {
      listsByMediaId[mediaId] = listIds;
    }
  });

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ watchedByMediaId, listsByMediaId })
    );
  } catch (error) {
    console.error("Не вдалося зберегти стан медіа:", error);
  }
};
