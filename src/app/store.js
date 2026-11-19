import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import favoritesReducer from "../features/favorites/favoritesSlice";
import watchedReducer from "../features/watched/watchedSlice";
import watchLaterReducer from "../features/watchLater/watchLaterSlice";
import watchNowReducer from "../features/watchNow/watchNowSlice";
import customListsReducer from "../features/customLists/customListsSlice";
import filtersReducer from "../features/filters/filtersSlice";
import { tmdbApi } from "../services/tmdbApi";
import {
  loadPersistedMediaState,
  persistMediaState,
  serializeMediaState,
} from "./mediaPersistence";
import {
  loadPersistedAuthState,
  persistAuthState,
} from "./authPersistence";
import {
  isCloudMediaSyncUser,
  saveCloudMediaState,
} from "../services/firebaseMedia";

const persistedAuthState = loadPersistedAuthState();
const persistedMediaState = loadPersistedMediaState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    favorites: favoritesReducer,
    watched: watchedReducer,
    watchLater: watchLaterReducer,
    watchNow: watchNowReducer,
    customLists: customListsReducer,
    filters: filtersReducer,
    [tmdbApi.reducerPath]: tmdbApi.reducer,
  },
  preloadedState: {
    ...persistedMediaState,
    ...persistedAuthState,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tmdbApi.middleware),
});

let lastPersistedState = store.getState();

store.subscribe(() => {
  const nextState = store.getState();
  persistAuthState(nextState);
  if (
    nextState.watched === lastPersistedState.watched &&
    nextState.favorites === lastPersistedState.favorites &&
    nextState.watchLater === lastPersistedState.watchLater &&
    nextState.watchNow === lastPersistedState.watchNow &&
    nextState.customLists === lastPersistedState.customLists
  ) {
    return;
  }

  lastPersistedState = nextState;
  persistMediaState(nextState);

  if (nextState.auth.uid && isCloudMediaSyncUser(nextState.auth.uid)) {
    saveCloudMediaState(nextState.auth.uid, serializeMediaState(nextState)).catch(
      (error) => console.error("Не вдалося зберегти списки у Firebase:", error)
    );
  }
});
