import { createSlice } from "@reduxjs/toolkit";

const initialState = { byMediaId: {} };
const supportedListIds = [1, 2];
const emptyListIds = [];

const customListsSlice = createSlice({
  name: "customLists",
  initialState,
  reducers: {
    toggleCustomList: (state, action) => {
      const { mediaId: rawMediaId, listId } = action.payload;
      if (!supportedListIds.includes(listId)) return;

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
  },
});

export const { toggleCustomList } = customListsSlice.actions;
export const selectCustomListIds = (state, mediaId) =>
  state.customLists.byMediaId[mediaId] || emptyListIds;
export default customListsSlice.reducer;
