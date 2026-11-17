import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movieSortBy: "popularity.desc",
  seriesSortBy: "popularity.desc",
  selectedGenres: [],
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setMovieSortBy: (state, action) => {
      state.movieSortBy = action.payload;
    },
    setSeriesSortBy: (state, action) => {
      state.seriesSortBy = action.payload;
    },
    setSelectedGenres: (state, action) => {
      state.selectedGenres = action.payload;
    },
  },
});

export const { setMovieSortBy, setSeriesSortBy, setSelectedGenres } =
  filtersSlice.actions;
export const selectMovieSortBy = (state) => state.filters.movieSortBy;
export const selectSeriesSortBy = (state) => state.filters.seriesSortBy;
export const selectSelectedGenres = (state) => state.filters.selectedGenres;
export default filtersSlice.reducer;
