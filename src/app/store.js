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
} from "./mediaPersistence";

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
  preloadedState: loadPersistedMediaState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tmdbApi.middleware),
});

let lastPersistedState = store.getState();

store.subscribe(() => {
  const nextState = store.getState();
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
});
