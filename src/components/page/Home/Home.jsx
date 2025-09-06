import { useEffect, useState } from "react";
import { HeroSlider } from "../../HeroSlider/HeroSlider";
import { fetchMoviesPopularity } from "../../../services/api";

export const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);

  useEffect(() => {
    const getPopularMovies = async () => {
      const data = await fetchMoviesPopularity();
      if (data) {
        setPopularMovies(data.results);
      }
    };

    getPopularMovies();
  }, []);

  return (
    <>
      {console.log(popularMovies)}
      <h2 className="hidden">Home</h2>
      <HeroSlider popularMovies={popularMovies} />
    </>
  );
};
