import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

axios.defaults.baseURL = "https://api.themoviedb.org/3/";
axios.defaults.headers.common["Authorization"] = `Bearer ${API_KEY}`;

export const fetchMoviesTrending = async () => {
  try {
    const response = await axios("trending/movie/day?language=uk-UK");
    console.log("Data in API", response);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};


export const fetchMovieDetails = async(movie_id) => {
  try {
    const responce = await axios(`movie/${movie_id}`)
    return responce.data
  } catch (error) {
    console.log(error.message)
  }
}
