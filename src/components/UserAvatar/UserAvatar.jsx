import { useState } from "react";

export const UserAvatar = ({
  photoURL,
  fallbackText,
  imageClassName,
  fallbackClassName,
}) => {
  const [failedPhotoURL, setFailedPhotoURL] = useState(null);

  if (photoURL && photoURL !== failedPhotoURL) {
    return (
      <img
        src={photoURL}
        alt=""
        className={imageClassName}
        onError={() => setFailedPhotoURL(photoURL)}
      />
    );
  }

  return (
    <span aria-hidden="true" className={fallbackClassName}>
      {fallbackText || "?"}
    </span>
  );
};
