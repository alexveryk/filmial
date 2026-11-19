import { createSlice } from "@reduxjs/toolkit";

const initialState = { byMediaId: {}, episodesByMediaId: {} };

const watchedSlice = createSlice({
  name: "watched",
  initialState,
  reducers: {
    clearWatched: () => initialState,
    toggleWatched: (state, action) => {
      const mediaId = String(action.payload);
      if (state.byMediaId[mediaId]) {
        delete state.byMediaId[mediaId];
      } else {
        state.byMediaId[mediaId] = true;
      }
    },
    toggleEpisodeWatched: (state, action) => {
      const { mediaId, episodeKey } = action.payload;
      const id = String(mediaId);
      const episodes = state.episodesByMediaId[id] || {};
      if (episodes[episodeKey]) {
        delete episodes[episodeKey];
      } else {
        episodes[episodeKey] = true;
      }
      state.episodesByMediaId[id] = episodes;
    },
    setEpisodesWatched: (state, action) => {
      const { mediaId, episodeKeys, watched } = action.payload;
      const id = String(mediaId);
      const episodes = state.episodesByMediaId[id] || {};

      episodeKeys.forEach((episodeKey) => {
        if (watched) {
          episodes[episodeKey] = true;
        } else {
          delete episodes[episodeKey];
        }
      });

      if (Object.keys(episodes).length) {
        state.episodesByMediaId[id] = episodes;
      } else {
        delete state.episodesByMediaId[id];
      }
    },
  },
});

export const {
  clearWatched,
  toggleWatched,
  toggleEpisodeWatched,
  setEpisodesWatched,
} = watchedSlice.actions;
export const selectIsWatched = (state, mediaId) =>
  Boolean(state.watched.byMediaId[mediaId]);
export const selectWatchedEpisodes = (state, mediaId) =>
  state.watched.episodesByMediaId[String(mediaId)] || {};
export default watchedSlice.reducer;
