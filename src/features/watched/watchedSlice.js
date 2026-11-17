import { createSlice } from "@reduxjs/toolkit";

const initialState = { byMediaId: {} };

const watchedSlice = createSlice({
  name: "watched",
  initialState,
  reducers: {
    toggleWatched: (state, action) => {
      const mediaId = String(action.payload);
      if (state.byMediaId[mediaId]) {
        delete state.byMediaId[mediaId];
      } else {
        state.byMediaId[mediaId] = true;
      }
    },
  },
});

export const { toggleWatched } = watchedSlice.actions;
export const selectIsWatched = (state, mediaId) =>
  Boolean(state.watched.byMediaId[mediaId]);
export default watchedSlice.reducer;
