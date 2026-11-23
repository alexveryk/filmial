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
      const payload = action.payload;
      const name = String(
        typeof payload === "object" && payload ? payload.name || "" : payload || "",
      ).trim();
      if (!name) return;
      const existingId = Object.entries(state.namesById).find(
        ([, listName]) => listName.toLowerCase() === name.toLowerCase(),
      )?.[0];
      if (existingId) {
        if (typeof payload === "object" && payload?.mediaId != null) {
          const mediaId = String(payload.mediaId);
          const existingListId = Number(existingId);
          const currentListIds = state.byMediaId[mediaId] || [];
          if (!currentListIds.some((listId) => String(listId) === existingId)) {
            state.byMediaId[mediaId] = [...currentListIds, existingListId];
          }
        }
        return;
      }

      const numericIds = Object.keys(state.namesById).map(Number);
      let nextId = Math.max(2, ...numericIds) + 1;
      while (nextId === 3 || nextId === 4 || state.namesById[nextId]) {
        nextId += 1;
      }
      state.namesById[nextId] = name;

      if (typeof payload === "object" && payload?.mediaId != null) {
        const mediaId = String(payload.mediaId);
        const currentListIds = state.byMediaId[mediaId] || [];
        state.byMediaId[mediaId] = [...currentListIds, nextId];
      }
    },
    renameCustomList: (state, action) => {
      const { id: rawId, name: rawName } = action.payload || {};
      const id = String(rawId);
      const name = String(rawName || "").trim();
      if (!state.namesById[id] || !name || name.length > 40) return;

      const duplicateName = Object.entries(state.namesById).some(
        ([existingId, existingName]) =>
          existingId !== id &&
          existingName.toLowerCase() === name.toLowerCase(),
      );
      if (duplicateName) return;

      state.namesById[id] = name;
    },
    deleteCustomList: (state, action) => {
      const id = String(action.payload);
      if (!state.namesById[id]) return;

      delete state.namesById[id];
      Object.entries(state.byMediaId).forEach(([mediaId, listIds]) => {
        const remainingListIds = listIds.filter(
          (listId) => String(listId) !== id,
        );
        if (remainingListIds.length) {
          state.byMediaId[mediaId] = remainingListIds;
        } else {
          delete state.byMediaId[mediaId];
        }
      });
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
  renameCustomList,
  deleteCustomList,
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
