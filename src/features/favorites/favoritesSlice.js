import { createSlice } from "@reduxjs/toolkit";
import { restoreMediaState } from "../../app/mediaPersistence";

const initialState = { byMediaId: {} };

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavorites: () => initialState,
    toggleFavorite: (state, action) => {
      const mediaId = String(action.payload);
      if (state.byMediaId[mediaId]) {
        delete state.byMediaId[mediaId];
      } else {
        state.byMediaId[mediaId] = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(restoreMediaState, (_state, action) => action.payload.favorites);
  },
});

export const { clearFavorites, toggleFavorite } = favoritesSlice.actions;
export const selectIsFavorite = (state, mediaId) =>
  Boolean(state.favorites.byMediaId[mediaId]);
export default favoritesSlice.reducer;
