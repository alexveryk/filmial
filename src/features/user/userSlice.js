import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      const profile = action.payload;
      state.profile = profile
        ? {
            displayName:
              typeof profile.displayName === "string"
                ? profile.displayName
                : null,
            email: typeof profile.email === "string" ? profile.email : null,
            photoURL: typeof profile.photoURL === "string" ? profile.photoURL : null,
            username: typeof profile.username === "string" ? profile.username : null,
          }
        : null;
    },
    clearUserProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export const selectUserProfile = (state) => state.user.profile;
export default userSlice.reducer;
