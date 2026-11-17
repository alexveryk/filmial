import { MediaCard } from "../MediaCard/MediaCard";

export const MediaList = ({ mediaItems, listType = "movies" }) => {
  return (
    <ul className="grid grid-cols-2 gap-4 pb-6 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 xl:grid-cols-5">
      {mediaItems.map((mediaItem) => {
        const mediaId = mediaItem.id;
        const itemListType =
          listType === "search"
            ? mediaItem.media_type === "tv"
              ? "serials"
              : "movies"
            : listType;
        const itemKey = `${itemListType}-${mediaId}`;
        const linkTo = `/${itemListType}/${mediaId}`;

        return (
          <li key={itemKey} className="min-w-0">
            <MediaCard items={mediaItem} linkTo={linkTo} />
          </li>
        );
      })}
    </ul>
  );
};
