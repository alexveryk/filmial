import { useParams } from "react-router-dom";
import { fetchById, fetchMovieDetails } from "../../services/api";
import { useEffect, useState } from "react";

export const MediaDetails = () => {
  const [MovieDetails, setMovieDetails] = useState([]);

  const { movieId } = useParams();

  useEffect(() => {
    const getMovieDetails = async () => {
      const data = await fetchMovieDetails(movieId);
      if (data) {
        setMovieDetails(data);
      }
    };

    getMovieDetails();
  }, [movieId]);

  console.log(MovieDetails);

  const valuesToString = (values) => {
    if (!values) {
      return "Порожньо, як у холодильнику після зарплати";
    }

    return values.map((value) => value.name).join(", ");
  };

  return (
    <div>
      {console.log(MediaDetails.revenue)}
      <ul>
        <li>
          backdrop_path:{" "}
          <img
            src={`https://image.tmdb.org/t/p/original/${MovieDetails.backdrop_path}`}
            alt=""
          />
        </li>
        <li>original_language {MovieDetails.original_language}</li>
        <li>original_title {MovieDetails.original_title}</li>
        <li>overview : {MovieDetails.overview}</li>
        <li>popularity : {MovieDetails.popularity}</li>
        <li>
          poster_path
          <img
            src={`https://image.tmdb.org/t/p/original/${MovieDetails.poster_path}`}
            alt=""
          />
        </li>
        <li>
          production_companies{" "}
          {valuesToString(MovieDetails.production_companies)}
        </li>
        <li>Бюджет: {MovieDetails.budget}</li>
        <li> Жанри: {valuesToString(MovieDetails.genres)}</li>
        <li>imdb_id {MovieDetails.imdb_id}</li>
        <li>Країна походження {MovieDetails.origin_country}</li>
        <li>Дата виходу: "2025-07-01"</li>
        <li>Бюджет {MovieDetails.budget}</li>
        <li>дохід {MovieDetails.revenue}</li>
        <li>status : {MovieDetails.status}</li>
        <li>tagline :{MovieDetails.tagline}</li>
        <li>title :{MovieDetails.tagline}</li>
        <li>vote_average :{MovieDetails.vote_average}</li>
        <li>vote_count : {MovieDetails.vote_average}</li>
        <li>runtime : {MovieDetails.runtime}</li>
      </ul>
    </div>
  );
};
