import { Link } from "react-router-dom";
import { MediaCard } from "../MediaCard/MediaCard";

export const MediaList = ({ mediaItems }) => {
  return (
    <ul className="flex flex-wrap p-4 gap-2.5">
      {console.log("mediaItems ====>>>>>>>>", mediaItems)}
      {mediaItems.map((mediaItem) => (
        <li key={mediaItem.id} className="w-[calc((100%/5)-8px)] gap-2px">
          <Link to={`${mediaItem.id}`}>
            <MediaCard items={mediaItem} />
          </Link>
        </li>
      ))}
    </ul>
  );
};
