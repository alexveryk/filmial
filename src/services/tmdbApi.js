import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = "https://api.themoviedb.org/3/";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const withLanguage = (params = {}) => ({ language: "uk-UA", ...params });

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    if (API_KEY) {
      headers.set("Authorization", `Bearer ${API_KEY}`);
    }
    return headers;
  },
});

export const tmdbApi = createApi({
  reducerPath: "tmdbApi",
  baseQuery,
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getTrendingMovies: builder.query({
      query: (page = 1) => ({
        url: "trending/movie/day",
        params: withLanguage({ page }),
      }),
    }),
    getPopularMovies: builder.query({
      query: () => ({
        url: "movie/popular",
        params: withLanguage(),
      }),
    }),
    getNowPlayingMovies: builder.query({
      query: () => ({
        url: "movie/now_playing",
        params: withLanguage(),
      }),
    }),
    getMoviesByGenre: builder.query({
      query: ({ genreId, page = 1 }) => ({
        url: "discover/movie",
        params: withLanguage({
          with_genres: genreId,
          sort_by: "popularity.desc",
          page,
        }),
      }),
    }),
    getPopularSeries: builder.query({
      query: (page = 1) => ({
        url: "tv/popular",
        params: withLanguage({ page }),
      }),
    }),
    searchMovies: builder.query({
      query: ({ query, page = 1 }) => ({
        url: "search/movie",
        params: withLanguage({ query: query.trim(), page }),
      }),
    }),
    searchMulti: builder.query({
      query: ({ query, page = 1 }) => ({
        url: "search/multi",
        params: withLanguage({
          query: query.trim(),
          page,
          include_adult: false,
        }),
      }),
    }),
    getMediaDetails: builder.query({
      async queryFn({ id, mediaType }, _queryApi, _extraOptions, runBaseQuery) {
        const mediaTypes =
          mediaType === "unknown" ? ["movie", "tv"] : [mediaType];

        for (const type of mediaTypes) {
          const result = await runBaseQuery({
            url: `${type}/${id}`,
            params: withLanguage(),
          });

          if (!result.error) {
            return {
              data: { ...result.data, media_type: type },
            };
          }

          if (
            mediaType !== "unknown" ||
            result.error.status !== 404 ||
            type === mediaTypes[mediaTypes.length - 1]
          ) {
            return result;
          }
        }

        return {
          error: {
            status: "CUSTOM_ERROR",
            error: "Не вдалося знайти фільм або серіал.",
          },
        };
      },
    }),
    getMediaVideos: builder.query({
      query: ({ id, mediaType }) => ({
        url: `${mediaType}/${id}/videos`,
        params: withLanguage({
          include_video_language: "uk-UA,en-US,null",
        }),
      }),
    }),
    getMediaCredits: builder.query({
      query: ({ id, mediaType }) => ({
        url: `${mediaType}/${id}/${mediaType === "tv" ? "aggregate_credits" : "credits"}`,
        params: withLanguage(),
      }),
    }),
  }),
});

export const {
  useGetTrendingMoviesQuery,
  useGetPopularMoviesQuery,
  useGetNowPlayingMoviesQuery,
  useGetMoviesByGenreQuery,
  useGetPopularSeriesQuery,
  useSearchMoviesQuery,
  useSearchMultiQuery,
  useGetMediaDetailsQuery,
  useGetMediaVideosQuery,
  useGetMediaCreditsQuery,
} = tmdbApi;
