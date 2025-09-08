import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export const HeroSlider = ({ popularMovies }) => {
  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
  };
  return (
    <div className=" w-full">
      <Slider {...settings} className="w-full mb-12 ">
        {popularMovies.map((popularMovie) => (
          <div key={popularMovie.id} className="w-full relative">
            {console.log(popularMovie)}
            <img
              className="w-full h-[450px] object-cover rounded-xl"
              src={`https://image.tmdb.org/t/p/original/${popularMovie.backdrop_path}`}
              alt={popularMovie.title}
            />
            <h3
              className="font-mono text-2xl p-2 absolute bottom-0 left-0 bg-gray-800/50  w-full rounded-xl text-amber-50
            ">
              {popularMovie.title}
            </h3>
          </div>
        ))}
      </Slider>
    </div>
  );
};
