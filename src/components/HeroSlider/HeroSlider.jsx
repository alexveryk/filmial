import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export const HeroSlider = ({ popularMovies }) => {
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <Slider {...settings} className="mb-12">
      {popularMovies.map((popularMovie) => (
        <div key={popularMovie.id}>
          <img
            className="rounded-xl"
            src={`https://image.tmdb.org/t/p/original/${popularMovie.backdrop_path}`}
            alt={popularMovie.title}
          />
          <h3 className="font-mono text-2xl p-2">{popularMovie.title}</h3>
        </div>
      ))}
    </Slider>
  );
};
