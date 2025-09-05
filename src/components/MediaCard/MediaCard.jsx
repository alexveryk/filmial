export const MediaCard = ({ items }) => {
  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
      <img
        className="w-full xl:h-86 object-cover"
        src={`https://image.tmdb.org/t/p/w500/${items.poster_path}`}
        alt="Movie Poster"
      />
    </div>
  );
};
