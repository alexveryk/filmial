import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuthUid } from "../features/auth/authSlice";
import { subscribeUserMovieGroups } from "../services/firebaseMovieGroups";
import { MovieGroupsContext } from "./movieGroupsContext.js";

export const MovieGroupsProvider = ({ children }) => {
  const uid = useSelector(selectAuthUid);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) {
      setGroups([]);
      setIsLoading(false);
      setError("");
      return undefined;
    }

    let active = true;
    setGroups([]);
    setIsLoading(true);
    setError("");

    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeUserMovieGroups(
        uid,
        (nextGroups) => {
          if (!active) return;
          setGroups(nextGroups);
          setIsLoading(false);
        },
        (subscriptionError) => {
          console.error("Не вдалося завантажити спільні добірки:", subscriptionError);
          if (!active) return;
          setError("Не вдалося завантажити спільні добірки.");
          setIsLoading(false);
        },
      );
    } catch (subscriptionError) {
      console.error("Не вдалося підписатися на спільні добірки:", subscriptionError);
      setError("Не вдалося завантажити спільні добірки.");
      setIsLoading(false);
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid]);

  return (
    <MovieGroupsContext.Provider value={{ groups, isLoading, error }}>
      {children}
    </MovieGroupsContext.Provider>
  );
};
