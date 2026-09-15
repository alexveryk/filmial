import { Link } from "react-router-dom";
import { MediaCard } from "../MediaCard/MediaCard";

export const MediaList = ({ mediaItems, listType = "movies" }) => {
  return (
    <ul className="flex flex-wrap gap-2.5 py-4">
      {mediaItems.map((mediaItem) => {
        const mediaId = mediaItem.id;
        const itemKey = `${listType}-${mediaId}`;
        const linkTo = `/${listType}/${mediaId}`;

        return (
          <li
            key={itemKey}
            className="sm:w-full md:w-[calc((100%/2)-6px)] lg:w-[calc((100%/4)-8px)] xl:w-[calc((100%/5)-8px)]"
          >
            <Link to={linkTo} className="block h-full">
              <MediaCard items={mediaItem} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
