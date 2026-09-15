import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  headers: API_KEY ? { Authorization: "Bearer " + API_KEY } : {},
  params: {
    language: "uk-UA",
  },
});

const handleApiError = (error) => {
  console.error("TMDB API error:", error.response?.data || error.message);
  throw error;
};

// Movie

export const fetchMoviesTrending = async (page = 1) => {
  try {
    const response = await api.get("trending/movie/day", {
      params: { page },
    });

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await api.get(`movie/${movieId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchById = async (externalId) => {
  try {
    const response = await api.get(`find/${externalId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const searchMovie = async (query, page = 1) => {
  try {
    const response = await api.get("search/movie", {
      params: {
        query: query.trim(),
        page,
      },
    });

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchMoviesPopularity = async () => {
  try {
    const response = await api.get("movie/popular");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// TV SERIES

export const fetchPopularSeries = async (page = 1) => {
  try {
    const response = await api.get("tv/popular", {
      params: { page },
    });

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchTvSeriesDetails = async (seriesId) => {
  try {
    const response = await api.get(`tv/${seriesId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
