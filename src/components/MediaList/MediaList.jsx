import { Link } from "react-router-dom";
import { MediaCard } from "../MediaCard/MediaCard";

export const MediaList = ({ mediaItems }) => {
  return (
    <ul className="flex flex-wrap py-4 gap-2.5">
      {console.log("mediaItems ====>>>>>>>>", mediaItems)}
      {mediaItems.map((mediaItem) => (
        <li
          key={mediaItem.id}
          className="xl:w-[calc((100%/5)-8px)] lg:w-[calc((100%/4)-8px)]  md:w-[calc((100%/2)-6px)]  sm:w-full gap-2px  ">
          <Link to={`${mediaItem.id}`}>
            <MediaCard items={mediaItem} />
          </Link>
        </li>
      ))}
    </ul>
  );
};
