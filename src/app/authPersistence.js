const AUTH_STORAGE_KEY = "filmial-auth-state";

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const loadPersistedAuthState = () => {
  try {
    const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedState) return {};

    const parsedState = JSON.parse(storedState);
    if (!isRecord(parsedState)) return {};

    const uid = typeof parsedState.uid === "string" ? parsedState.uid : null;
    const profile = isRecord(parsedState.profile) ? parsedState.profile : null;
    if (!uid || !profile) return {};

    return {
      auth: {
        status: "authenticated",
        uid,
      },
      user: {
        profile: {
          displayName:
            typeof profile.displayName === "string"
              ? profile.displayName
              : null,
          email: typeof profile.email === "string" ? profile.email : null,
          photoURL:
            typeof profile.photoURL === "string" ? profile.photoURL : null,
          username:
            typeof profile.username === "string" ? profile.username : null,
        },
      },
    };
  } catch (error) {
    console.error("Не вдалося прочитати стан авторизації:", error);
    return {};
  }
};

export const persistAuthState = (state) => {
  try {
    if (state.auth.status !== "authenticated" || !state.auth.uid) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        uid: state.auth.uid,
        profile: state.user.profile,
      })
    );
  } catch (error) {
    console.error("Не вдалося зберегти стан авторизації:", error);
  }
};
