export const MediaCard = ({ items }) => {
  // const reliseDate = (date) => {
  //   const [year, month, day] = date.split("-");
  //   return `${day}.${month}.${year}`;
  // };

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
      <img
        className="w-full h-96 object-cover"
        src={`https://image.tmdb.org/t/p/w500/${items.poster_path}`}
        alt="Movie Poster"
      />
    </div>
  );
};
