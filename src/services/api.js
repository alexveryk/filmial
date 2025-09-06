import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

axios.defaults.baseURL = "https://api.themoviedb.org/3/";
axios.defaults.headers.common["Authorization"] = `Bearer ${API_KEY}`;

// Movie

export const fetchMoviesTrending = async (page) => {
  try {
    const response = await axios(
      `trending/movie/day?language=uk-UK&page=${page}`
    );
    console.log("Data in API", response);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchMovieDetails = async (movie_id) => {
  try {
    const response = await axios(`movie/${movie_id}?language=uk-UK`);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchById = async (external_id) => {
  try {
    const response = await axios(`find/${external_id}`);
    return response;
  } catch (error) {
    console.log(error.message);
  }
};

export const searchMovie = async (query, page) => {
  try {
    const response = await axios(
      `search/movie?query=${query}&language=uk-UA&page=${page}`
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchMoviesPopularity = async () => {
  try {
    const response = await axios(`movie/popular?language=uk-UA`);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};

// TV SERIES

export const fetchPopularSeries = async (page) => {
  try {
    const response = await axios(`/tv/popular?page=${page}?language=uk-UK`);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchTvSeriesDetails = async (series_id) => {
  try {
    const response = await axios(`tv/${series_id}?language=uk-UK`);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};
