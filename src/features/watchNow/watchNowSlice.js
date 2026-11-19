import { createSlice } from "@reduxjs/toolkit";

const initialState = { byMediaId: {} };

const watchNowSlice = createSlice({
  name: "watchNow",
  initialState,
  reducers: {
    clearWatchNow: () => initialState,
    toggleWatchNow: (state, action) => {
      const mediaId = String(action.payload);
      if (state.byMediaId[mediaId]) {
        delete state.byMediaId[mediaId];
      } else {
        state.byMediaId[mediaId] = true;
      }
    },
  },
});

export const { clearWatchNow, toggleWatchNow } = watchNowSlice.actions;
export const selectIsWatchNow = (state, mediaId) =>
  Boolean(state.watchNow.byMediaId[mediaId]);
export default watchNowSlice.reducer;
