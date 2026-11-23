import { createContext, useContext } from "react";

export const MovieGroupsContext = createContext({
  groups: [],
  isLoading: false,
  error: "",
});

export const useMovieGroups = () => useContext(MovieGroupsContext);
