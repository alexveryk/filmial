import { createSlice } from "@reduxjs/toolkit";

const initialState = { byMediaId: {} };

const watchLaterSlice = createSlice({
  name: "watchLater",
  initialState,
  reducers: {
    clearWatchLater: () => initialState,
    toggleWatchLater: (state, action) => {
      const mediaId = String(action.payload);
      if (state.byMediaId[mediaId]) {
        delete state.byMediaId[mediaId];
      } else {
        state.byMediaId[mediaId] = true;
      }
    },
  },
});

export const { clearWatchLater, toggleWatchLater } = watchLaterSlice.actions;
export const selectIsWatchLater = (state, mediaId) =>
  Boolean(state.watchLater.byMediaId[mediaId]);
export default watchLaterSlice.reducer;
