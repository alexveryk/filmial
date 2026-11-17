import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: "unauthenticated",
  uid: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthIdentity: (state, action) => {
      state.uid =
        typeof action.payload === "string" && action.payload
          ? action.payload
          : null;
      state.status = state.uid ? "authenticated" : "unauthenticated";
    },
    clearAuthIdentity: (state) => {
      state.uid = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setAuthIdentity, clearAuthIdentity } = authSlice.actions;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthUid = (state) => state.auth.uid;
export default authSlice.reducer;
