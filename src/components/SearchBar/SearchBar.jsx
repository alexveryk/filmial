import { Search } from "lucide-react";
import { useState } from "react";

import { useNavigate } from "react-router-dom";

export const SearchBar = () => {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (evt) => {
    evt.preventDefault();

    if (!search.trim()) return;

    navigate(`/search?query=${encodeURIComponent(search)}`);

    setSearch("");
  };

  return (
    <form
      action=""
      className="relative text-black w-3xs h-8 hidden md:flex"
      onSubmit={handleSubmit}>
      <input
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-full max-w-xs pr-8 h-8 pl-2 bg-white  rounded-sm"
        type="text"
        value={search}
        onChange={(evt) => setSearch(evt.target.value)}
        placeholder="Пошук..."
      />
      <button
        type="submit"
        className="absolute right-5 top-1/2 transform -translate-y-1/2">
        <Search />
      </button>
    </form>
  );
};
