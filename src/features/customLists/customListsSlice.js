import { createSelector, createSlice } from "@reduxjs/toolkit";
import { restoreMediaState } from "../../app/mediaPersistence";

const initialState = {
  byMediaId: {},
  namesById: { 1: "Комедії", 2: "Романтичні" },
};
const supportedListIds = [1, 2];
const emptyListIds = [];

const customListsSlice = createSlice({
  name: "customLists",
  initialState,
  reducers: {
    clearCustomLists: () => initialState,
    toggleCustomList: (state, action) => {
      const { mediaId: rawMediaId, listId } = action.payload;
      if (!supportedListIds.includes(Number(listId)) &&
        !state.namesById[String(listId)]) return;

      const mediaId = String(rawMediaId);
      const currentListIds = state.byMediaId[mediaId] || [];
      const nextListIds = currentListIds.includes(listId)
        ? currentListIds.filter((selectedId) => selectedId !== listId)
        : [...currentListIds, listId];

      if (nextListIds.length) {
        state.byMediaId[mediaId] = nextListIds;
      } else {
        delete state.byMediaId[mediaId];
      }
    },
    createCustomList: (state, action) => {
      const name = String(action.payload || "").trim();
      if (!name) return;
      const existingId = Object.entries(state.namesById).find(
        ([, listName]) => listName.toLowerCase() === name.toLowerCase(),
      )?.[0];
      if (existingId) return;

      const numericIds = Object.keys(state.namesById).map(Number);
      const nextId = Math.max(2, ...numericIds) + 1;
      state.namesById[nextId] = name;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(restoreMediaState, (_state, action) => action.payload.customLists);
  },
});

export const {
  clearCustomLists,
  toggleCustomList,
  createCustomList,
} = customListsSlice.actions;
export const selectCustomListIds = (state, mediaId) =>
  state.customLists.byMediaId[mediaId] || emptyListIds;
export const selectCustomLists = createSelector(
  [(state) => state.customLists.namesById],
  (namesById) => Object.entries(namesById).map(([id, name]) => ({
    id: Number(id),
    name,
  })),
);
export default customListsSlice.reducer;
