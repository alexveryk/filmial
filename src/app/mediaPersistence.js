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
  const watchNowByMediaId = isRecord(storedState.watchNowByMediaId)
    ? storedState.watchNowByMediaId
    : {};
  const watchedEpisodesByMediaId = isRecord(storedState.watchedEpisodesByMediaId)
    ? storedState.watchedEpisodesByMediaId
    : {};
  const listsByMediaId = isRecord(storedState.listsByMediaId)
    ? storedState.listsByMediaId
    : {};
  const customListNames = isRecord(storedState.customListNames)
    ? storedState.customListNames
    : { 1: "Комедії", 2: "Романтичні" };

  return {
    watched: {
      byMediaId: watchedByMediaId,
      episodesByMediaId: watchedEpisodesByMediaId,
    },
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
    watchNow: { byMediaId: watchNowByMediaId },
    customLists: {
      byMediaId: selectListMemberships(
        listsByMediaId,
        Object.keys(customListNames).map(Number),
      ),
      namesById: customListNames,
    },
  };
};

export const persistMediaState = (state) => {
  const allMediaIds = new Set([
    ...Object.keys(state.watched.byMediaId),
    ...Object.keys(state.watched.episodesByMediaId || {}),
    ...Object.keys(state.watchNow.byMediaId),
    ...Object.keys(state.favorites.byMediaId),
    ...Object.keys(state.watchLater.byMediaId),
    ...Object.keys(state.customLists.byMediaId),
  ]);
  const watchedByMediaId = {};
  const watchNowByMediaId = {};
  const watchedEpisodesByMediaId = {};
  const listsByMediaId = {};
  const customListNames = state.customLists.namesById || {
    1: "Комедії",
    2: "Романтичні",
  };

  allMediaIds.forEach((mediaId) => {
    if (state.watched.byMediaId[mediaId]) {
      watchedByMediaId[mediaId] = true;
    }
    if (state.watchNow.byMediaId[mediaId]) {
      watchNowByMediaId[mediaId] = true;
    }
    const episodeKeys = state.watched.episodesByMediaId?.[mediaId];
    if (isRecord(episodeKeys) && Object.keys(episodeKeys).length) {
      watchedEpisodesByMediaId[mediaId] = episodeKeys;
    }

    const listIds = [
      ...(state.customLists.byMediaId[mediaId] || []),
      ...(state.favorites.byMediaId[mediaId] ? [FAVORITES_LIST_ID] : []),
      ...(state.watchLater.byMediaId[mediaId] ? [WATCH_LATER_LIST_ID] : []),
      ...(state.watchNow.byMediaId[mediaId] ? ["watch-now"] : []),
    ];

    if (listIds.length) {
      listsByMediaId[mediaId] = listIds;
    }
  });

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        watchedByMediaId,
        watchNowByMediaId,
        watchedEpisodesByMediaId,
        listsByMediaId,
        customListNames,
      })
    );
  } catch (error) {
    console.error("Не вдалося зберегти стан медіа:", error);
  }
};
