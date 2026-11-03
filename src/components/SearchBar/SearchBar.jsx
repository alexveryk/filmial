import { Search } from "lucide-react";
import { useState } from "react";

import { useNavigate } from "react-router-dom";

export const SearchBar = ({ className = "", onAction }) => {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (evt) => {
    evt.preventDefault();

    if (!search.trim()) return;

    navigate(`/search?query=${encodeURIComponent(search)}`);

    setSearch("");
    if (onAction) {
      onAction();
    }
  };

  return (
    <form
      action=""
      className={`relative w-full max-w-sm ${className}`}
      onSubmit={handleSubmit}>
      <input
        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900 pl-4 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        type="text"
        value={search}
        onChange={(evt) => setSearch(evt.target.value)}
        placeholder="Пошук..."
        aria-label="Пошук фільмів і серіалів"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center text-slate-400 transition-colors hover:text-blue-300"
        aria-label="Шукати">
        <Search size={18} />
      </button>
    </form>
  );
};
