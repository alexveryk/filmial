import { createSlice } from "@reduxjs/toolkit";

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
});

export const { clearFavorites, toggleFavorite } = favoritesSlice.actions;
export const selectIsFavorite = (state, mediaId) =>
  Boolean(state.favorites.byMediaId[mediaId]);
export default favoritesSlice.reducer;
